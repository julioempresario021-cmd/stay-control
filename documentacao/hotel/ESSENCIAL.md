# STAYCONTROL — Hotel Essencial

Atualizado em 17/10/2026.

Entrada: `dist/index.html#quarto`.

Documentação de apresentação: `dist/docs/hotel/essencial.html`.

## Finalidade

Uma central independente no quarto, com comandos intuitivos na tela touch do hóspede.

## Funções

Iluminação e tomadas em 8 relés principais; até 8 auxiliares no protótipo, habilitados pela administração; LED RGB; climatização e TV por comandos demonstrativos; som; Bluetooth com confirmação obrigatória; seleção demonstrativa de faixa; cardápio digital de consulta.

## Cardápio e marca

Administrador edita categorias, nomes, descrições e preços, além da logo e mensagem do hotel. O cardápio atual é de consulta: não representa pedidos enviados à cozinha nem pagamentos implementados. Os itens iniciais são exemplos.

## Administração

Configuração de botões e expansão, identidade visual, cardápio e recursos existentes de diagnóstico/backup. O hóspede não configura a placa auxiliar. A autenticação de produção ainda precisa ser definida antes de uso comercial.

## Dados e execução

O estado demonstrativo é guardado no navegador, na chave estadia-hotel-demo-v1. Hotel Essencial e Hotel Premium compartilham os quartos da demonstração; o projeto Hotel permanece separado das chaves usadas pela Residência.

## Validação antes do piloto

Verificar o acesso restrito ao quarto correto, a proteção administrativa, o pareamento Bluetooth físico com aceite, o controle real dos aparelhos e a recuperação após reiniciar. Confirmar o dimensionamento das cargas e do áudio.

## Componentes e capacidade

A arquitetura de referência usa console com Raspberry Pi 5 e tela touch de 7 polegadas, Arduino Mega ligado por USB e interfaces de baixa tensão. O protótipo demonstra 8 relés principais e até 8 auxiliares habilitados pela administração. O projeto ampliado prevê até 32 auxiliares adicionais e áudio de quatro canais, mas essas capacidades não estão implementadas no firmware atual. Essencial e Premium são níveis de software; não garantem automaticamente uma capacidade maior de relés ou potência de áudio.

## Limites de integração

TV, ar-condicionado por infravermelho, transmissão real de áudio Bluetooth e comandos de faixa ainda dependem de integração física. A interface mantém a identificação de demonstração e o Bluetooth exige aceite na tela. A ponte serial de relés, RGB fixo, sensores e sinalização existe no código, mas esta entrega de layout não valida uma instalação física. Projeto elétrico, montagem, dissipação e proteções devem ser definidos para os componentes e cargas reais.

## Critérios de verificação

- A entrada do hotel não exibe versões residenciais.

- Essencial abre os controles do quarto; Premium abre a central do hotel.

- O sensor de porta não muda a ocupação sozinho.

- Pendências impedem a liberação até serem resolvidas e a vistoria ser concluída.

- Sinalização e nomes dos estados preservam a regra acordada.
