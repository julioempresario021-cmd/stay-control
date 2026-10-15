# STAYCONTROL — guia de compra e segurança

Este pacote inclui a planilha `STAYCONTROL_Lista_de_Compras.xlsx`. Abra a aba **Resumo** e altere somente:

1. a quantidade de quartos;
2. se cada quarto terá o banco auxiliar de 32 relés (duas placas de 16 canais; `0` ou `1`);
3. se o orçamento inclui a central e a rede completa (`0` ou `1`).

As quantidades e os subtotais serão atualizados automaticamente. Os preços são referências para planejamento e devem ser confirmados antes da compra.

## Ordem recomendada de compra

1. Monte um único quarto piloto com Raspberry Pi 5, tela de 7 polegadas, Arduino Mega, placa principal de 8 relés, sensor de porta, infravermelho, RGB e áudio de quatro canais.
2. Teste TV e ar-condicionado por infravermelho usando os equipamentos reais do hotel.
3. Teste o pareamento Bluetooth com confirmação na tela, áudio nos quatro canais e recuperação após queda de energia.
4. O banco opcional previsto contém duas placas de 16 relés. Só compre após validar a interface de comando, o firmware e a fonte para os 32 canais auxiliares.
5. Faça o levantamento elétrico e da rede do hotel antes de comprar itens de produção em quantidade.
6. Replique o conjunto aprovado nos demais quartos.

## Regras elétricas

- O Raspberry Pi, o Arduino e os módulos de baixa tensão devem ficar separados fisicamente da rede elétrica.
- O compressor do ar-condicionado não deve ser ligado diretamente por uma placa de relés genérica. O projeto controla o aparelho por infravermelho.
- Iluminação e tomadas ligadas à rede exigem contatores, disjuntores, DR, DPS, cabos e aterramento dimensionados conforme a instalação real.
- Um profissional habilitado deve executar e testar a parte elétrica.
- A placa de relé informa capacidade nominal do contato, mas isso não substitui o cálculo da carga, corrente de partida, proteção e vida útil.

## Observações de compatibilidade

- O firmware fornecido foi preparado para Arduino Mega 2560.
- Use a fonte oficial USB-C de 27 W no Raspberry Pi 5.
- A fita RGB requer fonte externa e driver MOSFET; não deve ser ligada diretamente ao Arduino.
- Use uma fonte dedicada para o amplificador de áudio para reduzir ruído.
- O Raspberry Pi 5 já possui Bluetooth. O adaptador USB de áudio fornece a saída analógica para o amplificador.
- Confirme cabos DSI e suporte mecânico compatíveis com a tela e com o Raspberry Pi 5.
- O áudio planejado é 4 × 50 W RMS: requer quatro canais de amplificação, quatro alto-falantes compatíveis, DAC de quatro canais e fonte dedicada. A potência depende de tensão, impedância, distorção e refrigeração.
- A versão atual do firmware não comanda 32 auxiliares nem quatro canais de áudio; essas expansões precisam ser implementadas e validadas.

