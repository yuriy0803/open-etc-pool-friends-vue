import { formatHashrate, formatDifficulty, formatCoins, formatDateTime } from './formatters.js';

/**
 * Escapes a value for safe inclusion in a CSV file (RFC 4180 compliant)
 */
export function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers a client-side file download of CSV content with UTF-8 BOM
 */
export function downloadCsv(filename, csvContent) {
  // UTF-8 BOM ensures Excel and all spreadsheet software open special characters properly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a comprehensive CSV export of the full Pool Statistics
 */
export function exportPoolStatsToCsv(dashboardData) {
  if (!dashboardData) return;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `etc-pool-statistics-${dateStr}.csv`;

  const rows = [];

  // Title / Metadata
  rows.push(['# ETC Mining Pool - Full Telemetry & Statistical Report']);
  rows.push(['Generated At (UTC)', now.toISOString()]);
  rows.push(['Generated At (Local)', now.toLocaleString()]);
  rows.push(['Pool Currency', 'Ethereum Classic (ETC)']);
  rows.push(['Algorithm', 'ETCHASH / Stratum']);
  rows.push([]);

  // Section 1: Core Pool Performance Metrics
  rows.push(['## POOL PERFORMANCE METRICS']);
  rows.push(['Metric', 'Value', 'Formatted / Unit']);
  rows.push(['Pool Hashrate (Raw H/s)', dashboardData.pool?.hashrate || 0, dashboardData.pool?.formattedHashrate || '0 H/s']);
  rows.push(['Active Miners Count', dashboardData.pool?.minersTotal || 0, 'Miners']);
  rows.push(['Active Workers Count', dashboardData.pool?.workersTotal || 0, 'Workers']);
  rows.push(['Network Hashrate Share', `${dashboardData.pool?.networkShare || '0.00'}%`, 'Percentage of Network']);
  rows.push(['Current Round Luck / Effort', `${dashboardData.pool?.roundLuck || 100}%`, dashboardData.pool?.roundLuck < 100 ? 'High Efficiency' : 'Over-effort']);
  rows.push(['Est. Time to Find Block', dashboardData.pool?.estBlockFindTime || 'Calculating...', 'Estimated Duration']);
  rows.push(['Total Matured Blocks', dashboardData.blocks?.maturedTotal || 0, 'Blocks']);
  rows.push(['Total Immature Blocks', dashboardData.blocks?.immatureTotal || 0, 'Blocks']);
  rows.push(['Pool Fee', '0.5%', 'PPLNS Zero TX deduction']);
  rows.push(['Minimum Payout Threshold', '0.50 ETC', 'Every 120 Minutes']);
  rows.push([]);

  // Section 2: Network Telemetry
  rows.push(['## NETWORK TELEMETRY']);
  rows.push(['Network Metric', 'Value', 'Formatted / Notes']);
  rows.push(['Network Difficulty', dashboardData.network?.difficulty || 0, dashboardData.network?.formattedDifficulty || '0']);
  rows.push(['Network Hashrate (Est.)', Math.round(dashboardData.network?.hashrate || 0), dashboardData.network?.formattedHashrate || '0 H/s']);
  rows.push(['Current Block Height', dashboardData.network?.height || 0, 'Blocks']);
  rows.push(['ETC Target Block Time', `${dashboardData.network?.blockTime || 13}s`, 'Seconds']);
  rows.push(['Connected Node Name', dashboardData.network?.nodeName || 'ETC Node', 'RPC Backend']);
  rows.push([]);

  // Section 3: Market & Pricing
  rows.push(['## MARKET & VALUATION']);
  rows.push(['Market Metric', 'Value (USD)', 'Notes']);
  rows.push(['ETC Price USD', `$${(dashboardData.market?.usdPrice || 0).toFixed(2)}`, 'Current Spot Price']);
  rows.push(['ETC Price BTC', `${(dashboardData.market?.btcPrice || 0).toFixed(8)} BTC`, 'Satoshi Equivalent']);
  rows.push(['24h Price Change USD', `${(dashboardData.market?.change24hUsd || 0).toFixed(2)}%`, '24h Variance']);
  rows.push(['24h High USD', `$${(dashboardData.market?.high24h || 0).toFixed(2)}`, '24h High']);
  rows.push(['24h Low USD', `$${(dashboardData.market?.low24h || 0).toFixed(2)}`, '24h Low']);
  rows.push([]);

  // Section 4: Top Active Miners
  if (dashboardData.topMiners && dashboardData.topMiners.length > 0) {
    rows.push(['## TOP ACTIVE MINERS LEADERBOARD']);
    rows.push(['Rank', 'Wallet Address', 'Current Hashrate (H/s)', 'Formatted Hashrate', 'Pool Share %', 'Active Workers', 'Est. Daily ETC', 'Est. Daily USD', 'Est. Monthly ETC', 'Est. Monthly USD']);
    dashboardData.topMiners.forEach((miner, idx) => {
      rows.push([
        idx + 1,
        miner.address,
        miner.hashrate || 0,
        miner.formattedHashrate || formatHashrate(miner.hashrate),
        `${miner.sharePercent || '0.00'}%`,
        miner.workers || 1,
        miner.estDailyEtc || 0,
        `$${(miner.estDailyUsd || 0).toFixed(2)}`,
        miner.estMonthlyEtc || 0,
        `$${(miner.estMonthlyUsd || 0).toFixed(2)}`
      ]);
    });
    rows.push([]);
  }

  // Section 5: Recent Mined Blocks
  const recentBlocks = dashboardData.blocks?.recentMatured || [];
  if (recentBlocks.length > 0) {
    rows.push(['## RECENT MATURED BLOCKS']);
    rows.push(['Block Height', 'Block Hash', 'Reward (ETC)', 'Variance / Effort %', 'Timestamp (Seconds)', 'Date (UTC)']);
    recentBlocks.forEach(blk => {
      const ts = blk.timestamp || blk.time || 0;
      const isoDate = ts ? new Date(ts > 1e11 ? ts : ts * 1000).toISOString() : '-';
      rows.push([
        blk.height || blk.number || 0,
        blk.hash || '-',
        formatCoins(blk.reward || blk.value || 0),
        blk.variance ? `${Math.round(blk.variance)}%` : (blk.luck ? `${Math.round(blk.luck)}%` : '100%'),
        ts,
        isoDate
      ]);
    });
    rows.push([]);
  }

  // Section 6: Historical Hashrate Telemetry
  const chartPoints = dashboardData.pool?.poolCharts || [];
  if (chartPoints.length > 0) {
    rows.push(['## HISTORICAL HASHRATE SAMPLES (TELEMETRY)']);
    rows.push(['Timestamp (Unix Seconds)', 'Date Time (ISO)', 'Hashrate (H/s)', 'Formatted Hashrate']);
    chartPoints.forEach(pt => {
      const ts = pt.x !== undefined ? pt.x : (pt.timestamp !== undefined ? pt.timestamp : pt[0]);
      const val = pt.y !== undefined ? pt.y : (pt.minerHash !== undefined ? pt.minerHash : pt[1]);
      const sec = ts > 1e11 ? Math.floor(ts / 1000) : ts;
      const isoDate = sec ? new Date(sec * 1000).toISOString() : '-';
      rows.push([
        sec,
        isoDate,
        val || 0,
        formatHashrate(val || 0)
      ]);
    });
  }

  // Convert array of rows to CSV string
  const csvContent = rows
    .map(row => row.map(escapeCsv).join(','))
    .join('\r\n');

  downloadCsv(filename, csvContent);
}

/**
 * Generates and downloads a CSV export of the full Active Miners directory
 */
export function exportMinersListToCsv(minersList, poolHashrate = 0) {
  if (!minersList || !minersList.length) return;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `etc-pool-miners-${dateStr}.csv`;

  const rows = [];
  rows.push(['# ETC Mining Pool - Active Miners Directory']);
  rows.push(['Generated At', now.toISOString()]);
  rows.push(['Total Miners', minersList.length]);
  rows.push(['Pool Total Hashrate', formatHashrate(poolHashrate)]);
  rows.push([]);

  rows.push(['Rank', 'Miner Address', 'Current Hashrate (H/s)', 'Formatted Current Hashrate', 'Historical Average (H/s)', 'Formatted Avg Hashrate', 'Pool Share %', 'Ping Latency (ms)', 'Health Status', 'Active Workers']);

  minersList.forEach((miner, index) => {
    const hr = miner.hr || miner.hashrate || 0;
    const avgHr = miner.historicalAvg || hr;
    const share = poolHashrate > 0 ? ((hr / poolHashrate) * 100).toFixed(2) : '0.00';
    const status = miner.isSimulatedDrop ? `Degraded (-${miner.dropPercent || 35}%)` : 'Healthy';
    const ping = miner.ping || 25;
    const workers = miner.workers || (miner.workersTotal) || 1;

    rows.push([
      index + 1,
      miner.address,
      hr,
      formatHashrate(hr),
      avgHr,
      formatHashrate(avgHr),
      `${share}%`,
      ping,
      status,
      workers
    ]);
  });

  const csvContent = rows
    .map(row => row.map(escapeCsv).join(','))
    .join('\r\n');

  downloadCsv(filename, csvContent);
}

/**
 * Generates and downloads a CSV export of Mined Blocks
 */
export function exportBlocksListToCsv(blocksList, blockType = 'matured') {
  if (!blocksList || !blocksList.length) return;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `etc-pool-blocks-${blockType}-${dateStr}.csv`;

  const rows = [];
  rows.push([`# ETC Mining Pool - ${blockType.toUpperCase()} Blocks Report`]);
  rows.push(['Generated At', now.toISOString()]);
  rows.push(['Block Type', blockType.toUpperCase()]);
  rows.push(['Total Blocks in Export', blocksList.length]);
  rows.push([]);

  rows.push(['Block Height', 'Block Hash', 'Reward (ETC)', 'Variance / Effort %', 'Difficulty', 'Discovered By / Miner', 'Timestamp (Unix)', 'Date Time (ISO)', 'Date Time (Local)']);

  blocksList.forEach(blk => {
    const ts = blk.timestamp || blk.time || 0;
    const sec = ts > 1e11 ? Math.floor(ts / 1000) : ts;
    const d = sec ? new Date(sec * 1000) : null;
    const isoDate = d ? d.toISOString() : '-';
    const localDate = d ? d.toLocaleString() : '-';
    const luck = blk.variance ? `${Math.round(blk.variance)}%` : (blk.luck ? `${Math.round(blk.luck)}%` : '100%');

    rows.push([
      blk.height || blk.number || 0,
      blk.hash || '-',
      formatCoins(blk.reward || blk.value || 0),
      luck,
      blk.difficulty ? formatDifficulty(blk.difficulty) : '-',
      blk.miner || blk.worker || '-',
      sec,
      isoDate,
      localDate
    ]);
  });

  const csvContent = rows
    .map(row => row.map(escapeCsv).join(','))
    .join('\r\n');

  downloadCsv(filename, csvContent);
}

/**
 * Generates and downloads a CSV export of a specific Miner Account (workers, payments, stats)
 */
export function exportMinerAccountToCsv(walletAddress, minerData, workerList = []) {
  if (!walletAddress) return;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `etc-miner-${walletAddress.slice(0, 8)}-${dateStr}.csv`;

  const rows = [];
  rows.push(['# ETC Mining Pool - Miner Telemetry & Account Report']);
  rows.push(['Wallet Address', walletAddress]);
  rows.push(['Generated At (UTC)', now.toISOString()]);
  rows.push(['Generated At (Local)', now.toLocaleString()]);
  rows.push([]);

  // Section 1: Overview
  rows.push(['## MINER OVERVIEW']);
  rows.push(['Metric', 'Value', 'Formatted']);
  rows.push(['Current Hashrate', minerData?.currentHashrate || minerData?.hashrate || 0, formatHashrate(minerData?.currentHashrate || minerData?.hashrate || 0)]);
  rows.push(['Reported Hashrate', minerData?.hashrate || 0, formatHashrate(minerData?.hashrate || 0)]);
  rows.push(['Immature Balance', minerData?.immature || 0, `${formatCoins(minerData?.immature || 0)} ETC`]);
  rows.push(['Pending / Unpaid Balance', minerData?.balance || 0, `${formatCoins(minerData?.balance || 0)} ETC`]);
  rows.push(['Total Paid Out', minerData?.paid || 0, `${formatCoins(minerData?.paid || 0)} ETC`]);
  rows.push(['Active Workers Online', workerList.filter(w => !w.offline).length, `${workerList.length} Total Registered`]);
  rows.push([]);

  // Section 2: Workers Breakdown
  if (workerList && workerList.length > 0) {
    rows.push(['## CONNECTED WORKERS RIGS']);
    rows.push(['Worker Name', 'Hashrate (H/s)', 'Formatted Hashrate', 'Shares', 'Status', 'Last Share (Unix)']);
    workerList.forEach(w => {
      rows.push([
        w.name || 'Default Rig',
        w.hr || 0,
        formatHashrate(w.hr || 0),
        w.shares || 0,
        w.offline ? 'Offline' : 'Online',
        w.lastBeat || 0
      ]);
    });
    rows.push([]);
  }

  // Section 3: Payout History
  const payments = minerData?.payments || [];
  if (payments.length > 0) {
    rows.push(['## PAYOUT TRANSACTION HISTORY']);
    rows.push(['Timestamp (Unix)', 'Date Time (ISO)', 'Amount (ETC)', 'Transaction Hash']);
    payments.forEach(p => {
      const ts = p.timestamp || 0;
      const sec = ts > 1e11 ? Math.floor(ts / 1000) : ts;
      const isoDate = sec ? new Date(sec * 1000).toISOString() : '-';
      rows.push([
        sec,
        isoDate,
        formatCoins(p.amount || 0),
        p.tx || '-'
      ]);
    });
    rows.push([]);
  }

  const csvContent = rows
    .map(row => row.map(escapeCsv).join(','))
    .join('\r\n');

  downloadCsv(filename, csvContent);
}
