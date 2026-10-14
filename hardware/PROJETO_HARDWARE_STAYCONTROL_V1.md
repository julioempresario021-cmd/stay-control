# Projeto de hardware STAYCONTROL versão 1

## Decisão de arquitetura

O produto será dividido em três conjuntos. Essa separação mantém a interface próxima do hóspede, facilita manutenção e reduz a presença de tensão de rede junto ao Raspberry Pi e à tela.

1. **Console do quarto:** Raspberry Pi 5, tela tátil de 7 polegadas, Ethernet, Wi-Fi, Bluetooth e aplicação STAYCONTROL.
2. **Controlador de baixa tensão:** Arduino Mega, entradas de sensores, drivers RGB, emissores infravermelhos, interface de relés, áudio e conectores de manutenção.
3. **Quadro de potência:** contatores, relés apropriados, disjuntores, DR, DPS, bornes e cabeamento dimensionados pelo projeto elétrico.

O equipamento de referência mostra uma solução integrada com 8 relés, expansões, sensores, RGB, áudio, infravermelho, USB e LAN. O STAYCONTROL preserva essas funções, mas usa desenho elétrico e mecânico próprios e separa controle e potência.

## Capacidade do produto

- 8 saídas principais para iluminação e tomadas comandadas;
- 8 saídas auxiliares opcionais, habilitadas somente pelo administrador;
- 8 entradas de contato seco, com a entrada 1 reservada à porta;
- 2 zonas de infravermelho, uma para televisão e outra para ar-condicionado;
- 1 saída RGB de três canais com alimentação externa;
- sinalização externa vermelha e verde;
- áudio estéreo 2 × 15 W com entrada pelo DAC USB do Raspberry Pi;
- Bluetooth do Raspberry Pi, com confirmação de pareamento na tela;
- Ethernet Gigabit para integração com a central do hotel;
- USB de serviço entre Raspberry Pi e Arduino;
- barramento RS-485 reservado para futuras expansões remotas.

## Gabinetes propostos para o primeiro protótipo

As medidas abaixo são de engenharia preliminar e devem ser confirmadas em CAD depois da escolha física da tela, conectores e fontes.

| Conjunto | Medida inicial | Material | Observação |
|---|---:|---|---|
| Console tátil | 260 × 175 × 55 mm | ABS ou chapa com frente em acrílico | Ventilação ativa e acesso ao cartão microSD. |
| Caixa de controle compacta | 260 × 220 × 100 mm | Chapa pintada ou ABS antichama | Apenas baixa tensão, montagem adensada e conectores externos. |
| Quadro de potência | A definir | Quadro elétrico certificado | Dimensionado conforme quantidade e carga dos circuitos. |

### Opção de suporte articulado para o console

Além da fixação direta na parede, o console poderá usar um braço articulado de mesa ou bancada. A proposta utiliza base metálica aparafusada, passagem interna dos cabos, dois pivôs, giro lateral e ajuste de inclinação. A traseira do console deverá receber uma placa de fixação compatível com padrão VESA 75 × 75 mm ou adaptador próprio. O suporte selecionado deverá suportar pelo menos três vezes a massa final do console e impedir que o hóspede alcance ou force os cabos.

## Mapa funcional de conectores

| Código | Conector | Sinais | Uso |
|---|---|---|---|
| J1 | Relés principais | 8 comandos isolados | Canais 1 a 8. |
| J2 | Relés auxiliares | 8 comandos isolados | Canais 9 a 16; placa opcional. |
| J3 | Sensores | 8 entradas + comum | Porta, janela, presença e entradas futuras. |
| J4 | RGB | +12 V, R, G, B | Fita RGB com driver MOSFET e fusível próprio. |
| J5 | Infravermelho | IR TV, IR ar e comum | Drivers de LED IR de alta potência. |
| J6 | Sinalização | vermelho, verde e comum | Estado externo do quarto. |
| J7 | Áudio | L+, L−, R+, R− | Dois alto-falantes de 4 a 8 ohms. |
| J8 | Linha de áudio | L, R e GND | Saída do DAC USB para o amplificador. |
| J9 | Serviço USB | USB 2.0 | Comunicação Pi–Arduino e manutenção. |
| J10 | Rede | RJ45 Gigabit | Comunicação com a central do hotel. |
| J11 | Alimentação | 5 V e 12 V protegidos | Fontes separadas, identificadas e com fusíveis. |
| J12 | Expansão | RS-485 A/B, 12 V e GND | Reserva para módulos futuros endereçáveis. |

### Regra das conexões externas

Todas as ligações que entram ou saem da caixa de controle serão feitas por conectores de painel removíveis, polarizados, identificados e com trava. Nenhum chicote atravessará diretamente a chapa. Os conectores J1 a J8, J11 e J12 usarão famílias multipinos dimensionadas pela corrente e pela quantidade de vias; J9 será uma extensão USB de painel e J10 uma extensão RJ45 de painel. Cabos externos terão plugue correspondente, alívio de tração e identificação nas duas extremidades. Conectores sem uso receberão tampa protetora.

## Mapa de pinos do Arduino Mega

| Função | Pinos |
|---|---|
| Relés 1 a 16 | 22 a 37 |
| Sinal vermelho e verde | 38 e 39 |
| Sensores 1 a 8 | 2, 3, 4, 40, 41, 42, 43 e 44 |
| Fita RGB | 5, 6 e 7 PWM |
| Reserva IR | 8 e 9, usando driver externo |
| RS-485 futuro | Serial1, pinos 18 e 19 |

## Distribuição inicial dos oito relés

O administrador poderá trocar os nomes no aplicativo. A instalação elétrica deve manter uma tabela física com o canal real.

| Canal | Nome inicial | Tipo de carga |
|---:|---|---|
| 1 | Luz principal | Iluminação |
| 2 | Luz cabeceira | Iluminação |
| 3 | Luz banheiro | Iluminação |
| 4 | Luz de apoio | Iluminação |
| 5 | Tomada comandada 1 | Tomada via contator apropriado |
| 6 | Tomada comandada 2 | Tomada via contator apropriado |
| 7 | Cortina ou reserva | Interface específica |
| 8 | Reserva do quarto | Definida na instalação |

TV e ar-condicionado serão controlados por infravermelho. O compressor do ar-condicionado não será conectado a um módulo de relés genérico.

## Alimentação

- Raspberry Pi 5: fonte USB-C oficial de 27 W.
- Arduino, sensores e interfaces: fonte regulada de 5 V independente, dimensionada para todos os relés ativos.
- Áudio: fonte de 12 V dedicada ao amplificador.
- RGB e sinalização: fonte de 12 V calculada pela potência por metro da fita, com margem e fusível.
- Todas as fontes devem compartilhar referência somente onde o esquema exigir, evitando laços de terra no áudio.

## Regras para a placa de circuito

- A primeira unidade será montada com módulos comerciais e uma placa de interface própria de baixa tensão.
- A placa de interface terá conectores plugáveis, proteção contra inversão, fusível por ramo, indicação por LED e drivers transistorizados.
- Entradas externas terão filtro, proteção contra surtos de baixa energia e borne de contato seco.
- Trilhas de potência da fita RGB serão calculadas para a corrente real e não passarão pelo Arduino.
- A versão de produção deverá passar por revisão de esquemático, layout, isolação, temperatura e compatibilidade eletromagnética.
- A placa não deve misturar rede de 127/220 V com a eletrônica de controle no primeiro protótipo.

## Sequência de construção

1. Montar o console com Raspberry Pi, tela e fonte oficial.
2. Montar Arduino, uma placa de oito relés, sensor de porta, RGB, sinalização, IR e áudio em bancada.
3. Validar o protocolo serial e todos os estados sem tensão de rede.
4. Produzir a placa de interface de baixa tensão e o chicote identificado.
5. Construir o gabinete e verificar ventilação, manutenção e esforços nos conectores.
6. Contratar o projeto do quadro de potência e instalar contatores e proteções.
7. Realizar um quarto piloto por pelo menos sete dias de uso controlado.
8. Liberar a placa auxiliar e a replicação somente após os testes do piloto.

## Ensaios de aceitação

- inicialização com todos os relés em estado seguro;
- 500 ciclos por canal sem travamento do controlador;
- abertura e fechamento das oito entradas com filtragem de ruído;
- códigos infravermelhos de cada modelo real de TV e ar-condicionado;
- pareamento Bluetooth somente após aceite na tela;
- áudio sem ruído perceptível durante comutação de relés e RGB;
- recuperação automática após queda de energia;
- operação local durante indisponibilidade da internet;
- funcionamento dos estados livre, ocupado, arrumação e aguardando liberação;
- temperatura interna dos gabinetes dentro dos limites dos componentes;
- verificação final do quadro por profissional habilitado.

## Limite desta versão

Esta versão define a arquitetura, interfaces, gabinete inicial, mapa de pinos e firmware de bancada. O esquema eletrônico definitivo, a PCB de produção e o quadro de 127/220 V exigem as peças físicas escolhidas, levantamento das cargas, revisão de engenharia e ensaios antes da fabricação em série.

