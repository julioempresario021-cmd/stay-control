# STAYCONTROL — Projeto Residência

Atualizado em 17/10/2026.

Automação residencial organizada por ambiente, com iluminação, tomadas, LED RGB, climatização, televisão e som. O morador escolhe um cômodo e utiliza apenas os controles daquele contexto.

## Público

Morador para uso diário; administrador para configurar a central e, na versão Premium, sensores e vínculo de celulares. Não há recepção, camareira ou cardápio neste projeto.

## Navegação

Entrada do STAYCONTROL → Residência → Essencial ou Premium → painel da residência. O botão Trocar ambiente volta à escolha inicial. As versões usam conjuntos próprios de dados, separados dos dados do hotel.

## Documentos deste projeto

- [Essencial](ESSENCIAL.md)
- [Premium](PREMIUM.md)
- Apresentação: `dist/docs/residencia/index.html`

## Arquitetura e implantação

A arquitetura de referência usa console com Raspberry Pi 5 e tela touch de 7 polegadas, Arduino Mega ligado por USB e interfaces de baixa tensão. O protótipo demonstra 8 relés principais e até 8 auxiliares habilitados pela administração. O projeto ampliado prevê até 32 auxiliares adicionais e áudio de quatro canais, mas essas capacidades não estão implementadas no firmware atual. Essencial e Premium são níveis de software; não garantem automaticamente uma capacidade maior de relés ou potência de áudio.

TV, ar-condicionado por infravermelho, transmissão real de áudio Bluetooth e comandos de faixa ainda dependem de integração física. A interface mantém a identificação de demonstração e o Bluetooth exige aceite na tela. A ponte serial de relés, RGB fixo, sensores e sinalização existe no código, mas esta entrega de layout não valida uma instalação física. Projeto elétrico, montagem, dissipação e proteções devem ser definidos para os componentes e cargas reais.

Os arquivos técnicos compartilhados continuam em `hardware/`, `raspberry_pi/`, `server.py` e `lib/`. A separação documental não declara servidores, bancos ou instalações independentes já provisionados.

## Acesso pela apresentação

Selecione o ambiente, abra Administrador na tela Essencial/Premium e informe o PIN demonstrativo. Os links para a documentação geral e para cada versão ficam nessa área; os cartões públicos das versões exibem somente a entrada no aplicativo. Dentro de cada versão, a administração também oferece a aba Documentação.

Esta organização limita a navegação na interface de demonstração. Os HTMLs técnicos continuam sendo arquivos estáticos; confidencialidade por URL exige autenticação de servidor.
