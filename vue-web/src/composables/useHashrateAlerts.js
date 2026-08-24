import { ref, computed, watch } from 'vue';
import { useToasts } from './useToasts.js';
import { formatHashrate } from '../utils/formatters.js';

// Configuration State
const STORAGE_KEY_CONFIG = 'etc_hashrate_alert_config';
const STORAGE_KEY_INCIDENTS = 'etc_hashrate_incidents';

const defaultConfig = {
  enabled: true,
  thresholdPercent: 20, // Alert if drop >= 20%
  soundEnabled: true,
  browserNotifications: false,
  monitoredWallet: '', // Empty = all pool miners
  absoluteMinHashrate: 0, // 0 = disabled, or value in H/s
  notifyOnRecovery: true
};

const config = ref({ ...defaultConfig });
const incidents = ref([]);
const isModalOpen = ref(false);

// Load persisted data
try {
  const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (savedConfig) {
    config.value = { ...defaultConfig, ...JSON.parse(savedConfig) };
  }
  const savedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
  if (savedIncidents) {
    incidents.value = JSON.parse(savedIncidents);
  }
} catch (e) {
  console.warn('Could not load hashrate alerts config from localStorage', e);
}

// Watch & persist
watch(config, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newVal));
  } catch (e) {
    console.error('Failed to save alert config', e);
  }
}, { deep: true });

watch(incidents, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(newVal.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.error('Failed to save incidents', e);
  }
}, { deep: true });

/**
 * Plays a modern synthesized alert tone using the Web Audio API
 */
function playAlertSound(type = 'warning') {
  if (!config.value.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'recovery') {
      // Pleasant upward chime for recovery
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // Subtle two-tone warning beep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function useHashrateAlerts() {
  const { addToast } = useToasts();

  const unreadCount = computed(() => {
    return incidents.value.filter(i => !i.acknowledged && !i.resolved).length;
  });

  const activeIncidents = computed(() => {
    return incidents.value.filter(i => !i.resolved);
  });

  /**
   * Request native browser notification permissions
   */
  async function requestBrowserPermission() {
    if (!('Notification' in window)) {
      addToast('Browser notifications are not supported in this browser.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        config.value.browserNotifications = true;
        addToast('Desktop notifications enabled successfully!', 'success');
        return true;
      } else {
        config.value.browserNotifications = false;
        addToast('Browser notification permission was denied.', 'warning');
        return false;
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  /**
   * Trigger an alert incident
   */
  function triggerIncident({ address, currentHr, expectedHr, dropPercent, reason = 'Hashrate Drop' }) {
    if (!config.value.enabled) return;

    // Filter by monitored wallet if set
    if (config.value.monitoredWallet && config.value.monitoredWallet.toLowerCase() !== address.toLowerCase()) {
      return;
    }

    const shortAddr = address ? `${address.substring(0, 8)}...` : 'Unknown Rig';
    const incidentId = `inc-${address}-${Date.now()}`;

    // Check if there is already an unresolved incident for this address
    const existing = incidents.value.find(i => i.address === address && !i.resolved);
    if (existing) {
      existing.currentHr = currentHr;
      existing.dropPercent = dropPercent;
      existing.updatedAt = Date.now();
      return;
    }

    const newIncident = {
      id: incidentId,
      address,
      shortAddr,
      currentHr,
      expectedHr,
      dropPercent,
      reason,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      acknowledged: false,
      resolved: false
    };

    incidents.value.unshift(newIncident);

    // 1. Play sound
    playAlertSound('warning');

    // 2. In-app Toast notification
    const msg = `⚠️ Hashrate Drop Alert: ${shortAddr} dropped by -${dropPercent}% (${formatHashrate(currentHr)} vs ${formatHashrate(expectedHr)})`;
    addToast(msg, 'error', 6000);

    // 3. Browser Desktop Notification
    if (config.value.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`ETC Pool: Hashrate Alert (${shortAddr})`, {
          body: `Hashrate dropped by ${dropPercent}% down to ${formatHashrate(currentHr)}. Click to inspect.`,
          icon: '/favicon.ico',
          tag: `hashrate-${address}`
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }

  /**
   * Notify that a miner has recovered back to full hashrate
   */
  function resolveIncidentForAddress(address) {
    const active = incidents.value.filter(i => i.address === address && !i.resolved);
    if (active.length > 0) {
      active.forEach(i => {
        i.resolved = true;
        i.resolvedAt = Date.now();
      });

      if (config.value.notifyOnRecovery) {
        playAlertSound('recovery');
        const shortAddr = `${address.substring(0, 8)}...`;
        addToast(`✅ Miner ${shortAddr} has recovered to normal hashrate.`, 'success');
      }
    }
  }

  /**
   * Evaluates a miner against alert criteria
   */
  function evaluateMiner(miner) {
    if (!config.value.enabled || !miner) return;

    const currentHr = Number(miner.hr || miner.hashrate || 0);
    const expectedHr = Number(miner.historicalAvg || miner.originalHr || currentHr * 1.2);
    
    if (expectedHr <= 0) return;

    // Check percentage drop
    const drop = expectedHr - currentHr;
    const dropPercent = drop > 0 ? Math.round((drop / expectedHr) * 100) : 0;

    // Check absolute threshold if configured
    const absoluteBreach = config.value.absoluteMinHashrate > 0 && currentHr < config.value.absoluteMinHashrate;

    if (dropPercent >= config.value.thresholdPercent || absoluteBreach) {
      triggerIncident({
        address: miner.address,
        currentHr,
        expectedHr,
        dropPercent: dropPercent || Math.round(((config.value.absoluteMinHashrate - currentHr) / config.value.absoluteMinHashrate) * 100),
        reason: absoluteBreach ? `Below Min Threshold (${formatHashrate(config.value.absoluteMinHashrate)})` : `Performance Drop >= ${config.value.thresholdPercent}%`
      });
    } else if (miner.isSimulatedDrop === false && dropPercent < config.value.thresholdPercent) {
      // Auto-resolve if recovered
      resolveIncidentForAddress(miner.address);
    }
  }

  function acknowledgeIncident(id) {
    const inc = incidents.value.find(i => i.id === id);
    if (inc) {
      inc.acknowledged = true;
    }
  }

  function acknowledgeAll() {
    incidents.value.forEach(i => {
      i.acknowledged = true;
    });
  }

  function resolveIncident(id) {
    const inc = incidents.value.find(i => i.id === id);
    if (inc) {
      inc.resolved = true;
      inc.resolvedAt = Date.now();
    }
  }

  function clearIncidents() {
    incidents.value = [];
    addToast('Incident log cleared', 'info');
  }

  function testAlert() {
    triggerIncident({
      address: config.value.monitoredWallet || '0x71C...8942b',
      currentHr: 45000000,
      expectedHr: 120000000,
      dropPercent: 62,
      reason: 'Manual Test Simulation'
    });
  }

  return {
    config,
    incidents,
    activeIncidents,
    unreadCount,
    isModalOpen,
    evaluateMiner,
    triggerIncident,
    resolveIncidentForAddress,
    resolveIncident,
    acknowledgeIncident,
    acknowledgeAll,
    clearIncidents,
    requestBrowserPermission,
    testAlert,
    playAlertSound
  };
}
