# Casa Completa — Sensores e monitoramento

Abra a nova opção residencial `Casa Completa` na tela inicial ou use o endereço terminado em `#casa-completa`.

## Entradas iniciais

| Entrada no Arduino | Sensor inicial | Ambiente |
|---|---|---|
| 1 | Porta de entrada | Sala |
| 2 | Porta da suíte | Suíte |
| 3 | Janela do quarto | Quarto 2 |
| 4 | Porta da cozinha | Cozinha |
| 5 | Janela do escritório | Escritório |
| 6 | Porta da varanda | Varanda |
| 7 | Portão da garagem | Garagem |
| 8 | Portão externo | Área externa |

As oito entradas usam o firmware de sensores existente. As leituras serial `STATE SENSOR` e `EVENT SENSOR` atualizam o painel pela API a cada aproximadamente quatro segundos. Os nomes são sugestões editáveis, não uma descrição de sensores já instalados.

## Como demonstrar

1. Abra Casa Completa. As abas são Equipamentos, Monitoramento e Eventos.
2. Abra Configurar monitoramento e entre com PIN 1215.
3. Na aba Sensores, altere nomes, ambientes e habilitação se necessário.
4. Feche todos os sensores habilitados e ative o monitoramento.
5. Saia da administração e simule uma abertura. O cartão e o cabeçalho mostram aviso.
6. Feche o sensor: o aviso permanece registrado até reconhecimento administrativo.
7. Abra Eventos para consultar histórico. Reconheça os avisos na administração depois de verificar a situação.

Durante monitoramento ativado, a configuração dos sensores fica bloqueada. Para editar, desative primeiro. Entradas desabilitadas continuam podendo mostrar abertura, mas não geram alerta. Armamento com todos os sensores desabilitados é recusado.

## Limites e instalação

Esta é uma função de monitoramento de contatos de portas e janelas. Não inclui câmeras, gravação de vídeo, sirene ou central profissional de alarme. O aplicativo Minha Casa foi acrescentado em `celular.html`: histórico compartilhado pelo servidor, vínculo de celulares e Web Push opcional. Notificações com o app fechado e acesso externo exigem HTTPS, internet, configuração das chaves e permissão do cliente. Consulte APLICATIVO_CELULAR_CASA_COMPLETA.md. A API móvel valida sessão administrativa e códigos exclusivos dos celulares. As demais áreas do protótipo mantêm suas limitações de autenticação.

Não foi possível ensaiar sensores físicos nesta entrega. O hardware deve ser montado, identificado e testado antes de uso real. Abrir uma porta não muda o estado de iluminação. Nenhum contator ou saída de alarme é acionado pelo aviso na tela.

Na Casa Completa, S1–S8 identificam zonas de monitoramento. Os controles de equipamentos por ambiente permanecem demonstrativos, com ponte USB local apenas para o identificador 101. Replicar controle físico por ambiente exige associação de placas e cargas no projeto da residência.

