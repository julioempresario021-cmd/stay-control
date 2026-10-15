#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Execute com: sudo bash raspberry_pi/install.sh"
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_USER="${SUDO_USER:-pi}"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
INSTALL_DIR="/opt/staycontrol"

if [[ -z "$TARGET_HOME" ]]; then
  echo "Usuário $TARGET_USER não encontrado."
  exit 1
fi

echo "Instalando dependências..."
apt-get update
apt-get install -y python3 python3-venv python3-serial chromium curl unclutter x11-xserver-utils

echo "Copiando a STAYCONTROL para $INSTALL_DIR..."
install -d -m 755 "$INSTALL_DIR"
python3 -m venv --system-site-packages "$INSTALL_DIR/venv"
chown -R "$TARGET_USER:$TARGET_USER" "$INSTALL_DIR/venv"
rm -rf "$INSTALL_DIR/dist" "$INSTALL_DIR/hardware"
cp -a "$SOURCE_DIR/dist" "$INSTALL_DIR/dist"
cp -a "$SOURCE_DIR/hardware" "$INSTALL_DIR/hardware"
install -m 755 "$SOURCE_DIR/server.py" "$INSTALL_DIR/server.py"
install -m 644 "$SOURCE_DIR/mobile_notifications.py" "$INSTALL_DIR/mobile_notifications.py"
install -d -m 700 -o "$TARGET_USER" -g "$TARGET_USER" "$TARGET_HOME/.local/share/staycontrol"

cat > /etc/systemd/system/staycontrol.service <<EOF
[Unit]
Description=Servidor local STAYCONTROL
After=network.target

[Service]
Type=simple
User=$TARGET_USER
Group=$TARGET_USER
WorkingDirectory=$INSTALL_DIR
Environment=STAYCONTROL_DATA_DIR=$TARGET_HOME/.local/share/staycontrol
EnvironmentFile=-/etc/staycontrol/cloud.env
ExecStart=$INSTALL_DIR/venv/bin/python $INSTALL_DIR/server.py --port 4173 --no-browser --serial auto
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

install -d -o "$TARGET_USER" -g "$TARGET_USER" "$TARGET_HOME/.local/bin"
install -m 755 -o "$TARGET_USER" -g "$TARGET_USER" "$SOURCE_DIR/raspberry_pi/kiosk.sh" "$TARGET_HOME/.local/bin/staycontrol-kiosk.sh"
install -d -o "$TARGET_USER" -g "$TARGET_USER" "$TARGET_HOME/.config/autostart"
cat > "$TARGET_HOME/.config/autostart/staycontrol-kiosk.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=STAYCONTROL
Comment=Painel touch do quarto
Exec=$TARGET_HOME/.local/bin/staycontrol-kiosk.sh
Terminal=false
X-GNOME-Autostart-enabled=true
EOF
chown "$TARGET_USER:$TARGET_USER" "$TARGET_HOME/.config/autostart/staycontrol-kiosk.desktop"

usermod -a -G dialout "$TARGET_USER"
systemctl daemon-reload
systemctl enable --now staycontrol.service

echo
echo "STAYCONTROL instalada."
echo "Reinicie a Raspberry Pi: sudo reboot"
echo "Após o reinício, a tela abrirá em modo quiosque."
