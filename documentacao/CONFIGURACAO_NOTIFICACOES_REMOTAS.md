# Ativar notificações remotas da Casa Completa

O pacote prepara o aplicativo, o histórico central e o envio Web Push. Para o celular receber alertas com a tela fechada e fora da rede local, a Raspberry precisa ter um endereço HTTPS público estável, internet e serviço ativo. Não foi criado um domínio nem aberta a rede do usuário: isso exige registrar um subdomínio e ajustar o roteador da casa.

## O que já está preparado

- `raspberry_pi/Caddyfile.casa-completa.modelo`: proxy HTTPS de exemplo, limitado aos arquivos do app móvel e às rotas móveis necessárias. Rotas de administração, login, configuração e hardware respondem 403.
- `raspberry_pi/configurar_push.py`: cria ou reutiliza as chaves VAPID no diretório local de dados.
- `raspberry_pi/requirements-push.txt`: dependência opcional de envio.
- O servidor da central permanece escutando em `127.0.0.1:4173`; o proxy conversa com ele pela própria Raspberry.

## O que o responsável precisa fazer uma vez

1. Criar uma conta em DuckDNS e registrar um subdomínio, por exemplo `staycontrol-minhacasa.duckdns.org`. O nome precisa estar disponível. Guardar o token DuckDNS em segredo; ele não deve ser enviado no chat nem colocado no pacote do projeto.
2. Atualizar o endereço DuckDNS com o roteador, se ele oferecer DuckDNS, ou seguir a página oficial DuckDNS para configurar atualização contínua na Raspberry.
3. No roteador, encaminhar as portas externas TCP 80 e 443 para a Raspberry. Reservar um endereço local para ela. Alguns provedores usam CGNAT e não permitem esse encaminhamento; nesse caso será necessário solicitar IP público ao provedor ou usar um túnel gerenciado.
4. Instalar Caddy na Raspberry, copiar `Caddyfile.casa-completa.modelo` para `/etc/caddy/Caddyfile` e substituir `{$STAYCONTROL_DOMAIN}` pelo subdomínio registrado. Caddy solicita e renova HTTPS automaticamente quando o nome aponta para a casa e as portas estão acessíveis.
5. No e-mail real do responsável, instalar as dependências opcionais e gerar as chaves. Exemplo, substituindo o caminho e o e-mail:

```bash
cd /opt/staycontrol
sudo -u pi /opt/staycontrol/venv/bin/pip install -r raspberry_pi/requirements-push.txt
sudo -u pi /opt/staycontrol/venv/bin/python raspberry_pi/configurar_push.py \
  --data-dir /home/pi/.local/share/staycontrol \
  --contact mailto:SEU_EMAIL_REAL
```

Use o nome verdadeiro do usuário da Raspberry no lugar de `pi`, se for diferente. A instalação inicial atual usa `/usr/bin/python3`; para Web Push, o serviço systemd deve usar o mesmo ambiente Python no qual `pywebpush` foi instalado. A chave privada `vapid_private.pem` fica somente na Raspberry e deve ser protegida; não enviar nem publicar.

6. Reiniciar os serviços `staycontrol` e `caddy`. No celular, abrir `https://SEU_SUBDOMINIO/celular.html`, vincular o aparelho na rede administrativa, tocar **Ativar notificações**, permitir o aviso do navegador e usar **Enviar teste** na central.

## Limites que dependem da residência

DuckDNS requer que o próprio responsável registre uma conta e escolha um nome disponível. O token é uma credencial privada. O encaminhamento depende do modelo e das regras do roteador; não deve ser feito até verificar que o endereço público e o firewall estão adequados. Se a operadora usa CGNAT, encaminhamento convencional não funciona. Sem domínio resolvendo para a Raspberry e portas acessíveis, Caddy não consegue obter o certificado público.

O iPhone exige que o app web esteja instalado na Tela de Início e que o usuário permita notificações. No Android, deve-se instalar/Adicionar à tela inicial e permitir. Em ambos, o aparelho precisa ter conectividade e o navegador/sistema operacional precisa aceitar notificações.

Referências oficiais: [DuckDNS — instalação e atualização](https://www.duckdns.org/install.jsp), [Caddy — HTTPS automático](https://caddyserver.com/docs/automatic-https), [Caddy — reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [Web Push no iOS/iPadOS — WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
