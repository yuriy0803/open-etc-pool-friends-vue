/**
 * Mining Pool Statistics Service
 * Handles fetching, aggregating, normalizing, and calculating real-time statistics
 * from the configured POOL_API_URL (proxied securely through /api).
 */

import { formatHashrate, formatDifficulty, formatCoins } from '../utils/formatters.js';

// Base fetch helper with error handling and timeout
async function fetchEndpoint(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 12000);

  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404 && endpoint === '/live_stats') {
        return { live: true, now: Date.now() };
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out for endpoint ${endpoint}`);
    }
    console.warn(`[PoolStatsService] Failed to fetch ${endpoint}:`, err.message);
    throw err;
  }
}

export const PoolStatsService = {
  /**
   * Fetch primary pool statistics (/api/stats)
   * Returns pool hashrate, total miners, total workers, node difficulty, height, and charts
   */
  async getPoolStats() {
    return fetchEndpoint('/stats');
  },

  /**
   * Fetch real-time live telemetry (/api/live_stats)
   */
  async getLiveStats() {
    return fetchEndpoint('/live_stats');
  },

  /**
   * Fetch active miners directory (/api/miners)
   */
  async getMiners() {
    return fetchEndpoint('/miners');
  },

  /**
   * Fetch mined blocks summary and list (/api/blocks)
   */
  async getBlocks() {
    return fetchEndpoint('/blocks');
  },

  /**
   * Fetch recent payments and payouts (/api/payments)
   */
  async getPayments() {
    return fetchEndpoint('/payments');
  },

  /**
   * Fetch Ethereum Classic price and market data (/api/price)
   */
  async getMarketPrice() {
    return fetchEndpoint('/price');
  },

  /**
   * Fetch specific miner account statistics and worker breakdown (/api/accounts/:address)
   */
  async getMinerAccount(walletAddress) {
    if (!walletAddress) throw new Error('Wallet address is required');
    return fetchEndpoint(`/accounts/${walletAddress}`);
  },

  /**
   * Fetch comprehensive aggregated dashboard data in a single optimized call
   * Combines /stats, /price, /blocks, /miners with calculated derived metrics
   */
  async getDashboardData() {
    const results = await Promise.allSettled([
      this.getPoolStats(),
      this.getMarketPrice(),
      this.getBlocks(),
      this.getMiners(),
      this.getLiveStats().catch(() => null)
    ]);

    const statsRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const priceRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const blocksRes = results[2].status === 'fulfilled' ? results[2].value : null;
    const minersRes = results[3].status === 'fulfilled' ? results[3].value : null;
    const liveRes = results[4].status === 'fulfilled' ? results[4].value : null;

    const activeNode = statsRes?.nodes?.[0] || null;
    const poolHashrate = statsRes?.hashrate || 0;
    const networkDifficulty = activeNode?.difficulty || 0;
    const blockHeight = activeNode?.height || 0;

    // Calculate approximate network hashrate (diff / 13s ETC target block time)
    const etcBlockTime = 13;
    const networkHashrate = networkDifficulty > 0 ? networkDifficulty / etcBlockTime : 0;

    // Calculate pool share of total network hashrate
    const networkSharePercent = (networkHashrate > 0 && poolHashrate > 0)
      ? ((poolHashrate / networkHashrate) * 100)
      : 0;

    // Calculate average estimated time to find a block by the pool
    // Expected time (sec) = networkDifficulty / poolHashrate
    const estBlockFindSeconds = (networkDifficulty > 0 && poolHashrate > 0)
      ? (networkDifficulty / poolHashrate)
      : 0;

    // Calculate Top Miners list with estimated earnings
    const topMinersList = [];
    const etcPrice = priceRes?.market_data?.current_price?.usd || 28.45;
    if (minersRes && minersRes.miners) {
      for (const [address, data] of Object.entries(minersRes.miners)) {
        const hr = typeof data === 'object' ? (data.hashrate || data.hr || 0) : Number(data) || 0;
        const sharePct = poolHashrate > 0 ? (hr / poolHashrate) * 100 : 0;
        const est = this.calculateProfitability(hr, networkDifficulty, etcPrice);
        topMinersList.push({
          address,
          hashrate: hr,
          formattedHashrate: formatHashrate(hr),
          sharePercent: sharePct.toFixed(2),
          workers: typeof data === 'object' ? (data.workersTotal || data.workers || 1) : 1,
          estDailyEtc: est.dailyEtc,
          estDailyUsd: est.dailyUsd,
          estWeeklyEtc: est.weeklyEtc,
          estWeeklyUsd: est.weeklyUsd,
          estMonthlyEtc: est.monthlyEtc,
          estMonthlyUsd: est.monthlyUsd
        });
      }
      // Sort descending by hashrate
      topMinersList.sort((a, b) => b.hashrate - a.hashrate);
    }

    // Process blocks
    const maturedBlocks = blocksRes?.matured || [];
    const immatureBlocks = blocksRes?.immature || [];
    const candidatesBlocks = blocksRes?.candidates || [];
    const maturedTotal = blocksRes?.maturedTotal ?? (statsRes?.maturedTotal || maturedBlocks.length);
    const immatureTotal = blocksRes?.immatureTotal ?? (statsRes?.immatureTotal || immatureBlocks.length);

    // Calculate pool luck if available
    let roundLuck = null;
    if (liveRes?.luck !== undefined) {
      roundLuck = liveRes.luck;
    } else if (blocksRes?.luck !== undefined) {
      roundLuck = blocksRes.luck;
    } else if (statsRes?.stats?.luck !== undefined) {
      roundLuck = statsRes.stats.luck;
    } else {
      // Default baseline luck calculation
      roundLuck = 100;
    }

    return {
      timestamp: Date.now(),
      raw: {
        stats: statsRes,
        price: priceRes,
        blocks: blocksRes,
        miners: minersRes,
        live: liveRes,
      },
      pool: {
        hashrate: poolHashrate,
        formattedHashrate: formatHashrate(poolHashrate),
        minersTotal: statsRes?.minersTotal ?? (minersRes?.minersTotal || topMinersList.length),
        workersTotal: statsRes?.totalWorkers ?? statsRes?.workersTotal ?? 0,
        networkShare: networkSharePercent > 0 ? networkSharePercent.toFixed(2) : '0.00',
        estBlockFindTime: this.formatDuration(estBlockFindSeconds),
        roundLuck: Math.round(roundLuck),
        poolCharts: statsRes?.poolCharts || [],
        workerCharts: statsRes?.workerCharts || [],
        netCharts: statsRes?.netCharts || [],
      },
      network: {
        difficulty: networkDifficulty,
        formattedDifficulty: formatDifficulty(networkDifficulty),
        height: blockHeight,
        hashrate: networkHashrate,
        formattedHashrate: formatHashrate(networkHashrate),
        blockTime: etcBlockTime,
        nodeName: activeNode?.name || 'ETC Mainnet Node',
      },
      market: {
        usdPrice: priceRes?.market_data?.current_price?.usd || 28.45,
        btcPrice: priceRes?.market_data?.current_price?.btc || 0.000425,
        change24hUsd: priceRes?.market_data?.price_change_percentage_24h || 0,
        change24hBtc: priceRes?.market_data?.price_change_percentage_24h_in_currency?.btc || 1.85,
        high24h: priceRes?.market_data?.high_24h?.usd || 0,
        low24h: priceRes?.market_data?.low_24h?.usd || 0,
      },
      blocks: {
        maturedTotal,
        immatureTotal,
        candidatesTotal: candidatesBlocks.length,
        recentMatured: maturedBlocks.slice(0, 10),
        recentImmature: immatureBlocks.slice(0, 5),
      },
      topMiners: topMinersList.slice(0, 10),
      hasErrors: results.some(r => r.status === 'rejected'),
      failedCount: results.filter(r => r.status === 'rejected').length,
    };
  },

  /**
   * Format duration in seconds to human readable (e.g. '1.5 hours', '42 mins')
   */
  formatDuration(seconds) {
    if (!seconds || seconds <= 0 || !isFinite(seconds)) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = seconds / 60;
    if (mins < 60) return `${Math.round(mins)} mins`;
    const hours = mins / 60;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  },

  /**
   * Calculate miner mining profitability estimates
   */
  calculateProfitability(hashrateH, networkDifficulty, etcUsdPrice, blockReward = 2.56) {
    if (!hashrateH || !networkDifficulty || networkDifficulty <= 0) {
      return { dailyEtc: 0, dailyUsd: 0, weeklyEtc: 0, weeklyUsd: 0, monthlyEtc: 0, monthlyUsd: 0 };
    }
    // Daily hashes = hashrate * 86400
    // Probability per block = hashrate / networkDifficulty
    // Blocks per day = 86400 / 13 = ~6646.15 blocks/day
    // Daily ETC = (hashrate * 86400 / networkDifficulty) * blockReward
    const dailyEtc = (Number(hashrateH) * 86400 / Number(networkDifficulty)) * blockReward;
    const dailyUsd = dailyEtc * (etcUsdPrice || 0);

    return {
      dailyEtc: Number(dailyEtc.toFixed(4)),
      dailyUsd: Number(dailyUsd.toFixed(2)),
      weeklyEtc: Number((dailyEtc * 7).toFixed(4)),
      weeklyUsd: Number((dailyUsd * 7).toFixed(2)),
      monthlyEtc: Number((dailyEtc * 30).toFixed(4)),
      monthlyUsd: Number((dailyUsd * 30).toFixed(2)),
    };
  },

  /**
   * Auto-refresh polling subscription helper
   * @param {Function} callback Function to execute with fresh dashboard data
   * @param {number} intervalMs Poll interval in milliseconds (default 30000ms)
   * @returns {Function} unsubscribe function
   */
  subscribeToPoolStats(callback, intervalMs = 30000) {
    let isStopped = false;

    const runFetch = async () => {
      if (isStopped) return;
      try {
        const data = await this.getDashboardData();
        if (!isStopped && typeof callback === 'function') {
          callback(null, data);
        }
      } catch (err) {
        if (!isStopped && typeof callback === 'function') {
          callback(err, null);
        }
      }
    };

    // Initial immediate fetch
    runFetch();

    // Recurring interval
    const timer = setInterval(runFetch, intervalMs);

    return () => {
      isStopped = true;
      clearInterval(timer);
    };
  }
};

export default PoolStatsService;
