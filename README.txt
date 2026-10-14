STAYCONTROL — APLICATIVO DE DEMONSTRAÇÃO
=========================================

REVISÃO DE 13/10/2026
---------------------
Consulte documentacao/REVISAO_APLICATIVO_AUTONAV_2026-10-13.md para a análise
das fotos e os limites de integração. Novidades: cardápio de 1 a 40 itens,
backup e restauração pelo administrador, diagnóstico, desligamento geral,
aceite Bluetooth obrigatório, confirmação USB e sensor de porta na tela.
O controlador USB local está associado ao quarto 101. TV, ar, Bluetooth real,
áudio e efeitos RGB ainda dependem de integração física. A central completa
ainda guarda dados no navegador, sem sincronização entre celulares.

O pacote contém as quatro versões definidas no projeto:

1. VERSÃO CASA
   Controle residencial por ambiente: luzes, tomadas, RGB, climatização,
   TV, som, volume e troca de faixa demonstrativa. Dados separados do hotel.

2. CASA COMPLETA
   Controles por ambiente, 8 entradas de sensores de portas e janelas,
   monitoramento, alertas de abertura, histórico e administração por PIN.
   Leituras USB S1 a S8 usam as entradas correspondentes no Arduino.
   Sem controlador, os sensores funcionam como demonstração na tela.

3. VERSÃO QUARTO
   Controle local de 8 relés principais, expansão opcional de 8 relés,
   fita LED RGB, climatização, televisão, som Bluetooth e cardápio.

4. VERSÃO COMPLETA (HOTEL)
   Painel da recepção, painel do quarto, administração protegida e área
   da camareira, com histórico e estados de ocupação/liberação.

COMO INICIAR NO WINDOWS
-----------------------

1. Abra a pasta STAYCONTROL_Aplicativo.
2. Clique duas vezes em INICIAR_STAYCONTROL.bat.
3. O navegador abrirá automaticamente.
4. Escolha “Versão Casa”, “Casa Completa”, “Versão Quarto” ou “Versão Completa”.

É necessário ter Python 3 instalado no computador.

APLICATIVO DO CELULAR — CASA COMPLETA
------------------------------------
Abra Casa Completa > Administrador > Celular para gerar um código de vínculo.
O cliente abre /celular.html no endereço da central e informa esse código.
O histórico é compartilhado pelo servidor e permite leitura por aparelho.
Para notificações com o app fechado, configure HTTPS e Web Push conforme
documentacao/APLICATIVO_CELULAR_CASA_COMPLETA.md. Não foi feito teste de push
em um celular físico nesta entrega. A prévia local usa a porta 4196.

ACESSO ADMINISTRATIVO DA DEMONSTRAÇÃO
-------------------------------------

PIN: 1215

O administrador pode:
- alterar os nomes dos botões;
- ativar ou remover a placa auxiliar de 8 relés;
- editar o cardápio;
- alterar o texto do hóspede;
- trocar a logo do cliente.

DADOS E FUNCIONAMENTO OFFLINE
-----------------------------

As alterações ficam guardadas no navegador utilizado. O aplicativo instala
um cache local para continuar abrindo sem internet depois do primeiro acesso.
Use “Reiniciar dados da demonstração” na página “O projeto” para voltar aos
dados iniciais.

ARDUINO
-------

A pasta hardware contém um firmware-base para Arduino Mega 2560 e o protocolo
serial previsto para a comunicação com a Raspberry Pi. O mapa de pinos precisa
ser conferido com a placa de relés, a fonte, os contatores e o painel elétrico
usados no protótipo.

PLANTA PRELIMINAR DO APARELHO
-----------------------------

A pasta hardware/planta contém cinco folhas técnicas em PDF e arquivos DXF/SVG:
- arquitetura geral e separação dos conjuntos;
- console tátil de 260 x 175 x 55 mm;
- recorte preliminar da tela de 158 x 91 mm;
- caixa de controle compacta de 260 x 220 x 100 mm;
- placa interna, conectores e notas para fabricação.

Os recortes devem ser conferidos nas peças físicas antes da fabricação. O quadro
de 127/220 V é separado e deve ser projetado por profissional habilitado.

RASPBERRY PI 5
--------------

A pasta raspberry_pi contém a instalação automática, o modo quiosque e o
diagnóstico. Consulte raspberry_pi/README_RASPBERRY_PI.md. Na Raspberry Pi OS
com ambiente gráfico, execute:

sudo bash raspberry_pi/install.sh
sudo reboot

O serviço inicia o aplicativo sozinho e abre a Versão Quarto em tela cheia.
Quando o Arduino é detectado pela USB, os comandos dos relés e da fita RGB são
encaminhados ao controlador.

IMPORTANTE
----------

Esta entrega é um aplicativo demonstrativo e um firmware de bancada. A ligação
em 127/220 V deve ser projetada e executada por profissional habilitado. Não
ligue ar-condicionado, tomadas ou cargas de potência diretamente em relés sem
dimensionamento, proteção e ensaios adequados.

LISTA DE COMPRAS E DOCUMENTAÇÃO
-------------------------------

A pasta documentacao contém:
- STAYCONTROL_Lista_de_Compras.xlsx: planilha completa e dimensionável;
- GUIA_DE_COMPRA_E_SEGURANCA.md: ordem de compra e cuidados de instalação;
- STAYCONTROL_Projeto_Detalhado_Inova_EFG.docx e .pdf: documento de apresentação.
- STAYCONTROL_Projeto_de_Hardware_V1.docx e .pdf: análise do aparelho de
  referência e especificação técnica do equipamento STAYCONTROL.

Na planilha, abra a aba Resumo e informe a quantidade de quartos, se haverá
relé auxiliar e se a central completa entrará no orçamento. Os itens elétricos
de potência permanecem marcados para cotação depois do levantamento de cargas.

Arquivos principais:
- dist/index.html: aplicativo;
- server.py: servidor local;
- INICIAR_STAYCONTROL.bat: inicialização no Windows;
- hardware/staycontrol_mega.ino: firmware-base;
- hardware/PROTOCOLO_SERIAL.md: comandos entre Raspberry Pi e Arduino.
- hardware/PROJETO_HARDWARE_STAYCONTROL_V1.md: arquitetura, módulos e testes;
- hardware/MAPA_CONECTORES_STAYCONTROL_V1.csv: mapa das interfaces J1 a J12;
- hardware/planta/STAYCONTROL_Planta_Preliminar_Aparelho_V1.pdf: planta A3;
- hardware/planta/*.dxf e *.svg: arquivos preliminares para CAD e corte;
- raspberry_pi/install.sh: instalação automática na Raspberry Pi 5;
- raspberry_pi/kiosk.sh: interface em tela cheia;
- raspberry_pi/diagnostico.sh: verificação do serviço, tela e Arduino.
- documentacao/STAYCONTROL_Lista_de_Compras.xlsx: peças, quantidades e custos.
