#!/usr/bin/env bash
set -u

echo "=== STAYCONTROL — DIAGNÓSTICO ==="
echo "Data: $(date)"
echo
echo "Serviço:"
systemctl --no-pager --full status staycontrol.service 2>/dev/null | head -n 12 || true
echo
echo "Página local:"
curl -fsS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:4173/ || echo "Servidor indisponível"
echo
echo "Arduino:"
ls -l /dev/ttyACM* /dev/ttyUSB* 2>/dev/null || echo "Nenhuma porta serial detectada"
echo
echo "Tela:"
xrandr --current 2>/dev/null | head -n 5 || echo "Execute dentro da sessão gráfica para consultar a tela"
