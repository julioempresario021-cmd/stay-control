"""Servidor local da demonstração STAYCONTROL, sem dependências externas."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import glob
import json
import os
import re
import socket
import threading
import queue
import time
import webbrowser
from mobile_notifications import Notifications

ROOT = Path(__file__).resolve().parent / "dist"
MOBILE = None


class SerialBridge:
    def __init__(self, requested=""):
        self.requested = requested
        self.serial = None
        self.port = ""
        self.lock = threading.Lock()
        self.replies = queue.Queue()
        self.sensors = {}
        self.relays = {}
        self.last_error = ''
        if requested:
            self.connect()

    def connect(self):
        try:
            import serial
        except ImportError:
            return False
        candidates = [self.requested] if self.requested and self.requested != "auto" else glob.glob("/dev/ttyACM*") + glob.glob("/dev/ttyUSB*")
        for port in candidates:
            try:
                self.serial = serial.Serial(port, 115200, timeout=0.2)
                self.sensors = {}
                self.relays = {}
                self.port = port
                threading.Thread(target=self._reader, daemon=True).start()
                print("Arduino conectado em", port)
                return True
            except Exception as error:
                print("Não foi possível abrir", port, "-", error)
        return False

    def _reader(self):
        while self.serial and self.serial.is_open:
            try:
                line = self.serial.readline().decode("utf-8", "replace").strip()
                if line:
                    print("ARDUINO:", line)
                    parts = line.split()
                    if len(parts) == 4 and parts[0] in ('STATE', 'EVENT') and parts[1] == 'SENSOR':
                        self.sensors[parts[2]] = parts[3] == 'OPEN'
                        if MOBILE: MOBILE.sensor(int(parts[2]),parts[3]=='OPEN')
                    elif len(parts) == 4 and parts[:2] == ['STATE', 'RELAY']:
                        self.relays[parts[2]] = parts[3] == 'ON'
                    if line.startswith(('OK ', 'ERR ')):
                        self.replies.put(line)
            except Exception:
                break
        self.serial = None

    @property
    def connected(self):
        return bool(self.serial and self.serial.is_open)

    def send(self, command):
        if not self.connected and self.requested:
            self.connect()
        if not self.connected:
            raise RuntimeError("Controlador Arduino desconectado.")
        if not re.fullmatch(r"(?:PING|GET STATE|GET INPUTS|ALL OFF|RELAY (?:[1-9]|1[0-6]) (?:ON|OFF)|STATUS (?:FREE|OCCUPIED|CLEANING|WAITING)|RGB (?:\d{1,3} ){3}\d{1,3})", command):
            raise ValueError("Comando de hardware inválido.")
        if command.startswith('RGB '):
            values = list(map(int, command.split()[1:]))
            if any(v > 255 for v in values[:3]) or values[3] > 100:
                raise ValueError('RGB fora do intervalo permitido.')
        with self.lock:
            while not self.replies.empty():
                self.replies.get_nowait()
            self.serial.write((command + "\n").encode("ascii"))
            try:
                reply = self.replies.get(timeout=3)
            except queue.Empty:
                self.last_error = 'Controlador não confirmou o comando. Confira a conexão.'
                raise RuntimeError(self.last_error)
            if reply.startswith('ERR '):
                self.last_error = reply
                raise RuntimeError('Controlador recusou o comando: ' + reply)
            self.last_error = ''
            if command.startswith('RELAY '):
                _, channel, value = command.split()
                self.relays[channel] = value == 'ON'
            elif command == 'ALL OFF':
                self.relays = {str(i): False for i in range(1,17)}
            return reply


BRIDGE = SerialBridge()


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def mobile_token(self):
        return self.headers.get('Authorization','').removeprefix('Bearer ').strip()

    def mobile_post(self,path,payload):
        if not MOBILE:raise RuntimeError('Serviço móvel indisponível.')
        token=self.mobile_token()
        if path=='/api/mobile/login':return {'ok':True,'token':MOBILE.login(payload.get('pin'),self.client_address[0])}
        if path in ('/api/mobile/read','/api/mobile/subscribe'):
            if not MOBILE.client(token):raise PermissionError('Celular não vinculado. Confira o código da central.')
            if path.endswith('/read'):MOBILE.mark_read(token,payload.get('id'))
            else:MOBILE.subscribe(token,payload.get('subscription',{}))
            return {'ok':True}
        if not MOBILE.admin(token):raise PermissionError('Entre como administrador para esta ação.')
        if path=='/api/mobile/config':MOBILE.configure(payload)
        elif path=='/api/mobile/pair':return {'ok':True,'token':MOBILE.pair(payload.get('name'))}
        elif path=='/api/mobile/revoke':MOBILE.revoke(payload.get('id'))
        elif path=='/api/mobile/sensor':MOBILE.sensor(payload.get('index'),payload.get('open'),'simulation')
        elif path=='/api/mobile/test':MOBILE.record('Notificação de teste','A central está conectada ao aplicativo do celular.','info','test')
        else:raise ValueError('Recurso móvel não encontrado.')
        return {'ok':True}

    def do_GET(self):
        path=self.path.split('?',1)[0]
        if path.startswith('/api/mobile/'):
            if not MOBILE:self.send_json(503,{'error':'Serviço móvel indisponível.'});return
            token=self.mobile_token()
            if path=='/api/mobile/feed' and MOBILE.client(token):self.send_json(200,{'items':MOBILE.feed(token),'push':MOBILE.push_status(),'armed':MOBILE.config.get('armed',False)});return
            if path=='/api/mobile/admin/status' and MOBILE.admin(token):self.send_json(200,{'devices':MOBILE.devices(),'push':MOBILE.push_status(),'config':MOBILE.config});return
            self.send_json(403,{'error':'Acesso móvel não autorizado.'});return
        if self.path.split("?", 1)[0] == "/api/hardware/status":
            self.send_json(200, {"connected": BRIDGE.connected, "port": BRIDGE.port, "sensors": dict(BRIDGE.sensors), "relays": dict(BRIDGE.relays), "error": BRIDGE.last_error})
            return
        super().do_GET()

    def do_POST(self):
        path=self.path.split('?',1)[0]
        if path != '/api/hardware' and not path.startswith('/api/mobile/'):
            self.send_json(404, {"error": "Recurso não encontrado."})
            return
        try:
            if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                raise ValueError('Use JSON para enviar comandos.')
            origin = self.headers.get('Origin')
            if origin and origin not in ('http://' + self.headers.get('Host', ''), 'https://' + self.headers.get('Host', '')):
                self.send_json(403, {'ok': False, 'error': 'Origem não autorizada.'})
                return
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > (32768 if path.startswith('/api/mobile/') else 1024):
                raise ValueError("Tamanho inválido.")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload,dict):raise ValueError('Objeto JSON inválido.')
            if path.startswith('/api/mobile/'):
                self.send_json(200,self.mobile_post(path,payload));return
            command = str(payload.get("command", "")).strip().upper()
            reply = BRIDGE.send(command)
            self.send_json(200, {"ok": True, "command": command, "reply": reply})
        except PermissionError as error:
            self.send_json(403,{'ok':False,'error':str(error)})
        except RuntimeError as error:
            self.send_json(503, {"ok": False, "error": str(error)})
        except Exception as error:
            self.send_json(400, {"ok": False, "error": str(error)})

    def log_message(self, fmt, *args):
        print("STAYCONTROL:", fmt % args)


def available_port(first):
    for port in range(first, first + 10):
        with socket.socket() as probe:
            try:
                probe.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("Nenhuma porta livre entre %d e %d." % (first, first + 9))


def main():
    parser = argparse.ArgumentParser(description="Inicia a demonstração local da STAYCONTROL.")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--network", action="store_true", help="Permite acesso por outros aparelhos na mesma rede.")
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--serial", default=os.environ.get("STAYCONTROL_SERIAL_PORT", ""), help="Porta do Arduino, por exemplo /dev/ttyACM0 ou auto.")
    args = parser.parse_args()
    global BRIDGE, MOBILE
    MOBILE=Notifications(os.environ.get('STAYCONTROL_DATA_DIR',str(Path(__file__).resolve().parent/'data')))
    BRIDGE = SerialBridge(args.serial)
    port = available_port(args.port)
    host = "0.0.0.0" if args.network else "127.0.0.1"
    url = f"http://127.0.0.1:{port}/"
    server = ThreadingHTTPServer((host, port), Handler)
    print("\nSTAYCONTROL iniciada em", url)
    print("Pressione Ctrl+C para encerrar.\n")
    if not args.no_browser:
        threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSTAYCONTROL encerrada.")
    finally:
        server.server_close()


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
