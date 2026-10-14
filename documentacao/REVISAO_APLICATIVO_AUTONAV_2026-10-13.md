# Revisão do STAYCONTROL a partir das fotografias do AUTONAV

Data: 13/10/2026. Escopo: 13 fotografias fornecidas, código do aplicativo, servidor local, firmware Mega e instalação Raspberry Pi. O manual é material de referência; sua pinagem, limites e ligações não autorizam replicar circuitos no STAYCONTROL.

## Comparação funcional

| Função observada nas fotografias | STAYCONTROL | Resultado da revisão |
|---|---|---|
| Painel tátil e caixa de controle | Duas opções de console e gabinete independente | Preservados; geometria preliminar exige medição física |
| 8 relés e expansão até 16 | 8 principais e 8 opcionais | Testes de canais, limites e desligamento geral |
| Entradas para sensores | Firmware com 8 contatos secos | Sensor 1/porta lido pelo servidor e encaminhado à tela |
| Sinalizador externo | Livre/apagadas, ocupado/vermelha, arrumação/verde, espera/verde piscando | Estados preservados; transições enviam STATUS no controlador local 101 |
| Controle RGB | Cor e brilho por PWM | RGB fixo usa USB; efeitos animados são demonstrativos |
| TV e ar por infravermelho | Interface visual | Drivers e códigos por modelo ainda devem ser integrados |
| Amplificador e alto-falantes estéreo | Interface de som e proposta de módulos | Áudio físico e limite de volume precisam de ensaio |
| Bluetooth solicitado pelo usuário | Pedido, aceite, recusa, desconexão | Removido caminho que conectava sem aceite; integração BlueZ pendente |
| USB e rede LAN | Servidor local e ponte serial | USB com reconhecimento OK/ERR e erro visível; rede não compartilha dados entre celulares ainda |
| Dimmer de lâmpada | Não implementado | Recurso opcional futuro com interface própria e lâmpadas compatíveis |
| Configuração, manutenção e identificação | Administrador, nomes, cardápio, logo | Diagnóstico, backup JSON e bloqueio por inatividade adicionados |

## Problemas encontrados e alterações

1. O modelo tinha uma ação Bluetooth `connect` que dispensava o aceite. Ela agora é recusada; um pedido pendente não pode ser substituído silenciosamente.
2. O navegador ignorava respostas HTTP de erro da ponte serial. Agora lê OK/erro, mostra falha e enfileira comandos para preservar ordem.
3. O servidor confirmava somente a escrita na USB. Agora aguarda até três segundos pelo retorno do firmware e informa rejeição/ausência de resposta.
4. O leitor USB apenas imprimia sensores no terminal. Agora guarda entradas e a tela atualiza a porta do quarto 101 sem modificar a ocupação.
5. Os estados da recepção não eram enviados para a sinalização. Check-in, checkout, início de arrumação e liberação agora produzem STATUS no controlador local.
6. A API aceitava números RGB fora do intervalo. Agora valida 0–255 e brilho 0–100, tipo JSON e origem do pedido.
7. O cache offline podia armazenar estado da API e retornar HTML como resposta de arquivo ausente. A API está excluída e o fallback HTML é limitado à navegação.
8. O cardápio exigia exatamente quatro produtos. Agora permite 1–40, inclusão/remoção e preços decimais validados.
9. Dados importados pouco validados podiam quebrar controles e histórico. A validação passou a conferir limites de dispositivos, itens e datas.
10. Nomes dos relés apareciam sem escape HTML. Agora são escapados antes de renderizar.
11. A sessão administrativa permanecia aberta indefinidamente. Agora bloqueia após cinco minutos de inatividade. Reset exige administrador e fica bloqueado com controlador conectado.
12. A partida do firmware configurava saídas antes do nível desligado, arriscando pulso de relé ativo em LOW. Agora prepara o nível antes de habilitar OUTPUT; requer confirmação na bancada.
13. Acrescentado desligamento geral de relés e RGB com confirmação, diagnóstico e backup/restauração administrativa. Restauração é recusada com controlador conectado.
14. Seleção azul, tipografia coerente, foco de teclado e espaçamento para tela 1024 × 600 revisados.

## Validação realizada

- 15 testes automatizados do modelo: ciclo operacional, sinalização, pendências, limites, relés, RGB, Bluetooth, cardápio, restauração e desligamento.
- 4 testes da ponte serial com dispositivo simulado: confirmação, rejeição do controlador, limites RGB e ausência de conexão.
- Verificação sintática dos arquivos JavaScript.
- Navegador: painel 1024 × 600, abertura administrativa com PIN 1215, diagnóstico, pedido e recusa Bluetooth. A prévia usa porta 4185 para não interromper outra execução.
- Nenhuma placa física estava conectada. Não houve compilação Arduino nem ensaio elétrico, acústico ou térmico.

## Pendências para instalação real

A entrega continua sendo protótipo. O PIN 1215 e as áreas do navegador são proteção de apresentação, não autenticação de produção. Dados ainda são guardados no navegador; sincronização entre recepção, celular da camareira e quartos exige servidor compartilhado, contas e permissões. O controlador USB local está associado ao quarto 101 e não deve controlar vários quartos por troca de seleção.

Antes de piloto no hotel: implementar autenticação no servidor; cadastro e associação de controladores por quarto; transações e sincronização; emissão e recepção IR com códigos reais; agente BlueZ com aprovação na tela e política de expiração; recepção de áudio Bluetooth e volume real; efeitos RGB no firmware; reconexão e confirmação do estado físico; dimensionamento elétrico, ruído e temperatura. A indicação gráfica de ligar/desligar representa o último comando solicitado, não medição independente da carga.

O circuito dimmer e as ligações de 127/220 V do equipamento fotografado não foram incorporados ao firmware. A nossa caixa permanece de baixa tensão; potência exige projeto separado.
