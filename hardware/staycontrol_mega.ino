/*
  STAYCONTROL — firmware-base para Arduino Mega 2560
  Firmware demonstrativo: 8 relés principais + 8 auxiliares, 8 entradas de contato seco,
  banco futuro de 32 auxiliares e áudio futuro 4 x 50 W RMS ainda não implementados,
  sinalização externa e fita RGB.

  ATENÇÃO: firmware de bancada. Confira o mapa de pinos e o nível ativo da
  placa de relés antes de energizar qualquer carga. Instalação em 127/220 V
  exige projeto e profissional habilitado.
*/

const bool RELAY_ACTIVE_LOW = true;
const byte RELAY_PINS[16] = {
  22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 37
};
const byte DOOR_PIN = 2;
const byte RED_STATUS_PIN = 38;
const byte GREEN_STATUS_PIN = 39;
const byte RGB_R_PIN = 5;
const byte RGB_G_PIN = 6;
const byte RGB_B_PIN = 7;
const byte SENSOR_PINS[8] = {2, 3, 4, 40, 41, 42, 43, 44};

enum RoomStatus { FREE_ROOM, OCCUPIED, CLEANING, WAITING_RELEASE };
RoomStatus roomStatus = FREE_ROOM;
bool relayState[16] = {false};
bool sensorOpen[8] = {false};
bool sensorCandidate[8] = {false};
unsigned long sensorChangedAt[8] = {0};
unsigned long lastSensorRead = 0;
unsigned long lastBlink = 0;
bool blinkOn = false;
String inputLine;

void writeRelay(byte index, bool on) {
  if (index >= 16) return;
  relayState[index] = on;
  bool level = RELAY_ACTIVE_LOW ? !on : on;
  digitalWrite(RELAY_PINS[index], level ? HIGH : LOW);
}

void allRelaysOff() {
  for (byte i = 0; i < 16; i++) writeRelay(i, false);
}

void setRgb(byte r, byte g, byte b, byte brightness) {
  analogWrite(RGB_R_PIN, (unsigned int)r * brightness / 100);
  analogWrite(RGB_G_PIN, (unsigned int)g * brightness / 100);
  analogWrite(RGB_B_PIN, (unsigned int)b * brightness / 100);
}

void updateStatusLights() {
  bool red = roomStatus == OCCUPIED;
  bool green = roomStatus == CLEANING || (roomStatus == WAITING_RELEASE && blinkOn);
  digitalWrite(RED_STATUS_PIN, red ? HIGH : LOW);
  digitalWrite(GREEN_STATUS_PIN, green ? HIGH : LOW);
}

void sendState() {
  Serial.print(F("STATE STATUS "));
  const char* names[] = {"FREE", "OCCUPIED", "CLEANING", "WAITING"};
  Serial.print(names[roomStatus]);
  Serial.print(F(" DOOR "));
  Serial.println(sensorOpen[0] ? F("OPEN") : F("CLOSED"));
  for (byte i = 0; i < 8; i++) {
    Serial.print(F("STATE SENSOR "));
    Serial.print(i + 1);
    Serial.print(' ');
    Serial.println(sensorOpen[i] ? F("OPEN") : F("CLOSED"));
  }
  for (byte i = 0; i < 16; i++) {
    Serial.print(F("STATE RELAY "));
    Serial.print(i + 1);
    Serial.print(' ');
    Serial.println(relayState[i] ? F("ON") : F("OFF"));
  }
}

void replyError(const __FlashStringHelper* message) {
  Serial.print(F("ERR "));
  Serial.println(message);
}

void handleCommand(String command) {
  command.trim();
  command.toUpperCase();

  if (command == "PING") {
    Serial.println(F("OK PONG STAYCONTROL_MEGA_1"));
    return;
  }
  if (command == "GET STATE") {
    sendState();
    Serial.println(F("OK STATE"));
    return;
  }
  if (command == "GET INPUTS") {
    for (byte i = 0; i < 8; i++) {
      Serial.print(F("STATE SENSOR "));
      Serial.print(i + 1);
      Serial.print(' ');
      Serial.println(sensorOpen[i] ? F("OPEN") : F("CLOSED"));
    }
    Serial.println(F("OK INPUTS"));
    return;
  }
  if (command == "ALL OFF") {
    allRelaysOff();
    setRgb(0, 0, 0, 0);
    Serial.println(F("OK ALL OFF"));
    return;
  }
  if (command.startsWith("RELAY ")) {
    int firstSpace = command.indexOf(' ');
    int secondSpace = command.indexOf(' ', firstSpace + 1);
    if (secondSpace < 0) { replyError(F("RELAY FORMAT")); return; }
    int channel = command.substring(firstSpace + 1, secondSpace).toInt();
    String value = command.substring(secondSpace + 1);
    if (channel < 1 || channel > 16 || (value != "ON" && value != "OFF")) {
      replyError(F("RELAY VALUE")); return;
    }
    writeRelay(channel - 1, value == "ON");
    Serial.print(F("OK RELAY ")); Serial.print(channel); Serial.print(' '); Serial.println(value);
    return;
  }
  if (command.startsWith("STATUS ")) {
    String value = command.substring(7);
    if (value == "FREE") roomStatus = FREE_ROOM;
    else if (value == "OCCUPIED") roomStatus = OCCUPIED;
    else if (value == "CLEANING") roomStatus = CLEANING;
    else if (value == "WAITING") roomStatus = WAITING_RELEASE;
    else { replyError(F("STATUS VALUE")); return; }
    updateStatusLights();
    Serial.print(F("OK STATUS ")); Serial.println(value);
    return;
  }
  if (command.startsWith("RGB ")) {
    int r, g, b, brightness;
    if (sscanf(command.c_str(), "RGB %d %d %d %d", &r, &g, &b, &brightness) != 4 ||
        r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 ||
        brightness < 0 || brightness > 100) {
      replyError(F("RGB VALUE")); return;
    }
    setRgb((byte)r, (byte)g, (byte)b, (byte)brightness);
    Serial.println(F("OK RGB"));
    return;
  }
  replyError(F("UNKNOWN COMMAND"));
}

void setup() {
  Serial.begin(115200);
  inputLine.reserve(80);
  for (byte i = 0; i < 16; i++) {
    // Configure o nível desligado antes de habilitar a saída para evitar pulso.
    digitalWrite(RELAY_PINS[i], RELAY_ACTIVE_LOW ? HIGH : LOW);
    pinMode(RELAY_PINS[i], OUTPUT);
  }
  for (byte i = 0; i < 8; i++) pinMode(SENSOR_PINS[i], INPUT_PULLUP);
  pinMode(RED_STATUS_PIN, OUTPUT);
  pinMode(GREEN_STATUS_PIN, OUTPUT);
  pinMode(RGB_R_PIN, OUTPUT);
  pinMode(RGB_G_PIN, OUTPUT);
  pinMode(RGB_B_PIN, OUTPUT);
  allRelaysOff();
  setRgb(0, 0, 0, 0);
  for (byte i = 0; i < 8; i++) {
    sensorOpen[i] = digitalRead(SENSOR_PINS[i]) == HIGH;
    sensorCandidate[i] = sensorOpen[i];
  }
  updateStatusLights();
  Serial.println(F("READY STAYCONTROL_MEGA_1"));
}

void loop() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      handleCommand(inputLine);
      inputLine = "";
    } else if (c != '\r' && inputLine.length() < 79) {
      inputLine += c;
    }
  }

  unsigned long now = millis();
  if (now - lastSensorRead >= 10) {
    lastSensorRead = now;
    for (byte i = 0; i < 8; i++) {
      bool reading = digitalRead(SENSOR_PINS[i]) == HIGH;
      if (reading != sensorCandidate[i]) {
        sensorCandidate[i] = reading;
        sensorChangedAt[i] = now;
      }
      if (reading != sensorOpen[i] && now - sensorChangedAt[i] >= 40) {
        sensorOpen[i] = reading;
        Serial.print(F("EVENT SENSOR "));
        Serial.print(i + 1);
        Serial.print(' ');
        Serial.println(reading ? F("OPEN") : F("CLOSED"));
        if (i == 0) {
          Serial.print(F("EVENT DOOR "));
          Serial.println(reading ? F("OPEN") : F("CLOSED"));
        }
      }
    }
  }
  if (now - lastBlink >= 650) {
    lastBlink = now;
    blinkOn = !blinkOn;
    updateStatusLights();
  }
}
