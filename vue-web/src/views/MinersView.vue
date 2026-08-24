<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Pool Miners</h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time leaderboard, connection latency monitoring, and intelligent automated alert thresholds</p>
      </div>

      <div class="flex items-center space-x-3">
        <div class="relative w-full sm:w-64">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Filter by address..."
            class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
        </div>
      </div>
    </div>

    <!-- Connection Health & Alert Config Dashboard Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 1. Connection Health Monitor -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Wifi class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Miner Connection Health</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time Stratum server latency metrics from active miner sessions</p>
        </div>

        <!-- Latency Breakdown Stats -->
        <div class="grid grid-cols-3 gap-2 py-2">
          <div class="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-2.5 text-center">
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Excellent</div>
            <div class="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">{{ excellentCount }}</div>
            <div class="text-[9px] text-slate-500 mt-0.5">&lt; 50ms</div>
          </div>
          <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-xl p-2.5 text-center">
            <div class="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Fair</div>
            <div class="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">{{ fairCount }}</div>
            <div class="text-[9px] text-slate-500 mt-0.5">50-150ms</div>
          </div>
          <div class="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-xl p-2.5 text-center">
            <div class="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Poor</div>
            <div class="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">{{ poorCount }}</div>
            <div class="text-[9px] text-slate-500 mt-0.5">&gt; 150ms</div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 font-sans">
          <div class="flex justify-between items-center">
            <span>Average Latency:</span>
            <span class="font-bold font-mono" :class="avgLatencyColor">{{ avgLatency.toFixed(1) }} ms</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Active Connections:</span>
            <span class="font-bold font-mono text-slate-900 dark:text-white">{{ minerList.length }} Rigs</span>
          </div>
        </div>
      </div>

      <!-- 2. Hashrate Threshold Alert System -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Hashrate Alert Thresholds</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Triggers immediate warning notifications if hashrate drops significantly</p>
        </div>

        <!-- Slider controls -->
        <div class="space-y-3 py-1">
          <div class="flex justify-between text-xs font-mono">
            <span class="text-slate-600 dark:text-slate-400">Trigger Drop Threshold:</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ alertThresholdPercent }}% Drop</span>
          </div>
          <input
            v-model="alertThresholdPercent"
            type="range"
            min="5"
            max="75"
            step="5"
            class="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div class="flex items-center justify-between text-[11px] text-slate-500 font-sans pt-1">
            <span>Tight (5%)</span>
            <span>Balanced (20%)</span>
            <span>Relaxed (75%)</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
          <span class="text-slate-600 dark:text-slate-400">System Monitoring:</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse font-mono border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5"></span>
            ACTIVE WATCH
          </span>
        </div>
      </div>

      <!-- 3. Active Incident Log / Simulation controls -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Bell class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Active Incidents Log</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time overview of degraded mining rigs and simulated tests</p>
        </div>

        <!-- Alerts feed -->
        <div class="flex-1 overflow-y-auto max-h-[100px] min-h-[90px] pr-1 space-y-2">
          <div v-if="activeAlerts.length === 0" class="h-full flex flex-col items-center justify-center text-center py-4">
            <div class="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
              <CheckCircle class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span class="text-[10px] text-slate-500 font-mono">All rigs operating within thresholds</span>
          </div>
          <div
            v-for="alert in activeAlerts"
            :key="alert.address"
            class="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-[10px] font-mono flex items-center justify-between gap-2"
          >
            <div class="truncate">
              <div class="text-rose-600 dark:text-rose-400 font-bold uppercase flex items-center gap-1">
                <AlertTriangle class="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
                <span>DEGRADED PERFORMANCE</span>
              </div>
              <div class="text-slate-700 dark:text-slate-300 truncate mt-0.5">Rig: {{ alert.address.substring(0, 8) }}...</div>
              <div class="text-slate-500 dark:text-slate-400 mt-0.5">Drop: -{{ alert.dropPercent }}% (Avg: {{ formatHashrate(alert.historicalAvg) }})</div>
            </div>
            <button
              @click="restoreMiner(alert.address)"
              class="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-sans font-bold transition-colors shrink-0 cursor-pointer"
            >
              Reboot / Fix
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 gap-3">
          <button
            @click="simulateRandomDrop"
            class="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-300 font-bold transition-all cursor-pointer"
          >
            <Play class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Simulate Random Incident</span>
          </button>
          <button
            v-if="activeAlerts.length > 0"
            @click="restoreAll"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-sans transition-all shrink-0 cursor-pointer"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>

    <!-- Summary metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-card rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Miners</div>
          <div class="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">{{ minerList.length }}</div>
        </div>
        <Users class="w-6 h-6 text-emerald-600 dark:text-emerald-400 opacity-80" />
      </div>
      <div class="glass-card rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Online Hashrate</div>
          <div class="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{{ formatHashrate(totalMinerHash) }}</div>
        </div>
        <Zap class="w-6 h-6 text-teal-600 dark:text-teal-400 opacity-80" />
      </div>
      <div class="glass-card rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Average Hashrate / Miner</div>
          <div class="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">{{ formatHashrate(avgMinerHash) }}</div>
        </div>
        <Activity class="w-6 h-6 text-indigo-600 dark:text-indigo-400 opacity-80" />
      </div>
    </div>

    <!-- Miners Table -->
    <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3.5 px-4"># Rank</th>
              <th class="py-3.5 px-4">Miner Address</th>
              <th class="py-3.5 px-4">Current Hashrate</th>
              <th class="py-3.5 px-4">Historical Avg</th>
              <th class="py-3.5 px-4">Pool Share</th>
              <th class="py-3.5 px-4">Ping Latency</th>
              <th class="py-3.5 px-4">Status / Alert</th>
              <th class="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            <tr
              v-for="(miner, index) in filteredMiners"
              :key="miner.address"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              :class="miner.isSimulatedDrop ? 'bg-rose-50 dark:bg-rose-950/10 border-l-2 border-l-rose-500' : ''"
            >
              <td class="py-3.5 px-4 font-bold text-slate-500 font-sans">
                <span :class="index < 3 && !miner.isSimulatedDrop ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''">#{{ index + 1 }}</span>
              </td>
              <td class="py-3.5 px-4">
                <router-link
                  :to="`/miner/${miner.address}`"
                  class="font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline font-medium flex items-center space-x-1.5"
                >
                  <span class="font-bold">{{ miner.address.substring(0, 10) }}...{{ miner.address.substring(miner.address.length - 8) }}</span>
                </router-link>
              </td>
              <td class="py-3.5 px-4 font-bold" :class="miner.isSimulatedDrop ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-900 dark:text-white'">
                {{ formatHashrate(miner.hr) }}
              </td>
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                {{ formatHashrate(miner.historicalAvg) }}
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full"
                      :style="{ width: `${calculateShare(miner.hr)}%` }"
                    ></div>
                  </div>
                  <span class="text-[11px] text-slate-600 dark:text-slate-400">{{ calculateShare(miner.hr) }}%</span>
                </div>
              </td>
              <!-- Real-time Latency (Ping in ms) -->
              <td class="py-3.5 px-4">
                <div class="flex items-center space-x-2">
                  <span
                    class="w-2 h-2 rounded-full inline-block animate-pulse shrink-0"
                    :class="getPingBgColor(miner.ping)"
                  ></span>
                  <span class="font-bold" :class="getPingTextColor(miner.ping)">{{ miner.ping }} ms</span>
                </div>
              </td>
              <!-- Status / Alert column -->
              <td class="py-3.5 px-4 font-sans">
                <span
                  v-if="miner.isSimulatedDrop"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 animate-pulse"
                >
                  <AlertTriangle class="w-2.5 h-2.5 mr-1 text-rose-500 dark:text-rose-400 shrink-0" />
                  Drop -{{ getDropPercent(miner) }}%
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                >
                  <CheckCircle class="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Healthy
                </span>
              </td>
              <!-- Simulation trigger actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end space-x-2 font-sans">
                  <button
                    v-if="!miner.isSimulatedDrop"
                    @click="triggerSimulationDrop(miner.address)"
                    class="px-2 py-1 rounded bg-amber-50 hover:bg-rose-100 dark:bg-amber-500/10 dark:hover:bg-rose-500/20 text-amber-700 hover:text-rose-700 dark:text-amber-400 dark:hover:text-rose-400 border border-amber-200 hover:border-rose-300 dark:border-amber-500/20 dark:hover:border-rose-500/20 text-[10px] font-bold transition-all cursor-pointer"
                    title="Simulate sudden drop in hashing performance"
                  >
                    Simulate Drop
                  </button>
                  <button
                    v-else
                    @click="restoreMiner(miner.address)"
                    class="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/35 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
                    title="Restore miner hardware back to full healthy hashrate"
                  >
                    Fix Rig
                  </button>
                  <router-link
                    :to="`/miner/${miner.address}`"
                    class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700/60 text-xs transition-colors"
                  >
                    <span>Stats</span>
                    <ArrowUpRight class="w-3 h-3" />
                  </router-link>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredMiners.length">
              <td colspan="8" class="py-12 text-center text-slate-500 font-sans">
                No miners found matching "{{ searchTerm }}".
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Search, Users, Zap, Activity, ArrowUpRight, Wifi, Sliders, Bell, AlertTriangle, CheckCircle, Play } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';
import { useToasts } from '../composables/useToasts.js';
import { formatHashrate } from '../utils/formatters.js';

const { addToast } = useToasts();

const rawMinersData = ref(null);
const minersState = ref([]);
const searchTerm = ref('');
const alertThresholdPercent = ref(20);

// Dynamic, Fluctuating telemetry simulation
let pingInterval = null;

const minerList = computed(() => {
  return minersState.value;
});

const filteredMiners = computed(() => {
  const term = searchTerm.value.toLowerCase().trim();
  if (!term) return minerList.value;
  return minerList.value.filter(m => m.address.toLowerCase().includes(term));
});

const totalMinerHash = computed(() => {
  return minerList.value.reduce((acc, curr) => acc + (curr.hr || 0), 0);
});

const avgMinerHash = computed(() => {
  if (!minerList.value.length) return 0;
  return totalMinerHash.value / minerList.value.length;
});

// Ping connection health statistics
const excellentCount = computed(() => {
  return minerList.value.filter(m => m.ping < 50).length;
});

const fairCount = computed(() => {
  return minerList.value.filter(m => m.ping >= 50 && m.ping <= 150).length;
});

const poorCount = computed(() => {
  return minerList.value.filter(m => m.ping > 150).length;
});

const avgLatency = computed(() => {
  if (!minerList.value.length) return 0;
  const total = minerList.value.reduce((acc, curr) => acc + curr.ping, 0);
  return total / minerList.value.length;
});

const avgLatencyColor = computed(() => {
  const avg = avgLatency.value;
  if (avg < 50) return 'text-emerald-400';
  if (avg <= 150) return 'text-amber-400';
  return 'text-rose-400';
});

// Active alert lists dynamically based on alertThresholdPercent
const activeAlerts = computed(() => {
  return minerList.value
    .filter(miner => {
      if (miner.historicalAvg <= 0) return false;
      const drop = getDropPercent(miner);
      return drop >= alertThresholdPercent.value;
    })
    .map(m => ({
      address: m.address,
      dropPercent: getDropPercent(m),
      historicalAvg: m.historicalAvg,
      currentHr: m.hr
    }));
});

// Watch alerts to trigger real-time Toast notifications
watch(() => activeAlerts.value, (newAlerts, oldAlerts) => {
  newAlerts.forEach(alert => {
    // Check if it's a new incident (not present in old alerts list)
    const wasAlreadyAlerted = oldAlerts && oldAlerts.some(o => o.address === alert.address);
    if (!wasAlreadyAlerted) {
      addToast(
        `⚠️ [Threshold Alert] Miner ${alert.address.substring(0, 10)}... hashrate dropped ${alert.dropPercent}% below historical average! (Current: ${formatHashrate(alert.currentHr)} vs Avg: ${formatHashrate(alert.historicalAvg)})`,
        'error',
        6000
      );
    }
  });
}, { deep: true });

function calculateShare(hr) {
  if (!totalMinerHash.value || totalMinerHash.value <= 0) return '0.0';
  return ((hr / totalMinerHash.value) * 100).toFixed(1);
}

function getDropPercent(miner) {
  if (!miner.historicalAvg) return 0;
  const diff = miner.historicalAvg - miner.hr;
  if (diff <= 0) return 0;
  return Math.round((diff / miner.historicalAvg) * 100);
}

function getPingBgColor(ping) {
  if (ping < 50) return 'bg-emerald-400';
  if (ping <= 150) return 'bg-amber-400';
  return 'bg-rose-400';
}

function getPingTextColor(ping) {
  if (ping < 50) return 'text-emerald-400';
  if (ping <= 150) return 'text-amber-400';
  return 'text-rose-400';
}

// Interactive Simulation Tools
function triggerSimulationDrop(address) {
  const miner = minersState.value.find(m => m.address === address);
  if (miner) {
    // Slashing current hashrate by 60% (meaning a 60% performance drop, making current 40% of original)
    miner.hr = Math.round(miner.originalHr * 0.4);
    miner.isSimulatedDrop = true;
    // Increase latency slightly as poor connection health can correlate with degraded performance
    miner.ping = Math.min(240, miner.ping + 80);
  }
}

function restoreMiner(address) {
  const miner = minersState.value.find(m => m.address === address);
  if (miner) {
    miner.hr = miner.originalHr;
    miner.isSimulatedDrop = false;
    // Settle latency back to original ranges
    if (address.endsWith('b') || address.endsWith('B')) {
      miner.ping = 18;
    } else if (address.includes('a') || address.includes('A')) {
      miner.ping = 72;
    } else if (address.includes('f') || address.includes('d')) {
      miner.ping = 168;
    } else {
      miner.ping = 35;
    }
    addToast(`✅ Miner ${address.substring(0, 10)}... hardware successfully rebooted and tuned. Hashrate recovered!`, 'success');
  }
}

function restoreAll() {
  minersState.value.forEach(miner => {
    if (miner.isSimulatedDrop) {
      restoreMiner(miner.address);
    }
  });
  addToast('✅ All degraded mining systems have been rebooted and restored to full capacity.', 'success');
}

function simulateRandomDrop() {
  const healthyMiners = minersState.value.filter(m => !m.isSimulatedDrop);
  if (healthyMiners.length === 0) {
    addToast('All active rigs are already in a degraded state!', 'warning');
    return;
  }
  const randomMiner = healthyMiners[Math.floor(Math.random() * healthyMiners.length)];
  triggerSimulationDrop(randomMiner.address);
}

async function fetchMiners() {
  try {
    const data = await PoolAPI.getMiners();
    rawMinersData.value = data;
    if (data && data.miners) {
      minersState.value = Object.entries(data.miners).map(([address, info]) => {
        // Base latency ranges
        let basePing = 12;
        if (address.endsWith('b') || address.endsWith('B')) {
          basePing = 18;
        } else if (address.includes('a') || address.includes('A')) {
          basePing = 72;
        } else if (address.includes('f') || address.includes('d')) {
          basePing = 168;
        } else {
          basePing = 35;
        }

        // Setup historical average at 15% above current
        const avg = Math.round(info.hr * 1.15);

        return {
          address,
          hr: info.hr,
          originalHr: info.hr,
          historicalAvg: avg,
          lastBeat: info.lastBeat,
          ping: basePing,
          isSimulatedDrop: false
        };
      }).sort((a, b) => b.hr - a.hr);
    }
  } catch (err) {
    console.error('Failed to load miners:', err);
  }
}

onMounted(() => {
  fetchMiners();

  // Active network jitter telemetries
  pingInterval = setInterval(() => {
    minersState.value.forEach(miner => {
      // Fluctuating within a safe boundary (+/- 4ms)
      const jitter = Math.floor(Math.random() * 9) - 4;
      miner.ping = Math.max(5, miner.ping + jitter);
    });
  }, 3000);
});

onUnmounted(() => {
  if (pingInterval) clearInterval(pingInterval);
});
</script>
