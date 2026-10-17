# STAYCONTROL — Projeto Hotel

Atualizado em 17/10/2026.

Automação do quarto para o conforto do hóspede, com opção de evolução para uma central de recepção e arrumação. As funções e os documentos do hotel ficam separados do projeto residencial.

## Público

Hóspede para equipamentos do quarto e cardápio; administrador para personalização; recepção e camareira na versão Premium. A troca livre de papéis existe somente na demonstração.

## Navegação

Entrada do STAYCONTROL → Hotel → Essencial ou Premium → painel do quarto ou central do hotel. O botão Trocar ambiente volta à entrada. A versão Essencial não exige que a recepção seja aberta para usar os controles do quarto.

## Documentos deste projeto

- [Essencial](ESSENCIAL.md)
- [Premium](PREMIUM.md)
- Apresentação: `dist/docs/hotel/index.html`

## Arquitetura e implantação

A arquitetura de referência usa console com Raspberry Pi 5 e tela touch de 7 polegadas, Arduino Mega ligado por USB e interfaces de baixa tensão. O protótipo demonstra 8 relés principais e até 8 auxiliares habilitados pela administração. O projeto ampliado prevê até 32 auxiliares adicionais e áudio de quatro canais, mas essas capacidades não estão implementadas no firmware atual. Essencial e Premium são níveis de software; não garantem automaticamente uma capacidade maior de relés ou potência de áudio.

TV, ar-condicionado por infravermelho, transmissão real de áudio Bluetooth e comandos de faixa ainda dependem de integração física. A interface mantém a identificação de demonstração e o Bluetooth exige aceite na tela. A ponte serial de relés, RGB fixo, sensores e sinalização existe no código, mas esta entrega de layout não valida uma instalação física. Projeto elétrico, montagem, dissipação e proteções devem ser definidos para os componentes e cargas reais.

Os arquivos técnicos compartilhados continuam em `hardware/`, `raspberry_pi/`, `server.py` e `lib/`. A separação documental não declara servidores, bancos ou instalações independentes já provisionados.
