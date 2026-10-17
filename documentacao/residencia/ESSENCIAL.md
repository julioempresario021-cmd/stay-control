# STAYCONTROL — Residência Essencial

Atualizado em 17/10/2026.

Entrada: `dist/index.html#casa`.

Documentação de apresentação: `dist/docs/residencia/essencial.html`.

## Finalidade

Controlar os equipamentos da residência por cômodo, em uma central de uso simples.

## Funções

Seleção de ambiente; 8 pontos principais de iluminação e tomadas; expansão atual de até 8 pontos auxiliares pela administração; RGB com energia, cor, brilho e efeitos demonstrativos; climatização; TV; volume; Bluetooth com confirmação; música anterior e próxima no protótipo.

## Administração

Renomear botões, configurar expansão, alterar mensagem e logo, consultar diagnóstico e usar os recursos existentes de backup. A configuração da expansão é reservada ao administrador. O PIN demonstrativo não é autenticação de produção.

## Dados e execução

Estado da interface guardado no navegador com a chave staycontrol-casa-v1. A troca de nome do layout não migra ou apaga esses dados. Execução local pelo servidor Python ou apresentação web da interface.

## Validação antes do piloto

Definir os cômodos e circuitos reais, confirmar cada comando em bancada, testar a recuperação após reiniciar, validar o toque na tela escolhida e verificar o comportamento sem comunicação com o controlador.

## Componentes e capacidade

A arquitetura de referência usa console com Raspberry Pi 5 e tela touch de 7 polegadas, Arduino Mega ligado por USB e interfaces de baixa tensão. O protótipo demonstra 8 relés principais e até 8 auxiliares habilitados pela administração. O projeto ampliado prevê até 32 auxiliares adicionais e áudio de quatro canais, mas essas capacidades não estão implementadas no firmware atual. Essencial e Premium são níveis de software; não garantem automaticamente uma capacidade maior de relés ou potência de áudio.

## Limites de integração

TV, ar-condicionado por infravermelho, transmissão real de áudio Bluetooth e comandos de faixa ainda dependem de integração física. A interface mantém a identificação de demonstração e o Bluetooth exige aceite na tela. A ponte serial de relés, RGB fixo, sensores e sinalização existe no código, mas esta entrega de layout não valida uma instalação física. Projeto elétrico, montagem, dissipação e proteções devem ser definidos para os componentes e cargas reais.

## Critérios de verificação

- A entrada residencial não exibe opções de Hotel.

- Cada ambiente conserva seus controles e nomes.

- O hóspede/recepção/camareira não aparecem no projeto residencial.

- Na Premium, os avisos permanecem registrados até o reconhecimento previsto.

- A alteração visual não modifica credenciais, chaves de dados ou regras de hardware.
