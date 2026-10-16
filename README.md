# STAYCONTROL

Sistema demonstrativo de automação residencial e de quartos de hotel. O projeto reúne uma interface touch para Raspberry Pi, um servidor local, firmware-base para Arduino Mega, monitoramento por sensores e um aplicativo web móvel para notificações.

## O que está no projeto

- **Casa:** controles demonstrativos por ambiente para iluminação, tomadas, climatização, televisão e som.
- **Casa Completa:** versão residencial com oito entradas para sensores, monitoramento, histórico de eventos e administração.
- **Quarto:** painel local demonstrativo com oito relés principais; o hardware planejado prevê expansão futura com duas placas de 16 canais (32 auxiliares) e áudio de quatro canais, até 50 W RMS por canal. Essas expansões ainda não estão implementadas no firmware.
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

O aplicativo móvel é uma PWA, localizada em `dist/celular.html`; este repositório não contém APK. A API em `api/mobile/` atende o domínio Vercel e guarda celulares, configurações e alertas no Neon Postgres. A configuração da produção está em [`documentacao/NOTIFICACOES_CLOUD_VERCEL.md`](documentacao/NOTIFICACOES_CLOUD_VERCEL.md). A Raspberry Pi pode enviar eventos de sensores à nuvem por HTTPS; ela não recebe comandos de relé pela internet.

O envio push exige chaves VAPID no ambiente de produção e autorização de notificações no celular. A instalação e o primeiro teste dependem de publicar a API e vincular o celular pela área do administrador.

Não exponha a API de controle dos equipamentos à internet. Use o modelo Caddy fornecido, que limita o acesso público ao aplicativo móvel e às rotas necessárias para as notificações.

## Administração e dados de demonstração

O PIN inicial demonstrativo é `1215`. Ele pode ser trocado no servidor pela variável `STAYCONTROL_ADMIN_PIN`. Esse PIN é apenas para demonstração; uma instalação real precisa de autenticação e permissões adequadas antes de uso comercial.

O histórico móvel é guardado no banco SQLite do servidor, no diretório de dados configurado. Códigos de vínculo e chaves VAPID são credenciais privadas e não devem ser publicados.

## Limites do protótipo

Controles de infravermelho, áudio, Bluetooth, troca de músicas e alguns efeitos RGB ainda precisam dos componentes escolhidos e de integração física. A operação com cargas reais, sensores físicos, envio push e APK não foi validada como produto instalado.

## Documentação

- [`documentacao/cotacao_2026-10-15/STAYCONTROL_Cotacao_Auditada_Materiais_2026-10-15.pdf`](documentacao/cotacao_2026-10-15/STAYCONTROL_Cotacao_Auditada_Materiais_2026-10-15.pdf): cotação auditada atual, com 55 itens, preços de referência, estimativas, fontes e condições para compra.
- [`documentacao/cotacao_2026-10-15/Formulario_Precos_Fornecedores.csv`](documentacao/cotacao_2026-10-15/Formulario_Precos_Fornecedores.csv): relação editável para os fornecedores preencherem marca, modelo, preço, prazo e garantia. Usar separador ponto e vírgula.
- [`documentacao/cotacao_2026-10-15/STAYCONTROL_Cotacao_Editavel.html`](documentacao/cotacao_2026-10-15/STAYCONTROL_Cotacao_Editavel.html): versão de consulta e impressão da cotação.
- [`documentacao/DOCUMENTO_FINAL_STAYCONTROL.md`](documentacao/DOCUMENTO_FINAL_STAYCONTROL.md): descrição consolidada do projeto.
- [`documentacao/STAYCONTROL_Projeto_Detalhado_Inova_EFG.pdf`](documentacao/STAYCONTROL_Projeto_Detalhado_Inova_EFG.pdf): material para apresentação.
- [`documentacao/STAYCONTROL_Lista_de_Compras.xlsx`](documentacao/STAYCONTROL_Lista_de_Compras.xlsx): planilha anterior de planejamento; para solicitar propostas, priorizar a cotação auditada de 15/10/2026.
- [`hardware/PROJETO_HARDWARE_STAYCONTROL_V1.md`](hardware/PROJETO_HARDWARE_STAYCONTROL_V1.md): arquitetura e interfaces.
- [`hardware/planta/`](hardware/planta/): desenhos preliminares em PDF, DXF e SVG.
- [`VALIDACAO.txt`](VALIDACAO.txt): validações executadas na versão demonstrativa.

### Quatro modos e duas capacidades de hardware

O programa mantém quatro modos: **Quarto, Completa (hotel), Casa e Casa Completa**. As configurações de hardware básica e ampliada são alternativas de capacidade, não novos modos do programa:

- **Básica:** oito relés principais e áudio estéreo com PAM8610, sem garantia de potência contínua de 15 W por canal.
- **Ampliada:** oito relés principais mais duas placas de 16 canais, totalizando 32 auxiliares e 40 relés; áudio com alvo de quatro saídas de 50 W RMS, sujeito a homologação do amplificador, DAC, fonte e refrigeração.

A auditoria identificou que o firmware e a ponte serial atuais aceitam somente 16 relés e não implementam transmissão infravermelha. Os canais 17 a 40, o áudio ampliado e o controle real de TV e ar-condicionado exigem desenvolvimento e ensaio físico. A fonte de áudio de 12 V / 3 A da configuração básica não atende ao conjunto de 200 W planejado; a ampliada precisa de alimentação dimensionada separadamente. A cotação distingue preços de anúncios, referências condicionadas e provisões estimadas e não constitui ordem de compra integralmente liberada.
