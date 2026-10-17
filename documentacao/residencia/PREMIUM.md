# STAYCONTROL — Residência Premium

Atualizado em 17/10/2026.

Entrada: `dist/index.html#casa-completa`.

Documentação de apresentação: `dist/docs/residencia/premium.html`.

## Finalidade

Reunir os controles da Casa Essencial com acompanhamento de portas e janelas e histórico de avisos.

## Funções adicionais

Até 8 entradas de sensores, nomes de sensores e ambientes configuráveis, habilitação por entrada, ativar/desativar monitoramento, histórico de aberturas e reconhecimento dos alertas. Uma abertura de sensor é um evento de contato; não comprova intrusão ou presença de uma pessoa.

## Aplicativo Minha Casa

PWA em celular.html para vínculo por código, histórico, filtros e leitura individual de avisos. O código inclui serviço móvel local e API cloud. Web Push exige HTTPS, chaves da instalação, internet e permissão do celular. E-mail depende de remetente configurado. O telefone cadastrado é referência; não significa envio por SMS.

## Dados e integração

Estado local da interface na chave staycontrol-casa-completa-v1. Serviço móvel local com SQLite e API Vercel com Neon Postgres, conforme o ambiente configurado. Os eventos de sensores podem ser enviados pela Raspberry Pi por HTTPS; a API remota não envia comandos aos relés.

## Administração e limites

Gerenciar entradas, ativar monitoramento após fechar sensores habilitados, reconhecer avisos após verificação, vincular ou revogar celulares e configurar contatos. Segredos ficam no servidor. Não há sirene implementada, nem validação como sistema de alarme certificado.

## Validação antes do piloto

Testar cada entrada real, persistência e reconhecimento de aviso, falhas de internet, revogação do celular e recebimento de notificação em aparelho físico. A disponibilidade do serviço e as permissões de produção devem ser verificadas na instalação.

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
