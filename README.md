# STAYCONTROL

Sistema demonstrativo de automação residencial e de quartos de hotel. O projeto reúne uma interface touch para Raspberry Pi, um servidor local, firmware-base para Arduino Mega, monitoramento por sensores e um aplicativo web móvel para notificações.

![Tela móvel STAYCONTROL](documentacao/imagens/STAYCONTROL_App_Celular_Notificacoes.png)

## O que está no projeto

- **Casa:** controles demonstrativos por ambiente para iluminação, tomadas, climatização, televisão e som.
- **Casa Completa:** versão residencial com oito entradas para sensores, monitoramento, histórico de eventos e administração.
- **Quarto:** painel local para equipamentos de um quarto, com oito relés principais e previsão de expansão por mais oito.
- **Completa (hotel):** demonstração com painel da recepção, quarto, administração e tarefas da camareira.
- **Aplicativo móvel:** PWA para consultar notificações da Casa Completa, filtrar alertas e marcar eventos como lidos.
- **Hardware:** firmware-base do Arduino, protocolo serial, mapa de conectores e desenhos preliminares do painel e do gabinete.
- **Raspberry Pi:** instalador do serviço e modo quiosque para a tela touch.

## Executar no computador

Instale Python 3 e execute `INICIAR_STAYCONTROL.bat`, ou inicie manualmente:

```bash
python server.py
```

O servidor abre a interface no navegador. Para permitir acesso por outros aparelhos na mesma rede local, use:

```bash
python server.py --network --no-browser
```

O painel do celular fica em `/celular.html`. A central e o celular precisam alcançar o mesmo servidor para compartilhar o histórico.

## Raspberry Pi e Arduino

Consulte [`raspberry_pi/README_RASPBERRY_PI.md`](raspberry_pi/README_RASPBERRY_PI.md) para instalar o painel em uma Raspberry Pi com sistema de 64 bits e ambiente gráfico. O firmware inicial do Arduino Mega está em [`hardware/staycontrol_mega.ino`](hardware/staycontrol_mega.ino), com o protocolo em [`hardware/PROTOCOLO_SERIAL.md`](hardware/PROTOCOLO_SERIAL.md).

O firmware e os desenhos são protótipos. Confirme pinagem, fontes, proteção e dimensionamento antes de montar. Circuitos de 127/220 V devem ser projetados e instalados por profissional habilitado.

## Notificações no celular

O aplicativo móvel é uma PWA, localizada em `dist/celular.html`; este repositório não contém APK. A consulta ao histórico funciona quando o celular alcança a central. Para notificações push com o aplicativo fechado, é necessário publicar a central em HTTPS, configurar Web Push/VAPID e autorizar notificações no aparelho. O guia está em [`documentacao/CONFIGURACAO_NOTIFICACOES_REMOTAS.md`](documentacao/CONFIGURACAO_NOTIFICACOES_REMOTAS.md).

Não exponha a API de controle dos equipamentos à internet. Use o modelo Caddy fornecido, que limita o acesso público ao aplicativo móvel e às rotas necessárias para as notificações.

## Administração e dados de demonstração

O PIN inicial demonstrativo é `1215`. Ele pode ser trocado no servidor pela variável `STAYCONTROL_ADMIN_PIN`. Esse PIN é apenas para demonstração; uma instalação real precisa de autenticação e permissões adequadas antes de uso comercial.

O histórico móvel é guardado no banco SQLite do servidor, no diretório de dados configurado. Códigos de vínculo e chaves VAPID são credenciais privadas e não devem ser publicados.

## Limites do protótipo

Controles de infravermelho, áudio, Bluetooth, troca de músicas e alguns efeitos RGB ainda precisam dos componentes escolhidos e de integração física. A operação com cargas reais, sensores físicos, envio push e APK não foi validada como produto instalado.

## Documentação

- [`documentacao/DOCUMENTO_FINAL_STAYCONTROL.md`](documentacao/DOCUMENTO_FINAL_STAYCONTROL.md): descrição consolidada do projeto.
- [`documentacao/STAYCONTROL_Projeto_Detalhado_Inova_EFG.pdf`](documentacao/STAYCONTROL_Projeto_Detalhado_Inova_EFG.pdf): material para apresentação.
- [`documentacao/STAYCONTROL_Lista_de_Compras.xlsx`](documentacao/STAYCONTROL_Lista_de_Compras.xlsx): lista de componentes.
- [`hardware/PROJETO_HARDWARE_STAYCONTROL_V1.md`](hardware/PROJETO_HARDWARE_STAYCONTROL_V1.md): arquitetura e interfaces.
- [`hardware/planta/`](hardware/planta/): desenhos preliminares em PDF, DXF e SVG.
- [`VALIDACAO.txt`](VALIDACAO.txt): validações executadas na versão demonstrativa.
