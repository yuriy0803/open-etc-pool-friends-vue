// Format hashrate to human-readable string (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
// Supports custom decimal places and target units for absolute UI consistency
export function formatHashrate(hashrate, decimals = 2, targetUnit = null) {
  if (!hashrate || isNaN(hashrate) || hashrate <= 0) return `0.00 ${targetUnit || 'H/s'}`;
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];
  let val = Number(hashrate);

  if (targetUnit) {
    const targetIdx = units.indexOf(targetUnit);
    if (targetIdx !== -1) {
      // Convert value to the requested target unit
      val = val / Math.pow(1000, targetIdx);
      return `${val.toFixed(decimals)} ${targetUnit}`;
    }
  }

  // Automatic unit selection
  let i = 0;
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(decimals)} ${units[i]}`;
}

// Format difficulty
export function formatDifficulty(diff, decimals = 2) {
  if (!diff || isNaN(diff)) return '0';
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  let i = 0;
  let val = Number(diff);
  while (val >= 1000 && i < units.length - 1) {
    val /= 1000;
    i++;
  }
  return `${val.toFixed(decimals)} ${units[i]}`;
}

// Convert raw coins (Wei/Shannon/atomic) to standard coin float
export function convertToCoins(amount) {
  if (!amount || isNaN(amount)) return 0;
  let val = Number(amount);
  if (val > 1e15) {
    return val / 1e18; // Wei to ETC
  } else if (val > 1e6 && val <= 1e15) {
    return val / 1e9;  // Shannon/Gwei to ETC
  }
  return val;
}

// Format ETC currency consistently across the UI (with option for compact/abbreviated representation)
export function formatCoins(amount, decimals = 4, compact = false) {
  const val = convertToCoins(amount);
  
  if (compact && val >= 1000) {
    const coinUnits = [
      { value: 1e9, symbol: 'B' },
      { value: 1e6, symbol: 'M' },
      { value: 1e3, symbol: 'K' }
    ];
    for (const unit of coinUnits) {
      if (val >= unit.value) {
        return (val / unit.value).toFixed(2) + unit.symbol;
      }
    }
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
