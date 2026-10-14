# Instalação na Raspberry Pi 5

## Sistema recomendado

- Raspberry Pi 5 com 4 GB ou 8 GB;
- Raspberry Pi OS 64-bit com ambiente gráfico;
- tela touch de 7 polegadas configurada no sistema;
- fonte oficial ou equivalente dimensionada para a Raspberry Pi 5;
- Arduino Mega ligado por USB somente depois do ensaio de bancada.

## Instalação

Copie toda a pasta `STAYCONTROL_Aplicativo` para a Raspberry Pi. Abra um
terminal dentro dela e execute:

```bash
sudo bash raspberry_pi/install.sh
sudo reboot
```

O instalador:

1. instala Python, Chromium, suporte serial e utilitários da tela;
2. copia o aplicativo para `/opt/staycontrol`;
3. cria o serviço `staycontrol.service`;
4. inicia o servidor local automaticamente;
5. abre `http://127.0.0.1:4173/#quarto` em tela cheia após o login gráfico;
6. adiciona o usuário ao grupo `dialout` para acesso ao Arduino.

## Comandos úteis

```bash
sudo systemctl status staycontrol
sudo systemctl restart staycontrol
bash raspberry_pi/diagnostico.sh
```

Para sair temporariamente do modo quiosque, conecte um teclado e pressione
`Alt+F4`.

## Comunicação com o Arduino

O serviço procura automaticamente `/dev/ttyACM*` e `/dev/ttyUSB*`. Quando o
firmware `hardware/staycontrol_mega.ino` estiver gravado, a interface mostrará
“controlador conectado”. Os botões dos relés e da fita RGB passam a enviar os
comandos definidos em `hardware/PROTOCOLO_SERIAL.md`.

O controle infravermelho da TV e do ar-condicionado exige a definição do módulo
emissor e a captura dos códigos de cada aparelho. A saída de áudio Bluetooth é
configurada no Raspberry Pi OS e precisa de ensaio com a placa de áudio escolhida.

## Tela e orientação

A interface se adapta à orientação horizontal ou vertical. Caso seja necessário
girar fisicamente a tela, faça a configuração no Raspberry Pi OS antes de ativar
o quiosque e confirme também a calibração do toque.

## Segurança

O serviço web fica acessível somente no próprio equipamento. O PIN 1215 é da
demonstração e deve ser substituído por autenticação individual antes de uma
instalação comercial. A parte elétrica em 127/220 V exige projeto, proteções,
gabinete e profissional habilitado.

## Alertas no celular fora de casa

O feed local já funciona pela rede Wi-Fi. Para Web Push com a tela fechada, siga
`documentacao/CONFIGURACAO_NOTIFICACOES_REMOTAS.md`. O modelo
`raspberry_pi/Caddyfile.casa-completa.modelo` publica somente o app móvel e as
rotas necessárias; administração e controle dos equipamentos continuam
bloqueados pela internet. É necessário registrar um subdomínio DuckDNS,
configurar o roteador e fornecer um e-mail real ao gerar as chaves VAPID.
