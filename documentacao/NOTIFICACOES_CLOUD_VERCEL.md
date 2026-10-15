# Notificações remotas pelo domínio Vercel

## Arquitetura

- Site e API: `https://staycontrol-demo.vercel.app`.
- Banco: Neon Postgres no plano `Free`, conectado somente ao ambiente `Production` do projeto Vercel `staycontrol-demo`.
- A API fica em `api/mobile/[...path].js` e mantém histórico, configurações de sensores, dispositivos vinculados e notificações lidas.
- A Raspberry Pi pode enviar mudanças dos sensores para `POST /api/mobile/pi/sensor` por HTTPS. O token dessa central é configurado separadamente e não deve ser publicado.
- A API remota não encaminha comandos para relés, TV, áudio ou ar-condicionado.

## Rotas da API

- `GET /api/mobile/health`: verifica se a API alcança o banco, sem revelar credenciais.
- `POST /api/mobile/login`: cria sessão de administrador por dez minutos; PIN inicial demonstrativo `1215`.
- `GET /api/mobile/admin/status`: lista celulares, estado do Web Push e configuração dos oito sensores.
- `POST /api/mobile/pair` e `/api/mobile/revoke`: vincula ou revoga um celular.
- `GET /api/mobile/feed`, `POST /api/mobile/read` e `/api/mobile/subscribe`: histórico, leitura e assinatura push do aparelho.
- `POST /api/mobile/config`, `/api/mobile/sensor` e `/api/mobile/test`: administração, simulação de sensor e teste.
- `POST /api/mobile/pi/sensor`: evento recebido da Raspberry Pi com token de integração.

## Variáveis de produção

O banco Neon injeta `DATABASE_URL` no ambiente de produção. O envio push requer estas variáveis sensíveis em **Project Settings → Environment Variables**, marcadas somente para Production:

- `STAYCONTROL_VAPID_PUBLIC_KEY`
- `STAYCONTROL_VAPID_PRIVATE_KEY`
- `STAYCONTROL_VAPID_SUBJECT` (por exemplo, `mailto:juliojcfm@bol.com.br`)

O PIN da demonstração é definido por `STAYCONTROL_ADMIN_PIN`. Antes de operar com hóspedes, substitua o PIN curto e de demonstração por autenticação adequada.

Para conectar sensores físicos, gere um valor aleatório longo (por exemplo, `openssl rand -hex 32`) e salve o mesmo valor como variável secreta `STAYCONTROL_PI_TOKEN` na Vercel e no arquivo local protegido `/etc/staycontrol/cloud.env` da Raspberry:

```ini
STAYCONTROL_CLOUD_URL=https://staycontrol-demo.vercel.app
STAYCONTROL_PI_TOKEN=COLOQUE_AQUI_O_MESMO_TOKEN_SECRETO
```

Proteja o arquivo na Raspberry com permissão exclusiva ao administrador (`chmod 600 /etc/staycontrol/cloud.env`). O serviço deve carregá-lo por `EnvironmentFile=-/etc/staycontrol/cloud.env`. Não coloque tokens, chaves VAPID ou senhas no GitHub, no código do navegador ou em documentos públicos.

Depois de criar esse arquivo, reinicie o serviço com `sudo systemctl restart staycontrol.service`. A função de envio cloud foi adicionada ao instalador, mas essa etapa depende da Raspberry Pi e dos sensores físicos estarem instalados.

## Verificação

Depois da implantação, `GET /api/mobile/health` deve responder `{"ok":true,"storage":"connected"}`. Na versão Casa Completa, o administrador entra com o PIN configurado, vincula o telefone, autoriza as notificações no navegador e usa **Gerar notificação de teste**. Para testar a Raspberry, abra e feche um sensor físico com monitoramento ativado.

O plano gratuito tem limites próprios de uso. A integração foi instalada no plano `Free`; não faça upgrade automático para plano pago. Confira o painel Neon/Vercel se o consumo se aproximar dos limites.
