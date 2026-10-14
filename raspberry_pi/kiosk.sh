#!/usr/bin/env bash
set -u

URL="${STAYCONTROL_URL:-http://127.0.0.1:4173/#quarto}"

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:4173/" >/dev/null; then
    break
  fi
  sleep 1
done

xset s off 2>/dev/null || true
xset -dpms 2>/dev/null || true
xset s noblank 2>/dev/null || true
unclutter -idle 1 -root >/dev/null 2>&1 &

if command -v chromium >/dev/null 2>&1; then
  BROWSER=chromium
elif command -v chromium-browser >/dev/null 2>&1; then
  BROWSER=chromium-browser
else
  echo "Chromium não encontrado."
  exit 1
fi

exec "$BROWSER" \
  --kiosk \
  --app="$URL" \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  --touch-events=enabled
