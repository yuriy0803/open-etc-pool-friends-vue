# 🌐 Vue-Web Frontend & Backend Proxy — Installation Guide

Modern web user interface (Vue 3, Tailwind CSS, Vite) and Express.js proxy server for the **Open ETC Mining Pool**.

This guide covers complete installation, configuration, and production deployment on **Linux (x86_64)** as well as **ARM architectures (ARM64 / aarch64, Raspberry Pi 4/5, Oracle Cloud ARM, Apple Silicon)**.

---

## 📋 System Requirements

- **Operating System**: Linux (Ubuntu 20.04/22.04/24.04, Debian 11/12, Raspberry Pi OS 64-Bit, AlmaLinux/Rocky Linux, Arch Linux)
- **Architecture**: `x86_64` (AMD64) or `aarch64` / `arm64` (ARM)
- **Node.js**: Version **18.x LTS** or **20.x LTS / 22.x**
- **RAM**: At least 1 GB RAM (on ARM/Raspberry Pi boards, 1–2 GB Swap is recommended during the build process)

---

## 🚀 1. Install Node.js & Package Manager

### For Ubuntu / Debian / Raspberry Pi OS (x86_64 & ARM64)

Install the current Node.js LTS release (v20) via the official NodeSource repository:

```bash
# Update system & install essential tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# Set up NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

# Verify versions
node -v   # e.g., v20.x.x
npm -v    # e.g., 10.x.x
```

### For ARM / Raspberry Pi (Recommended: Configure Swap)

On devices with less than 2 GB RAM (e.g. Raspberry Pi), enabling extra swap memory prevents out-of-memory errors during build optimization:

```bash
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

---

## 📦 2. Clone & Install Dependencies

Navigate to the project root directory (where `package.json` and `server.js` are located):

```bash
# Navigate to project directory
cd /path/to/open-etc-pool-friends

# Install Node.js dependencies
npm install
```

---

## ⚙️ 3. Environment Configuration (`.env`)

Create your `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your preferred text editor (e.g., `nano`):

```bash
nano .env
```

Set the configuration values:
```env
# Server Port (default: 3000)
PORT=3000

# Upstream Pool API Endpoint (Kept private on the server, never committed to GitHub)
POOL_API_URL=https://your-pool-api.example.com/api
```

> 🔒 **Security Note**: The `.env` file is listed in `.gitignore` and is never pushed to public repositories.

---

## 🔨 4. Build the Vue-Web Frontend

Compile the Vue 3 application into production-ready static assets in the `dist/` directory:

```bash
# Build for production
npm run build
```

Once completed, the `dist/` directory contains all optimized HTML, JavaScript, CSS, and asset files.

---

## 🏃 5. Start the Application

### Development / Quick Test:
```bash
# Start server.js (serves API proxy and the static web UI)
node server.js
```
The server will be accessible at `http://localhost:3000` (or `http://YOUR_SERVER_IP:3000`).

---

## 🛡️ 6. Production Daemon (24/7 Background Service)

For high-availability 24/7 operation, choose one of the following methods:

### Option A: Using PM2 Process Manager (Recommended)

PM2 monitors the Node.js process and automatically restarts it on crashes or server reboots.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
pm2 start server.js --name "etc-pool-web"

# Check process status
pm2 status

# Enable auto-start on system boot
pm2 startup
pm2 save
```

Useful PM2 commands:
- View live logs: `pm2 logs etc-pool-web`
- Restart server: `pm2 restart etc-pool-web`
- Stop server: `pm2 stop etc-pool-web`

---

### Option B: Linux Systemd Service

Create a systemd service unit:

```bash
sudo nano /etc/systemd/system/etc-pool-web.service
```

Add the following unit configuration (adjust paths and user as needed):

```ini
[Unit]
Description=ETC Mining Pool Web Interface & API Proxy
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/open-etc-pool-friends
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

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable etc-pool-web
sudo systemctl start etc-pool-web

# Verify status & logs:
sudo systemctl status etc-pool-web
journalctl -u etc-pool-web -f
```

---

## 🌐 7. Nginx Reverse Proxy with SSL (HTTPS)

To serve the application on standard web ports (80/443) with your custom domain and SSL:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create an Nginx virtual host configuration (`/etc/nginx/sites-available/etc-pool.conf`):

```nginx
server {
    listen 80;
    server_name pool.yourdomain.com;

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

Enable the configuration and issue a free Let's Encrypt SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/etc-pool.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtain SSL Certificate:
sudo certbot --nginx -d pool.yourdomain.com
```

---

## 🔍 8. Troubleshooting & Performance Tips

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `npm run build` hangs/freezes on ARM | Insufficient memory during asset compression | Allocate swap space (`2048 MB`) or build on a PC and transfer the `dist/` directory. |
| `POOL_API_URL not configured` | Missing or empty `.env` | Copy `.env.example` to `.env` and configure `POOL_API_URL`. |
| Port 3000 already in use (`EADDRINUSE`) | Another process is bound to port 3000 | Check with `sudo lsof -i :3000` to terminate or change `PORT=3001` in `.env`. |
| Cannot access via browser | Firewall blocking port | Run `sudo ufw allow 3000/tcp` or `sudo ufw allow 'Nginx Full'`. |
