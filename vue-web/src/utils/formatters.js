// Format hashrate to human-readable string (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
export function formatHashrate(hashrate) {
  if (!hashrate || isNaN(hashrate) || hashrate <= 0) return '0 H/s';
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];
  let i = 0;
  let val = Number(hashrate);
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(2)} ${units[i]}`;
}

// Format difficulty
export function formatDifficulty(diff) {
  if (!diff || isNaN(diff)) return '0';
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let i = 0;
  let val = Number(diff);
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(2)} ${units[i]}`;
}

// Format ETC currency (converts Wei/gwei or raw atomic units if needed)
export function formatCoins(amount, decimals = 4) {
  if (!amount || isNaN(amount)) return '0.0000';
  // If amount is in Wei (> 1e12), convert to ETC
  let val = Number(amount);
  if (val > 1e12) {
    val = val / 1e18;
  } else if (val > 1e6 && val <= 1e12) {
    // Some pools represent ETC in Shannon / Gwei (1e9)
    val = val / 1e9;
  }
  return val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals
  });
}

// Format relative time (e.g. 5 mins ago)
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  let date = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  // Check if timestamp is in seconds
  if (date < 1e12) {
    date = date * 1000;
  }
  const now = Date.now();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 0) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

// Format date time
export function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  let date = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (date < 1e12) {
    date = date * 1000;
  }
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Shorten crypto address / tx hash
export function shortenAddress(address, start = 6, end = 4) {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
}

// Format number with commas
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString();
}
