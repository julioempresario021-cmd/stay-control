"""Execute no ambiente da central após instalar requirements-push.txt."""
from pathlib import Path
import argparse,os,base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
p=argparse.ArgumentParser();p.add_argument('--data-dir',required=True);p.add_argument('--contact',required=True);args=p.parse_args()
if not args.contact.startswith('mailto:') or '@' not in args.contact:raise SystemExit('Informe contato real no formato mailto:email@dominio.')
root=Path(args.data_dir);root.mkdir(parents=True,exist_ok=True);private=root/'vapid_private.pem'
if private.exists():
    key=serialization.load_pem_private_key(private.read_bytes(),password=None)
else:
    key=ec.generate_private_key(ec.SECP256R1());private.write_bytes(key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
    if os.name!='nt':private.chmod(0o600)
public=key.public_key().public_bytes(serialization.Encoding.X962,serialization.PublicFormat.UncompressedPoint)
(root/'vapid_public.txt').write_text(base64.urlsafe_b64encode(public).decode().rstrip('='))
(root/'vapid_subject.txt').write_text(args.contact)
print('Chaves preparadas. Reinicie a central com o mesmo diretório de dados. A chave privada não deve ser compartilhada.')
