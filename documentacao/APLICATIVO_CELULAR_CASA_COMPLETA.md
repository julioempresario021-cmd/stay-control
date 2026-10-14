# STAYCONTROL Minha Casa — aplicativo do celular

O aplicativo está em `dist/celular.html`. É um aplicativo web instalável (PWA), não um APK ou aplicativo publicado na App Store. Mostra até 500 notificações recentes, filtros Todas/Não lidas/Alertas, data/hora, detalhe do sensor e marcação como lida. As notificações ficam no banco SQLite da central; cada celular tem seu próprio estado de leitura.

## Vincular o celular

1. Reinicie o servidor usando os arquivos atualizados. Na central, entre em Casa Completa → Administrador → Celular. PIN de demonstração: 1215.
2. Informe o nome do aparelho e gere o código de vinculação.
3. No celular, abra o endereço da central terminado em `/celular.html` e cole o código. O endereço `127.0.0.1` funciona somente no próprio computador, não no telefone.
4. Para consultar o histórico na mesma rede, inicie a central com `python server.py --network --no-browser`, obtenha o IP real do computador/Raspberry e use `http://IP:4173/celular.html`. Autorize na rede local o acesso à porta apenas para os aparelhos da instalação.
5. Para instalação e push, use endereço HTTPS confiável. No Android, escolha Instalar aplicativo/Adicionar à tela inicial. No iPhone, adicione à Tela de Início pelo Safari e abra pelo ícone.
6. Depois de configurar Web Push, toque em Ativar notificações e permita no aparelho. O administrador pode gerar uma notificação de teste.

O código é uma credencial: não deve ser publicado nem compartilhado com quem não pode acessar a casa. O administrador pode revogar o vínculo. Sessões administrativas da API móvel expiram em dez minutos. O PIN demonstrativo deve ser substituído pela configuração de produção: variável de ambiente `STAYCONTROL_ADMIN_PIN` no serviço.

## O que funciona na entrega

- Feed compartilhado entre a central e o aplicativo do celular, com atualização a cada dez segundos enquanto o app está visível.
- Eventos físicos recebidos pelo leitor serial geram registros sem precisar manter o navegador do painel aberto, desde que o serviço central esteja executando.
- Monitoramento e nomes dos sensores são persistidos no servidor ao salvar pela área administrativa.
- Aberturas simuladas podem gerar eventos móveis quando existe sessão administrativa recente. Eventos de simulação ficam identificados.
- Marcadores de leitura individuais, consulta à última atualização em caso de perda de conexão, múltiplos vínculos e revogação.
- Código para envio de Web Push e recebimento pelo service worker, sujeito à configuração abaixo.

## Para receber com o app fechado e fora de casa

Ainda é necessário configurar uma instalação real acessível por HTTPS, manter a Raspberry Pi/servidor e internet ativos e habilitar Web Push. O servidor desta entrega não foi publicado na internet e o envio para um celular físico não foi ensaiado.

No ambiente Python que executa a central, instale:

```sh
python -m pip install -r raspberry_pi/requirements-push.txt
```

Em Raspberry Pi OS, use um ambiente virtual para as dependências Python. Configure o serviço para usar o Python desse ambiente. Ele também precisa ter `pyserial` se usar Arduino.

Gere as chaves no diretório de dados usado pelo serviço. Informe um contato real do responsável:

```sh
python raspberry_pi/configurar_push.py --data-dir /CAMINHO/DA/CENTRAL --contact mailto:SEU_EMAIL
```

Use o mesmo diretório na variável `STAYCONTROL_DATA_DIR`. A instalação padrão Raspberry passa a usar `$HOME/.local/share/staycontrol`. O script preserva chaves existentes, para não invalidar assinaturas de celulares. Não compartilhe `vapid_private.pem`, o banco de dados ou os códigos de vínculo.

Configure HTTPS por um serviço/proxy adequado à instalação. Para acesso externo, o endereço deve ser alcançável pelo celular; não basta usar HTTPS apenas no computador. Não exponha a API de hardware existente diretamente à internet: o proxy de produção deve liberar somente os arquivos do app do celular, `/api/mobile/feed`, `/api/mobile/read` e `/api/mobile/subscribe`, mantendo os demais recursos restritos à central/rede administrativa. Vinculação deve ocorrer na rede administrativa.

O botão Ativar notificações somente pede permissão quando o serviço push está pronto. Se a assinatura expirar, o servidor a remove e o cliente deve habilitar novamente. Falhas de envio não apagam o aviso do histórico.

## Validação e limites

31 testes passaram: 21 do modelo, 4 da ponte serial e 6 do serviço móvel. A interface foi testada em duas abas: vínculo administrativo, consulta do evento de ativação e recebimento de alerta de abertura simulada. Não foram ensaiados smartphone físico, push em segundo plano, HTTPS público ou sensores reais.

O sistema é um protótipo de monitoramento e não substitui uma central profissional de alarme. Acesso remoto depende da configuração e disponibilidade da instalação. O aplicativo do celular desta entrega é focado em notificações; não altera equipamentos nem arma/desarma a casa.

Referências: [Web Push no iOS/iPadOS — WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [Instalar aplicativo web no iPhone — Apple](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27), [pywebpush — documentação do projeto](https://github.com/web-push-libs/pywebpush).
