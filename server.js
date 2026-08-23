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

// Upstream Pool API URL from environment variable
const POOL_API_URL = (process.env.POOL_API_URL || 'https://etc-api.pool2mine.net/api').replace(/\/+$/, '');

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
