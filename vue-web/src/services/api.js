// API service communicating exclusively through local server proxy /api/*

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const PoolAPI = {
  // Get main pool statistics, nodes, hash rates, charts
  getStats: () => fetchJson('/stats'),

  // Get active miners list
  getMiners: () => fetchJson('/miners'),

  // Get mined blocks (matured, immature, candidates, luck)
  getBlocks: () => fetchJson('/blocks'),

  // Get payments / payouts history
  getPayments: () => fetchJson('/payments'),

  // Get specific miner account data
  getAccount: (walletAddress) => fetchJson(`/accounts/${walletAddress}`),

  // Get specific miner historical hashrate chart
  getAccountHistory: (walletAddress) => fetchJson(`/accounts/${walletAddress}/history`),

  // Get live price and market stats
  getPrice: () => fetchJson('/price'),

  // Get quick live stats
  getLiveStats: () => fetchJson('/live_stats'),

  // Update miner threshold and notifications settings
  updateSettings: (params) => {
    const body = new URLSearchParams(params);
    return fetchJson('/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
  },

  // Update mining type (PPLNS vs SOLO)
  updateMiningType: (params) => {
    const body = new URLSearchParams(params);
    return fetchJson('/mining', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
  }
};
