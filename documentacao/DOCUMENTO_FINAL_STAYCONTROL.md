# STAYCONTROL — Documento consolidado do projeto

Atualização: 15/10/2026. Este documento complementa os documentos de apresentação em PDF e Word e registra as últimas decisões do projeto.

## Cotação auditada e capacidades de hardware

A [cotação auditada de 15/10/2026](cotacao_2026-10-15/STAYCONTROL_Cotacao_Auditada_Materiais_2026-10-15.pdf) consolida 55 itens, referências de preço, estimativas, condições de fornecimento e limitações técnicas. O [formulário CSV](cotacao_2026-10-15/Formulario_Precos_Fornecedores.csv) permite receber propostas comerciais por código de item.

Os quatro modos do software permanecem os mesmos. Existem duas opções de capacidade de hardware: básica com oito relés e áudio estéreo, e ampliada com 32 auxiliares adicionais e alvo de quatro saídas de 50 W RMS. As opções não devem ser somadas como conjuntos completos para uma mesma central. A sinalização externa é opcional nas versões residenciais.

A auditoria confirmou que a ponte serial e o firmware atuais aceitam apenas 16 relés e não implementam emissão IR. A expansão até 40 canais e o áudio ampliado exigem desenvolvimento e testes. O gabinete compacto é preliminar e não está validado para todas as placas e fontes da ampliação. A cotação não libera a compra em lote antes do piloto.

## Quatro versões

1. **Casa:** controle por ambiente residencial: Sala, Suíte, Quarto 2, Cozinha, Escritório, Varanda, Garagem e Área externa. Iluminação, tomadas, RGB, climatização, televisão e som. Os dados da Casa ficam separados dos dados do hotel.
2. **Casa Completa:** controles residenciais, oito entradas para sensores de portas/janelas, painel de monitoramento, alertas de abertura e histórico. Administrador define os nomes dos ambientes e sensores, habilita entradas, ativa/desativa o monitoramento e reconhece avisos. Dados separados da Casa simples e do hotel.
3. **Quarto:** central independente para o hóspede, com os mesmos controles de equipamentos, cardápio e administração.
4. **Completa:** painel do quarto, recepção, administração e camareira, com fluxo de ocupação, arrumação, pendências e vistoria.

As quatro opções aparecem na tela inicial. O acesso administrativo demonstrativo usa PIN 1215. Os controles incluem volume, música anterior e próxima música; a troca de faixas é demonstrativa e requer aceite do pedido Bluetooth.

## Aparelho proposto

Console touch de 7 polegadas com Raspberry Pi 5. Duas opções de instalação: painel na parede e painel com braço articulado aparafusado à superfície. Caixa de controle compacta preliminar de 260 × 220 × 100 mm, com Arduino Mega, 8 relés principais, expansão planejada de 32 auxiliares em duas placas de 16 canais, entradas de sensores, quatro canais de áudio com alvo de 50 W RMS por canal, IR e RGB. Ligações externas por conectores removíveis identificados J1 a J12. As expansões de hardware exigem revisão do firmware e validação antes da operação.

As dimensões da planta são preliminares, sujeitas à medição das peças, folgas de cabos, dissipação e validação física. As imagens do aparelho são representações de apresentação.

## Estados do hotel

| Situação | Sinalização |
|---|---|
| Livre | Vermelha e verde apagadas |
| Ocupado | Vermelha acesa |
| Em arrumação | Verde acesa |
| Aguardando liberação | Verde piscando |

A porta informa abertura/fechamento; ela não altera a ocupação. A camareira precisa concluir a vistoria e resolver pendências antes da liberação.

## Administração

Nomes dos botões, placa auxiliar, cardápio com 1–40 itens (versões de hotel), texto de boas-vindas, logo do cliente, diagnóstico e backup/restauração. A sessão bloqueia após cinco minutos de inatividade. A placa auxiliar é configurada pela administração. Os botões de equipamentos ativos podem ser usados pelo morador ou hóspede.

## Estado de implementação

O aplicativo é um protótipo local. Relés, RGB fixo, sensor de porta e sinalização têm ponte USB com firmware de bancada; o controlador local está associado ao identificador 101 (Sala na Casa e quarto 101 no hotel). O servidor verifica resposta OK/ERR e informa falhas. Não houve teste com equipamento físico conectado.

TV, ar-condicionado, transmissão de música, pareamento Bluetooth real, comandos de faixa do celular e efeitos RGB ainda precisam de integração física. Os comandos de faixa desta entrega mudam a faixa indicada na demonstração. A interface não mede independentemente o estado da carga. Recepção e camareira ainda não sincronizam dados entre celulares; autenticação e servidor compartilhado são etapas para uso real. O PIN de demonstração não substitui autenticação de produção.

O dimmer de rede elétrica observado no AUTONAV permanece opcional futuro. Potência de 127/220 V exige quadro e projeto separados da eletrônica de baixa tensão.

## Conteúdo da entrega unificada

- Aplicativo, servidor Python, firmware Arduino e instalação Raspberry Pi.
- Logo STAYCONTROL em JPG.
- Documento de apresentação para o Inova EFG em PDF e Word.
- Documento de hardware em PDF e Word e revisão técnica do aplicativo.
- Planta em PDF A3, DXF e SVG.
- Imagens do painel na parede e com braço; imagens do gabinete original, com conectores e compacto.
- Lista de compras Excel e guia de compra.
- Fotografias de referência fornecidas, quando disponíveis no computador.

## Verificação

21 testes do modelo e 4 testes da ponte serial simulada passaram. Navegador: painel Casa Completa, entrada por PIN, ativação de monitoramento, abertura simulada e aviso persistente. A documentação de revisão detalha os limites para montagem e piloto.

## Aplicativo do cliente e notificações — atualização mais recente

Acrescentado STAYCONTROL Minha Casa em `dist/celular.html`, com layout para celular, manifesto instalável, histórico compartilhado, filtros, estado lido/não lido individual e vínculo por código gerado na administração da Casa Completa. O serviço móvel guarda notificações e vínculos em SQLite fora da pasta pública.

Monitoramento e configuração dos sensores são enviados ao serviço central ao salvar pela administração. A leitura serial gera registros no serviço mesmo com a interface do painel fechada. O aplicativo consulta o feed enquanto está visível. Web Push e recebimento pelo service worker estão implementados, mas faltam HTTPS acessível, chaves da instalação, autorização do cliente e ensaio em celular físico. Não há servidor publicado nesta entrega.

Os 6 novos testes do serviço móvel passaram: autorização, revogação, persistência, leitura independente, validações, limites de tentativas e deduplicação de sensores. Total: 31 testes. O teste no navegador confirmou o alerta simulado compartilhado entre central e aplicativo, além da marcação de leitura.
