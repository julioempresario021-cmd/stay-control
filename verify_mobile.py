import tempfile, unittest
from mobile_notifications import Notifications
class MobileTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.store=Notifications(self.temp.name)
        self.store.configure({'armed':False,'sensors':[{'label':f'Porta {i+1}','enabled':True} for i in range(8)]})
    def tearDown(self):self.temp.cleanup()
    def test_auth_pair_revoke(self):
        with self.assertRaises(PermissionError):self.store.login('0000','test')
        session=self.store.login('1215','test');self.assertTrue(self.store.admin(session))
        token=self.store.pair('Meu celular');self.assertTrue(self.store.client(token));self.assertFalse(self.store.client('outro'))
        self.store.revoke(self.store.digest(token));self.assertFalse(self.store.client(token))
    def test_sensor_notification_deduplicated(self):
        self.store.configure({'armed':True,'sensors':[{'label':f'Porta {i+1}','enabled':True} for i in range(8)]})
        token=self.store.pair('Celular');notice=self.store.sensor(1,True);self.assertEqual(notice['severity'],'alert')
        self.assertIsNone(self.store.sensor(1,True));self.assertEqual(len(self.store.feed(token)),2)
        self.store.sensor(1,False);self.assertEqual(len(self.store.feed(token)),3)
    def test_reads_independent_and_persisted(self):
        a=self.store.pair('A');b=self.store.pair('B');n=self.store.record('Teste','Aviso')
        self.store.mark_read(a,n['id']);self.assertTrue(self.store.feed(a)[0]['read']);self.assertFalse(self.store.feed(b)[0]['read'])
        restarted=Notifications(self.temp.name);self.assertTrue(restarted.client(a));self.assertEqual(restarted.feed(a)[0]['id'],n['id'])
    def test_push_ssrf_rejected(self):
        token=self.store.pair('Celular')
        for endpoint in ('http://127.0.0.1/','https://127.0.0.1/','https://evil.example/'):
            with self.assertRaises(ValueError):self.store.subscribe(token,{'endpoint':endpoint,'keys':{'p256dh':'x'*20,'auth':'y'*20}})
    def test_invalid_sensor_and_config(self):
        with self.assertRaises(ValueError):self.store.sensor(9,True)
        with self.assertRaises(ValueError):self.store.configure({'armed':True,'sensors':[]})
    def test_rate_limit(self):
        for _ in range(5):
            with self.assertRaises(PermissionError):self.store.login('errado','ip')
        with self.assertRaises(PermissionError):self.store.login('1215','ip')
if __name__=='__main__':unittest.main()
