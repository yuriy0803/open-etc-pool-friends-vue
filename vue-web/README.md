# 🌐 Vue-Web Frontend & Backend Proxy — Installationsanleitung

Moderne Benutzeroberfläche (Vue 3, Tailwind CSS, Vite) und Express.js Proxy-Server für den **Open ETC Mining Pool**.

Diese Anleitung beschreibt die vollständige Installation, Konfiguration und den Produktivbetrieb auf **Linux (x86_64)** sowie **ARM-Systemen (ARM64 / aarch64, Raspberry Pi 4/5, Oracle Cloud ARM)**.

---

## 📋 Systemvoraussetzungen

- **Betriebssystem**: Linux (Ubuntu 20.04/22.04/24.04, Debian 11/12, Raspberry Pi OS 64-Bit, AlmaLinux/Rocky Linux)
- **Architektur**: `x86_64` (AMD64) oder `aarch64` / `arm64` (ARM)
- **Node.js**: Version **18.x LTS** oder **20.x LTS / 22.x**
- **RAM**: Mindestens 1 GB RAM (für ARM/Raspberry Pi wird 1 GB Swap empfohlen während des Builds)

---

## 🚀 1. Node.js & Paketmanager installieren

### Für Ubuntu / Debian / Raspberry Pi OS (x86_64 & ARM64)

Installiere die aktuelle Node.js LTS Version (z. B. v20) über das offizielle NodeSource-Repository:

```bash
# System aktualisieren & Basispakete installieren
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# NodeSource Node.js 20 LTS Repository einrichten
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js und npm installieren
sudo apt install -y nodejs

# Versionen überprüfen
node -v   # z.B. v20.x.x
npm -v    # z.B. 10.x.x
```

### Für ARM / Raspberry Pi (Empfohlen: Swap einrichten)

Auf Geräten mit weniger als 2 GB RAM (z. B. Raspberry Pi) empfiehlt sich temporärer Swap-Speicher für den Build-Prozess:

```bash
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

---

## 📦 2. Installation & Abhängigkeiten

Navigiere in das Stammverzeichnis des Projekts (dort wo `package.json` und `server.js` liegen):

```bash
# In das Projektverzeichnis wechseln
cd /pfad/zu/open-etc-pool-friends

# Node.js Abhängigkeiten installieren
npm install
```

---

## ⚙️ 3. Konfiguration (`.env`)

Erstelle eine `.env`-Datei im Stammverzeichnis basierend auf `.env.example`:

```bash
cp .env.example .env
```

Bearbeite die Datei `.env` mit deinem bevorzugten Editor (z. B. `nano`):

```bash
nano .env
```

Inhalt der `.env`:
```env
# Port für den Webserver / Proxy (Standard: 3000)
PORT=3000

# Upstream Pool API Endpoint (Wird im Backend gehalten und nicht an GitHub übertragen)
POOL_API_URL=https://etc-api.pool2mine.net/api
```

> 🔒 **Sicherheitshinweis**: Die `.env`-Datei ist in `.gitignore` eingetragen und wird niemals auf GitHub veröffentlicht.

---

## 🔨 4. Vue-Web Frontend bauen

Das Frontend wird mit Vite kompiliert und in den Ordner `dist/` geschrieben:

```bash
# Produktions-Build erstellen
npm run build
```

Nach erfolgreichem Build enthält der Ordner `dist/` alle statischen HTML-, CSS- und JS-Dateien.

---

## 🏃 5. Starten des Servers

### Entwicklung / Schnelltest:
```bash
# Startet server.js (liefert API-Proxy und Web-Frontend aus)
node server.js
```
Der Server läuft standardmäßig auf `http://localhost:3000` (bzw. `http://DEINE_IP:3000`).

---

## 🛡️ 6. Produktivbetrieb (Dauerhafter Hintergrunddienst)

Für einen stabilen 24/7-Betrieb stehen zwei empfohlene Optionen zur Verfügung:

### Option A: Mit PM2 Process Manager (Empfohlen)

PM2 überwacht den Node-Prozess und startet ihn bei Abstürzen oder Systemneustarts automatisch neu.

```bash
# PM2 global installieren
sudo npm install -g pm2

# Server mit PM2 starten
pm2 start server.js --name "etc-pool-web"

# Status prüfen
pm2 status

# Autostart bei System-Boot aktivieren
pm2 startup
pm2 save
```

Nützliche PM2 Befehle:
- Logs anzeigen: `pm2 logs etc-pool-web`
- Neustarten: `pm2 restart etc-pool-web`
- Stoppen: `pm2 stop etc-pool-web`

---

### Option B: Als Linux Systemd Service

Erstelle eine Service-Datei für systemd:

```bash
sudo nano /etc/systemd/system/etc-pool-web.service
```

Füge folgenden Inhalt ein (Pfade und Benutzer anpassen):

```ini
[Unit]
Description=ETC Pool Vue Web and API Proxy
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/pfad/zu/open-etc-pool-friends
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=etc-pool-web
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Dienst aktivieren und starten:

```bash
sudo systemctl daemon-reload
sudo systemctl enable etc-pool-web
sudo systemctl start etc-pool-web

# Status & Logs prüfen:
sudo systemctl status etc-pool-web
journalctl -u etc-pool-web -f
```

---

## 🌐 7. Nginx Reverse Proxy mit SSL (Optional & Empfohlen)

Um die Seite über eine Domain mit HTTPS (Port 443 / 80) erreichbar zu machen:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Nginx-Konfiguration erstellen (`/etc/nginx/sites-available/pool.conf`):

```nginx
server {
    listen 80;
    server_name pool.deinedomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivieren und SSL-Zertifikat von Let's Encrypt holen:

```bash
sudo ln -s /etc/nginx/sites-available/pool.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Kostenloses SSL-Zertifikat einrichten:
sudo certbot --nginx -d pool.deinedomain.com
```

---

## 🔍 8. Fehlerbehebung & Tipps

| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| `npm run build` friert auf ARM ein | Zu wenig RAM während der Optimierung | Swap-Speicher vergrößern (`2048 MB`) oder lokal auf PC bauen und `dist/` hochladen. |
| `POOL_API_URL not configured` | `.env` fehlt oder ist leer | `cp .env.example .env` ausführen und `POOL_API_URL` eintragen. |
| Port 3000 belegt (`EADDRINUSE`) | Ein anderer Prozess nutzt Port 3000 | Mit `sudo lsof -i :3000` prüfen und Prozess beenden oder `PORT=3001` in `.env` setzen. |
| Firewall blockiert Zugriff | UFW / iptables sperrt Port | `sudo ufw allow 3000/tcp` oder `sudo ufw allow 'Nginx Full'` |
