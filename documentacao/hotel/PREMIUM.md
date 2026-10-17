# STAYCONTROL — Hotel Premium

Atualizado em 17/10/2026.

Entrada: `dist/index.html#completa`.

Documentação de apresentação: `dist/docs/hotel/premium.html`.

## Finalidade

Integrar a experiência do quarto às tarefas da recepção, administração e camareira.

## Funções adicionais

Mapa de quartos, filtros e busca, check-in, checkout, indicação de porta, arrumação, registro de pendências, vistoria e histórico de atividades. Inclui os controles e o cardápio da Hotel Essencial.

## Fluxo de trabalho

Recepção registra check-in e o quarto fica Ocupado. Após checkout, fica Aguardando liberação. Camareira inicia arrumação, resolve pendências e conclui a vistoria. A liberação torna o quarto Livre. O sensor de porta informa abertura/fechamento e não altera a ocupação sozinho.

## Sinalização acordada

Livre: verde e vermelha apagadas. Ocupado: vermelha acesa. Em arrumação: verde acesa. Aguardando liberação: verde piscando. A cor de fundo dos cartões é apoio visual da interface, distinto das luzes físicas da porta.

## Dados e limites atuais

O fluxo da recepção e da camareira é demonstrativo no navegador e não oferece sincronização de operação entre dispositivos. A API móvel residencial não implementa a operação do hotel. Uso real exige servidor compartilhado, contas individuais, permissões por função e quarto e confirmação das alterações concorrentes.

## Administração

Personalizar a marca e o cardápio, nomear botões por quarto, habilitar expansão e consultar os recursos existentes. A área não representa ainda um sistema completo de gestão hoteleira, reservas ou faturamento.

## Validação antes do piloto

Testar ciclo check-in → checkout → arrumação → vistoria → livre; bloqueio por pendência; sinalização física; autenticação individual; acesso do hóspede ao próprio quarto; concorrência e sincronização real de recepção e camareira.

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
