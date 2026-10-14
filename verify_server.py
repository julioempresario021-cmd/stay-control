"""Ensaios da ponte serial com controlador simulado; não substituem bancada."""
import unittest
import server

class FakeSerial:
    is_open = True
    def __init__(self, bridge, reply): self.bridge, self.reply = bridge, reply
    def write(self, body):
        self.command = body.decode().strip()
        self.bridge.replies.put(self.reply)

class BridgeTests(unittest.TestCase):
    def bridge(self, reply='OK RELAY 1 ON'):
        bridge=server.SerialBridge()
        bridge.serial=FakeSerial(bridge,reply)
        return bridge
    def test_acknowledgement(self):
        self.assertEqual(self.bridge().send('RELAY 1 ON'),'OK RELAY 1 ON')
    def test_controller_rejection(self):
        with self.assertRaises(RuntimeError): self.bridge('ERR RGB VALUE').send('RGB 12 20 30 50')
    def test_rgb_limits(self):
        for command in ('RGB 256 0 0 50','RGB 255 0 0 101','RELAY 17 ON','EXEC X'):
            with self.assertRaises(ValueError): self.bridge().send(command)
    def test_disconnected(self):
        with self.assertRaises(RuntimeError): server.SerialBridge().send('ALL OFF')

if __name__=='__main__': unittest.main()
