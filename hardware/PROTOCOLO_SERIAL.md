# Protocolo serial STAYCONTROL

Configuração: **115200 baud, 8N1**, comandos terminados por `\n`.

| Comando enviado pela Raspberry Pi | Função |
|---|---|
| `PING` | Verifica a comunicação. |
| `GET STATE` | Solicita porta, estado do quarto e 16 relés. |
| `GET INPUTS` | Solicita as 8 entradas de contato seco. |
| `RELAY 1 ON` | Liga o relé 1. Canais válidos: 1 a 16. |
| `RELAY 1 OFF` | Desliga o relé 1. |
| `ALL OFF` | Desliga todos os relés e a fita RGB. |
| `STATUS FREE` | Apaga as luzes externas. |
| `STATUS OCCUPIED` | Acende a luz vermelha. |
| `STATUS CLEANING` | Acende a luz verde. |
| `STATUS WAITING` | Faz a luz verde piscar. |
| `RGB 53 184 255 70` | Define R, G, B e brilho de 0 a 100%. |

Respostas:

- `READY STAYCONTROL_MEGA_1`: controlador inicializado;
- `OK ...`: comando aceito;
- `ERR ...`: comando recusado;
- `EVENT SENSOR 1 OPEN/CLOSED`: alteração de uma das 8 entradas;
- `EVENT DOOR OPEN` ou `EVENT DOOR CLOSED`: cópia compatível do sensor 1, reservado para a porta;
- `STATE ...`: linha de estado solicitada por `GET STATE`.

## Mapa de pinos do firmware-base

- Relés 1–16: pinos digitais 22–37;
- sensores 1–8: pinos 2, 3, 4, 40, 41, 42, 43 e 44 com `INPUT_PULLUP`;
- sensor 1 reservado para a porta de entrada;
- sinal vermelho: pino 38;
- sinal verde: pino 39;
- RGB PWM: pinos 5, 6 e 7.

O firmware inicia com todos os relés desligados. Antes do primeiro ensaio,
confira se a placa de relés usa nível ativo baixo; ajuste `RELAY_ACTIVE_LOW`
no arquivo `.ino` quando necessário.
