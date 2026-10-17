# STAYCONTROL — pesquisa de 20 referências e renovação do layout

Data: 17 de outubro de 2026.

Pesquisa documental em páginas públicas oficiais de produtos, interfaces e documentação. Não envolve testes de contas privadas ou instalação dos aplicativos. As escolhas visuais abaixo são síntese de design para o STAYCONTROL, não uma afirmação de que cada fornecedor usa a mesma paleta, tamanho ou componente. Não foram copiados código, imagens ou marcas dessas empresas.

## As 20 referências

| # | Referência oficial | Aspecto estudado | Aplicação no STAYCONTROL |
|---|---|---|---|
| 1 | [Control4 X4](https://www.control4.com/get-control4-appx) | Tela inicial unificada, favoritos, atalhos e estado dos dispositivos | Categorias estáveis e estado ligado/desligado nos próprios cartões |
| 2 | [Crestron Home OS4](https://www.crestron.com/Products/Featured-Solutions/Crestron-Home/Crestron-Home-OS4) | Texto mais legível, filtros e acesso aos ambientes com menos toques | Tipografia sem serifa consistente e seleção do ambiente destacada |
| 3 | [Savant Interfaces](https://www.savant.com/interfaces/) | Continuidade entre aplicativo e telas touch | Mesmo sistema visual no painel, recepção e celular |
| 4 | [Josh.ai](https://josh.ai/) | Centralização de dispositivos e simplicidade na interação | Organização por tarefa e mensagens curtas nos controles |
| 5 | [Home Assistant — Sections](https://www.home-assistant.io/dashboards/sections/) | Seções, grade de cartões e cabeçalho | Separação de funções e grade responsiva de pontos de controle |
| 6 | [Loxone App](https://www.loxone.com/enus/products/apps/) | Aplicativo único com iluminação, conforto e notificações | Categorias coerentes para as versões de casa e hotel |
| 7 | [Gira Smart Home](https://www.gira.com/en/en/solutions/smart-home-control) | Interação por aplicativo e controle de ambientes | Contexto do ambiente sempre junto dos controles |
| 8 | [JUNG HOME](https://www.jung-group.com/en-DE/Products/Systems/JUNG-HOME/) | Menu claro, controle central e cenas | Navegação previsível; configurações separadas dos controles cotidianos |
| 9 | [Schneider Electric Wiser Home](https://productinfo.se.com/wiser_home/viewer?docidentity=SettingTheRoomTemperatureUsingTheAp-02C66591&extension=xml&lang=en&manualidentity=DeviceUserGuideWiserInformationAbou-0FAB562C) | Controle por cômodo, temperatura e botões de ajuste | Climatização com valor em destaque e controles de mais/menos |
| 10 | [BTicino Home + Control](https://www.bticino.com/tools/app/home-control) | Luzes, tomadas e climatização no mesmo aplicativo | Agrupamento de funções no painel de controle |
| 11 | [ABB free@home Next](https://new.abb.com/low-voltage/products/building-automation/abb-freeathome-next-app) | Uma aplicação para controle e configuração | Hierarquia entre funções diárias e área administrativa |
| 12 | [Samsung SmartThings](https://www.samsung.com/us/smartthings/) | Conexão e controle de vários dispositivos | Cartões consistentes e identificação textual dos estados |
| 13 | [INTEREL](https://interel.com/) | Controles e gestão de quartos | Contexto do quarto e sinalização distintos dos comandos do hóspede |
| 14 | [INTELITY](https://intelity.com/) | Experiência do hóspede e produtividade da equipe | Separação clara de recepção, quarto, camareira e administração |
| 15 | [Innspire](https://innspire.com/) | Serviços e fluxos do hotel | Organização das opções do hóspede sem misturar tarefas da equipe |
| 16 | [DigiValet](https://www.digivalet.com/) | Experiência de quarto e personalização da marca | Preservação da logo e do recurso de identidade personalizada |
| 17 | [Crave Interactive](https://craveinteractive.com/articles/rcd-hotels-orders-3450-in-room-tablets-from-crave-interactive-for-four-of-its-prestigious-resort-hotels) | Tablets com informação e serviços para hóspedes | Cardápio com hierarquia de categoria, nome, descrição e preço |
| 18 | [IRIS](https://www.iris.net/) | Experiência móvel de serviços e alimentação | Cardápio mais legível, mantendo a função existente de consulta |
| 19 | [Honeywell INNCOM](https://buildings.honeywell.com/us/en/brands/our-brands/hospitality/what-we-do/inncom-system) | Conforto, sensores e gestão do quarto | Distinção entre controle de equipamentos e estado operacional |
| 20 | [VDA Telkonet](https://vdatelkonet.com/) | Integração de tecnologias de quarto e operação | Uma identidade visual entre o painel e os módulos de operação |

## Alterações implementadas

- Página inicial refeita: marca compacta e duas escolhas claras — Residência ou Hotel. Depois da escolha, somente as versões Essencial e Premium daquele ambiente são exibidas. Botão Trocar ambiente permite retornar à primeira etapa.
- Preservadas as rotas e os nomes atuais: Casa Essencial, Casa Premium, Hotel Essencial e Hotel Premium.
- Paleta Atlântico: fundo claro `#f2f5fa`, azul-marinho `#10233f`, ação principal `#245eea` e texto `#162b49`.
- Fonte única de interface, com fontes do sistema e sem carregamento remoto obrigatório. Hierarquia de títulos, rótulos e mensagens revista.
- Painel touch em azul-marinho, categorias com seleção azul e cartões de relé com estado por texto, contraste e interruptor.
- Contexto da categoria e contagem dos pontos ligados no painel de luzes e tomadas.
- Estilo unificado para climatização, TV, áudio, Bluetooth, LED RGB, cardápio, sensores, administração e notificações no celular.
- Regras de composição para computador, tablet, tela de 7 polegadas em paisagem e celular; controles principais com áreas de toque amplas e foco de teclado visível.
- Mantidos os estados funcionais, a sinalização física verde/vermelha, o aceite do Bluetooth, as configurações administrativas, a troca de logo e a persistência existente.
- Service worker atualizado para incluir o novo tema no cache offline.

## Validação e limites

- Verificação sintática dos arquivos JavaScript alterados.
- Executada a suíte existente de 21 testes do modelo: todos passaram.
- A atualização é visual; não acrescenta integração física de áudio, infravermelho ou Bluetooth.
- Ilustrações de residência e hotel feitas em SVG/CSS; os controles funcionais são acessados dentro das versões.
- Verificação de composição e navegação em JavaScript: duas etapas de escolha, quatro versões, 22 telas de categorias, oito relés, expansão oculta, acesso administrativo e retorno à entrada.
- A verificação de composição não substitui inspeção visual em navegador. O recurso de navegador de QA não estava disponível neste ambiente.
- A pesquisa nas páginas oficiais não equivale a uma auditoria completa de acessibilidade ou teste instalado dos produtos citados.
