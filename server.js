import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Upstream Pool API URL from environment variable (never hardcoded in git)
const POOL_API_URL = (process.env.POOL_API_URL || '').replace(/\/+$/, '');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CoinGecko Price Cache
let priceCache = null;
let lastPriceFetch = 0;

async function getEtcPrice() {
  const now = Date.now();
  if (priceCache && now - lastPriceFetch < 60000) {
    return priceCache;
  }
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/ethereum-classic', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'etc-pool-vue/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      priceCache = data;
      lastPriceFetch = now;
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch CoinGecko price, using cached/fallback:', err.message);
  }

  if (priceCache) return priceCache;

  return {
    genesis_date: "2015-07-30",
    market_data: {
      current_price: { usd: 28.45, btc: 0.000425 },
      high_24h: { usd: 29.80, btc: 0.000441 },
      low_24h: { usd: 27.90, btc: 0.000418 },
      price_change_24h_in_currency: { btc: 0.0000035 },
      price_change_percentage_24h_in_currency: { btc: 1.85 },
      market_cap_rank: 32
    }
  };
}

// Special route for /api/price
app.get('/api/price', async (_req, res) => {
  const data = await getEtcPrice();
  res.json(data);
});

// Proxy all other /api/* requests to POOL_API_URL
app.use('/api', async (req, res) => {
  if (!POOL_API_URL) {
    // Dynamic high-fidelity simulator mode to ensure instant preview works out of the box
    const apiPath = req.path;
    const nowSec = Math.floor(Date.now() / 1000);

    // Helpers to generate dynamic chart lists
    const makeChart = (baseValue, variancePercent, count = 25) => {
      const arr = [];
      for (let i = count - 1; i >= 0; i--) {
        const time = nowSec - i * 600; // 10 min steps
        const randomMultiplier = 1 + (Math.random() - 0.5) * (variancePercent / 100);
        arr.push({ x: time, y: Math.round(baseValue * randomMultiplier) });
      }
      return arr;
    };

    if (apiPath === '/stats' || apiPath === '/stats/') {
      return res.json({
        hashrate: 458293100000 + Math.floor((Math.random() - 0.5) * 5000000000), // ~458 GH/s
        minersTotal: 12,
        totalWorkers: 34,
        nodes: [
          {
            difficulty: 17179869184000, // 17.18 T
            height: 20458120 + Math.floor((Date.now() - 1782359200000) / 13000), // ~13s block time
            name: "ETC Node #1"
          }
        ],
        poolCharts: makeChart(458293100000, 4),
        workerCharts: makeChart(34, 8),
        netCharts: makeChart(17179869184000, 1)
      });
    }

    if (apiPath === '/miners' || apiPath === '/miners/') {
      return res.json({
        miners: {
          "0x71C7656EC7ab88b098defB751B7401B5f6d1476B": { hr: 120500000000, lastBeat: nowSec - 12 },
          "0x29D7d1dd5B6f9C864d9db560D72a247c178ae86B": { hr: 95200000000, lastBeat: nowSec - 34 },
          "0x90F8bf6A479f320ced073E8273B2518772421497": { hr: 78400000000, lastBeat: nowSec - 122 },
          "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": { hr: 55100000000, lastBeat: nowSec - 45 },
          "0x90e63c3d53e0E0b3D98E101f3d32E3cc5ef8f8a1": { hr: 42300000000, lastBeat: nowSec - 90 },
          "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b": { hr: 33100000000, lastBeat: nowSec - 10 },
          "0x0d1d4e623D10f9F75db95830b7d38D4058240f55": { hr: 22400000000, lastBeat: nowSec - 200 },
          "0xe0fc37dbb85f269a8e9903b6e828d0ee5df15cd7": { hr: 11300000000, lastBeat: nowSec - 350 }
        }
      });
    }

    if (apiPath === '/blocks' || apiPath === '/blocks/') {
      return res.json({
        maturedTotal: 142,
        immatureTotal: 2,
        candidatesTotal: 0,
        matured: [
          {
            height: 20458115,
            hash: "0x5c7f8a7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583a",
            reward: "2560000000000000000",
            difficulty: 17179869184000,
            shares: 16900000000000,
            timestamp: nowSec - 600
          },
          {
            height: 20458112,
            hash: "0xfb6a479f320ced073E8273B2518772421497a6f0e616f86b098defB751B7401b",
            reward: "2500000000000000000",
            difficulty: 17165000000000,
            shares: 17200000000000,
            timestamp: nowSec - 1800
          },
          {
            height: 20458105,
            hash: "0xd9db560D72a247c178ae86B0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
            reward: "2520000000000000000",
            difficulty: 17179869184000,
            shares: 15100000000000,
            timestamp: nowSec - 3200
          },
          {
            height: 20458098,
            hash: "0xe86B0x71C7656EC7ab88b098defB751B7401B5f6d1476B0xd9db560D72a247c178a",
            reward: "2500000000000000000",
            difficulty: 17150000000000,
            shares: 18100000000000,
            timestamp: nowSec - 5400
          },
          {
            height: 20458091,
            hash: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC0xf2f8d1c7d3ef5123a1a16e82",
            reward: "2600000000000000000",
            difficulty: 17179869184000,
            shares: 16900000000000,
            timestamp: nowSec - 7800
          }
        ],
        immature: [
          {
            height: 20458118,
            hash: "0xbc8f2a6f0e616f86b098defB751B7401b0xd9db560D72a247c178ae86B0x71C76",
            reward: "2500000000000000000",
            difficulty: 17179869184000,
            shares: 17500000000000,
            timestamp: nowSec - 120
          },
          {
            height: 20458117,
            hash: "0x6f86b098defB751B7401b0xd9db560D72a247c178ae86B0x71C760xbc8f2a6f0e",
            reward: "2500000000000000000",
            difficulty: 17179869184000,
            shares: 16100000000000,
            timestamp: nowSec - 280
          }
        ],
        candidates: [],
        luck: [
          {
            shares: 16800000000000,
            difficulty: 17179869184000,
            uncleRate: 1.45
          }
        ]
      });
    }

    if (apiPath === '/payments' || apiPath === '/payments/') {
      return res.json({
        payments: [
          {
            timestamp: nowSec - 3600,
            address: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
            amount: "14500000000000000000", // 14.5 ETC
            tx: "0xf2f8d1c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583a"
          },
          {
            timestamp: nowSec - 10800,
            address: "0x29D7d1dd5B6f9C864d9db560D72a247c178ae86B",
            amount: "12200000000000000000", // 12.2 ETC
            tx: "0xe1a3d4c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583b"
          },
          {
            timestamp: nowSec - 18000,
            address: "0x90F8bf6A479f320ced073E8273B2518772421497",
            amount: "9500000000000000000", // 9.5 ETC
            tx: "0xd0b2c1c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583c"
          },
          {
            timestamp: nowSec - 25200,
            address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            amount: "6800000000000000000", // 6.8 ETC
            tx: "0xc0a1d4c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583d"
          }
        ]
      });
    }

    if (apiPath === '/live_stats' || apiPath === '/live_stats/') {
      return res.json({
        hashrate: 458293100000,
        minersTotal: 12,
        totalWorkers: 34
      });
    }

    // Match accounts details
    const accountMatch = apiPath.match(/^\/accounts\/([^/]+)$/);
    if (accountMatch) {
      const address = accountMatch[1];
      let hash = 45000000000; // default 45 GH/s
      if (address === "0x71C7656EC7ab88b098defB751B7401B5f6d1476B") hash = 120500000000;
      else if (address === "0x29D7d1dd5B6f9C864d9db560D72a247c178ae86B") hash = 95200000000;
      else if (address === "0x90F8bf6A479f320ced073E8273B2518772421497") hash = 78400000000;
      else {
        // Generate deterministic stats for searching custom addresses
        let code = 0;
        for (let i = 0; i < address.length; i++) {
          code += address.charCodeAt(i);
        }
        hash = 10000000000 + (code % 100) * 1000000000; // 10 to 110 GH/s
      }

      return res.json({
        currentHashrate: hash,
        hashrate: hash * 0.96,
        workers: {
          "Rig-Alpha": {
            hr: hash * 0.6,
            shares: Math.floor(hash / 2000000),
            lastBeat: nowSec - 14
          },
          "Rig-Beta": {
            hr: hash * 0.4,
            shares: Math.floor(hash / 3000000),
            lastBeat: nowSec - 41
          }
        },
        stats: {
          balance: "385000000000000000", // 0.385 ETC
          paid: "85400000000000000000", // 85.4 ETC
          blocksFound: 3 + (hash % 7)
        },
        roundShares: Math.floor(hash / 1000000),
        payments: [
          {
            timestamp: nowSec - 7200,
            amount: "14500000000000000000",
            tx: "0xf2f8d1c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583a"
          },
          {
            timestamp: nowSec - 21600,
            amount: "12200000000000000000",
            tx: "0xe1a3d4c7d3ef5123a1a16e82a0e3c5ef8f8a1bc8f0d1d4e623D10f9F75db9583b"
          }
        ],
        minerCharts: makeChart(hash, 8)
      });
    }

    const historyMatch = apiPath.match(/^\/accounts\/([^/]+)\/history$/);
    if (historyMatch) {
      const address = historyMatch[1];
      let hash = 45000000000;
      if (address === "0x71C7656EC7ab88b098defB751B7401B5f6d1476B") hash = 120500000000;
      else if (address === "0x29D7d1dd5B6f9C864d9db560D72a247c178ae86B") hash = 95200000000;
      else if (address === "0x90F8bf6A479f320ced073E8273B2518772421497") hash = 78400000000;
      else {
        let code = 0;
        for (let i = 0; i < address.length; i++) {
          code += address.charCodeAt(i);
        }
        hash = 10000000000 + (code % 100) * 1000000000;
      }
      return res.json(makeChart(hash, 8));
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  }

  const targetUrl = `${POOL_API_URL}${req.url}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'etc-pool-client/1.0'
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(targetUrl, fetchOptions);
    const contentType = upstreamRes.headers.get('content-type') || '';

    res.status(upstreamRes.status);

    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      res.json(data);
    } else {
      const text = await upstreamRes.text();
      res.send(text);
    }
  } catch (err) {
    console.error(`Proxy error for ${targetUrl}:`, err.message);
    res.status(502).json({ error: 'Upstream pool API error', message: err.message });
  }
});

// Serve frontend static files from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// HTML5 History API fallback
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Open ETC Pool server running at http://0.0.0.0:${PORT}`);
});
