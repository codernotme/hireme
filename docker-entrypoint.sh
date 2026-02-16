#!/bin/sh
set -e
# Seed bot config dir when volume is empty (preserve Python modules)
CONFIG_DIR="/app/bot/config"
SEED_DIR="/app/bot/config_seed"
if [ -d "$SEED_DIR" ] && [ ! -f "$CONFIG_DIR/settings.py" ]; then
  cp -r "$SEED_DIR"/* "$CONFIG_DIR/" 2>/dev/null || true
fi
exec node server.js
