"""Histórico persistente, vinculação de celulares e Web Push opcional."""
from pathlib import Path
import os, json, sqlite3, secrets, hashlib, hmac, time, threading, uuid
from datetime import datetime, timezone
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from contextlib import contextmanager

class Notifications:
    def __init__(self, directory):
        self.directory=Path(directory);self.directory.mkdir(parents=True,exist_ok=True)
        self.path=self.directory/'notifications.sqlite3'
        self.lock=threading.RLock();self.sessions={};self.attempts={};self.push_error=''
        with self.db() as db:
            db.executescript('''CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);
            CREATE TABLE IF NOT EXISTS devices(token TEXT PRIMARY KEY,name TEXT,subscription TEXT);
            CREATE TABLE IF NOT EXISTS notices(id TEXT PRIMARY KEY,title TEXT,body TEXT,severity TEXT,at TEXT,source TEXT);
            CREATE TABLE IF NOT EXISTS reads(token TEXT,id TEXT,PRIMARY KEY(token,id));''')
        self.config=self.setting('monitoring') or {'armed':False,'sensors':[]}
        self.values={}
    @contextmanager
    def db(self):
        db=sqlite3.connect(self.path,timeout=5)
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:db.close()
    def setting(self,key):
        with self.db() as db: row=db.execute('SELECT value FROM settings WHERE key=?',(key,)).fetchone()
        return json.loads(row[0]) if row else None
    @staticmethod
    def digest(token):return hashlib.sha256(token.encode()).hexdigest()
    def login(self,pin,ip):
        now=time.time();tries=self.attempts.setdefault(ip,[]);tries[:]=[t for t in tries if now-t<60]
        if len(tries)>=5:raise PermissionError('Aguarde um minuto antes de tentar novamente.')
        tries.append(now)
        if not isinstance(pin,str) or not hmac.compare_digest(pin,os.environ.get('STAYCONTROL_ADMIN_PIN','1215')):raise PermissionError('PIN incorreto.')
        token=secrets.token_urlsafe(32);self.sessions[token]=now+600;return token
    def admin(self,token):return self.sessions.get(token,0)>time.time()
    def client(self,token):
        with self.db() as db:return db.execute('SELECT token FROM devices WHERE token=?',(self.digest(token),)).fetchone() is not None
    def pair(self,name):
        if not isinstance(name,str) or not name.strip():raise ValueError('Informe o nome do celular.')
        token=secrets.token_urlsafe(32)
        with self.db() as db:db.execute('INSERT INTO devices VALUES(?,?,?)',(self.digest(token),name.strip()[:60],None))
        return token
    def devices(self):
        with self.db() as db:return [{'id':r[0],'name':r[1],'push':bool(r[2])} for r in db.execute('SELECT token,name,subscription FROM devices')]
    def revoke(self,device):
        with self.db() as db:
            db.execute('DELETE FROM devices WHERE token=?',(device,));db.execute('DELETE FROM reads WHERE token=?',(device,))
    def configure(self,payload):
        if type(payload.get('armed')) is not bool or not isinstance(payload.get('sensors'),list) or len(payload['sensors'])!=8:raise ValueError('Configuração de sensores inválida.')
        sensors=[]
        for sensor in payload['sensors']:
            if type(sensor.get('enabled')) is not bool or not isinstance(sensor.get('label'),str) or not sensor['label'].strip():raise ValueError('Sensor inválido.')
            sensors.append({'label':sensor['label'].strip()[:50],'enabled':sensor['enabled']})
        if payload['armed'] and (not any(s['enabled'] for s in sensors) or any(self.values.get(str(i+1)) is True and s['enabled'] for i,s in enumerate(sensors))):raise ValueError('Feche os sensores habilitados antes de ativar.')
        old=self.config.get('armed');self.config={'armed':payload['armed'],'sensors':sensors}
        with self.db() as db:db.execute('INSERT OR REPLACE INTO settings VALUES(?,?)',('monitoring',json.dumps(self.config)))
        if old!=payload['armed']:self.record('Monitoramento '+('ativado' if payload['armed'] else 'desativado'),'Configuração atualizada pelo administrador.','info','central')
    def sensor(self,index,opened,source='hardware'):
        if index not in range(1,9) or type(opened) is not bool:raise ValueError('Entrada inválida.')
        with self.lock:
            key=str(index);prior=self.values.get(key);self.values[key]=opened
            if source=='hardware' and prior!=opened:
                threading.Thread(target=self.publish_cloud_sensor,args=(index,opened),daemon=True).start()
            # A primeira leitura fechada inicializa o contato sem criar um evento.
            if prior==opened or (prior is None and not opened):return None
            sensors=self.config.get('sensors',[])
            if len(sensors)!=8:return None
            sensor=sensors[index-1]
            if not sensor['enabled']:return None
            alarm=opened and self.config['armed']
            return self.record('Abertura detectada' if alarm else 'Sensor '+('aberto' if opened else 'fechado'),sensor['label']+' · '+('aberto' if opened else 'fechado')+(' · demonstração' if source=='simulation' else ''),'alert' if alarm else 'info',source)
    @staticmethod
    def publish_cloud_sensor(index,opened):
        base=os.environ.get('STAYCONTROL_CLOUD_URL','').strip().rstrip('/')
        token=os.environ.get('STAYCONTROL_PI_TOKEN','').strip()
        if not base or not token:return
        parsed=urlparse(base)
        if parsed.scheme!='https' or not parsed.hostname:return
        try:
            request=Request(base+'/api/mobile/pi/sensor',data=json.dumps({'index':index,'open':opened}).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer '+token},method='POST')
            with urlopen(request,timeout=8) as response:
                if response.status >= 300:raise RuntimeError('Cloud sensor event rejected')
        except Exception as error:
            print('STAYCONTROL: não foi possível sincronizar evento do sensor com a nuvem:',type(error).__name__)
    def record(self,title,body,severity='info',source='central'):
        notice={'id':str(uuid.uuid4()),'title':title,'body':body,'severity':severity,'at':datetime.now(timezone.utc).isoformat(),'source':source}
        with self.db() as db:
            db.execute('INSERT INTO notices VALUES(?,?,?,?,?,?)',tuple(notice[k] for k in ('id','title','body','severity','at','source')))
            db.execute('DELETE FROM notices WHERE id NOT IN (SELECT id FROM notices ORDER BY at DESC LIMIT 500)')
            db.execute('DELETE FROM reads WHERE id NOT IN (SELECT id FROM notices)')
        threading.Thread(target=self.push,args=(notice,),daemon=True).start()
        return notice
    def feed(self,token):
        with self.db() as db:
            rows=db.execute('SELECT n.id,n.title,n.body,n.severity,n.at,n.source,r.id FROM notices n LEFT JOIN reads r ON r.id=n.id AND r.token=? ORDER BY n.at DESC LIMIT 500',(self.digest(token),)).fetchall()
        return [{**dict(zip(('id','title','body','severity','at','source'),r[:6])),'read':r[6] is not None} for r in rows]
    def mark_read(self,token,notice):
        with self.db() as db:
            if notice=='all':db.execute('INSERT OR IGNORE INTO reads SELECT ?,id FROM notices',(self.digest(token),))
            elif db.execute('SELECT id FROM notices WHERE id=?',(notice,)).fetchone():db.execute('INSERT OR IGNORE INTO reads VALUES(?,?)',(self.digest(token),notice))
            else:raise ValueError('Notificação não encontrada.')
    def push_status(self):
        key=self.directory/'vapid_private.pem';public=self.directory/'vapid_public.txt'
        contact=self.directory/'vapid_subject.txt'
        try:import pywebpush;ready=key.exists() and public.exists() and (contact.exists() or bool(os.environ.get('STAYCONTROL_VAPID_SUBJECT')))
        except ImportError:ready=False
        return {'ready':ready,'publicKey':public.read_text().strip() if ready else '', 'error':self.push_error}
    def subscribe(self,token,subscription):
        endpoint=subscription.get('endpoint','');host=urlparse(endpoint).hostname or ''
        allowed=('fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com')
        if urlparse(endpoint).scheme!='https' or not (host in allowed or host.endswith('.notify.windows.com') or host.endswith('.push.apple.com')):raise ValueError('Serviço push não permitido.')
        keys=subscription.get('keys',{})
        if not all(isinstance(keys.get(k),str) and 8<len(keys[k])<512 for k in ('p256dh','auth')):raise ValueError('Assinatura inválida.')
        with self.db() as db:db.execute('UPDATE devices SET subscription=? WHERE token=?',(json.dumps(subscription),self.digest(token)))
    def push(self,notice):
        if not self.push_status()['ready']:return
        from pywebpush import webpush,WebPushException
        with self.db() as db:devices=list(db.execute('SELECT token,subscription FROM devices WHERE subscription IS NOT NULL'))
        for token,subscription in devices:
            try:
                subject=os.environ.get('STAYCONTROL_VAPID_SUBJECT') or (self.directory/'vapid_subject.txt').read_text().strip()
                webpush(subscription_info=json.loads(subscription),data=json.dumps(notice),vapid_private_key=str(self.directory/'vapid_private.pem'),vapid_claims={'sub':subject},timeout=10,ttl=300)
            except WebPushException as error:
                if error.response is not None and error.response.status_code in (404,410):
                    with self.db() as db:db.execute('UPDATE devices SET subscription=NULL WHERE token=?',(token,))
                self.push_error='Falha ao entregar push. O aviso permanece no histórico.'
            except Exception:self.push_error='Falha de conexão com o serviço push.'
