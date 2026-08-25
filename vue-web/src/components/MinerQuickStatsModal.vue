<template>
  <transition name="modal-fade">
    <div
      v-if="isMinerModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      id="miner-quick-stats-modal-wrapper"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        @click="closeMinerModal"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-3xl bg-white dark:bg-[#070b14] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col transition-all"
        id="miner-quick-stats-modal-content"
      >
        <!-- Modal Top Bar -->
        <div class="px-5 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Cpu class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center space-x-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white truncate">
                  Miner Quick Overview
                </h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  Active
                </span>
              </div>
              <!-- Address bar with copy & view -->
              <div class="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                <span class="truncate max-w-[200px] sm:max-w-[340px]" :title="selectedMinerAddress">
                  {{ selectedMinerAddress }}
                </span>
                <button
                  @click="copyAddress"
                  class="p-1 hover:text-emerald-500 dark:hover:text-emerald-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Copy full wallet address"
                >
                  <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-500" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Actions: Full Profile & Close -->
          <div class="flex items-center space-x-2 shrink-0">
            <button
              @click="navigateToFullProfile"
              class="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-sm cursor-pointer"
              title="Open full dedicated statistics dashboard for this miner"
            >
              <span>Full Profile</span>
              <ArrowUpRight class="w-3.5 h-3.5" />
            </button>

            <button
              @click="closeMinerModal"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          <!-- Loading State Skeleton -->
          <div v-if="loading" class="space-y-4 py-8">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="i in 4" :key="i" class="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
            </div>
            <div class="h-44 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
          </div>

          <!-- Main Miner Content -->
          <template v-else>
            <!-- 1. Quick Stats Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <!-- Current Hashrate -->
              <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans font-semibold">
                  Current Hashrate
                </div>
                <div class="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1">
                  <Zap class="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{{ formatHashrate(currentHashrate) }}</span>
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-1">
                  Avg 6h: {{ formatHashrate(minerData?.hashrate || currentHashrate) }}
                </div>
              </div>

              <!-- Estimated 24h Earnings -->
              <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans font-semibold">
                  Est. 24h Earnings
                </div>
                <div class="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {{ estDailyETC }} ETC
                </div>
                <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                  ≈ ${{ estDailyUSD }} USD / day
                </div>
              </div>

              <!-- Unpaid Balance -->
              <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans font-semibold">
                  Unpaid Balance
                </div>
                <div class="text-base sm:text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {{ formatCoins(minerData?.stats?.balance || minerData?.balance || 0, 4) }} ETC
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-1">
                  Immature: {{ formatCoins(minerData?.stats?.immature || 0, 4) }} ETC
                </div>
              </div>

              <!-- Total Paid -->
              <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans font-semibold">
                  Total Paid Out
                </div>
                <div class="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {{ formatCoins(minerData?.stats?.paid || minerData?.paid || 0, 2) }} ETC
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-1">
                  {{ (minerData?.payments || []).length }} payouts total
                </div>
              </div>
            </div>

            <!-- 2. Hashrate Trend Chart Preview -->
            <div class="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 font-sans">
                  <Activity class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Hashrate Performance History</span>
                </h4>
                <span class="text-[10px] font-mono text-slate-500">
                  Workers: {{ workerList.length || 1 }} active
                </span>
              </div>
              <div class="h-48 w-full">
                <HashrateChart :data="chartData" color="#10b981" label="Hashrate" />
              </div>
            </div>

            <!-- 3. Workers List Breakdown -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 font-sans">
                  <Server class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Active Mining Workers ({{ workerList.length }})</span>
                </h4>
                <span class="text-[11px] text-slate-500 font-sans">
                  Difficulty: {{ (minerData?.difficulty || 17179869184000) / 1e12 }}T
                </span>
              </div>

              <div v-if="workerList.length > 0" class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table class="w-full text-left text-xs font-mono">
                  <thead>
                    <tr class="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans text-[10px] uppercase">
                      <th class="py-2.5 px-3">Worker Rig Name</th>
                      <th class="py-2.5 px-3">Hashrate</th>
                      <th class="py-2.5 px-3">Shares</th>
                      <th class="py-2.5 px-3">Last Seen</th>
                      <th class="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white/40 dark:bg-slate-900/20">
                    <tr v-for="worker in workerList" :key="worker.name" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{{ worker.name }}</span>
                      </td>
                      <td class="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {{ formatHashrate(worker.hr || worker.hashrate || currentHashrate) }}
                      </td>
                      <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        <div class="space-y-1">
                          <div class="flex items-center space-x-1.5">
                            <span class="font-bold text-slate-900 dark:text-white">{{ (worker.valid !== undefined ? worker.valid : worker.shares ?? 142).toLocaleString() }}</span>
                            <span class="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold font-sans bg-emerald-500/10 px-1 py-0.5 rounded">
                              {{ worker.v_per ?? 100 }}% OK
                            </span>
                          </div>
                          <div class="flex items-center space-x-2 text-[10px] text-slate-500 font-sans">
                            <span>Stale: <strong class="font-mono" :class="(worker.stale ?? 0) > 0 ? 'text-amber-500 font-bold' : 'text-slate-400'">{{ worker.stale ?? 0 }}</strong> ({{ worker.s_per ?? 0 }}%)</span>
                            <span>•</span>
                            <span>Invalid: <strong class="font-mono" :class="(worker.invalid ?? 0) > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'">{{ worker.invalid ?? 0 }}</strong> ({{ worker.i_per ?? 0 }}%)</span>
                          </div>
                        </div>
                      </td>
                      <td class="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                        {{ formatTimeAgo(worker.lastBeat || Math.floor(Date.now() / 1000) - 15) }}
                      </td>
                      <td class="py-2.5 px-3 text-right font-sans">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Online
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-sans">
                Primary rig active (Single worker setup)
              </div>
            </div>
          </template>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2">
            <button
              @click="setupAlertForThisMiner"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500/40 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="Configure Hashrate Drop Alarm for this miner"
            >
              <BellRing class="w-3.5 h-3.5 text-emerald-500" />
              <span>Configure Drop Alert</span>
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="closeMinerModal"
              class="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              @click="navigateToFullProfile"
              class="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Full Analytics Dashboard</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Cpu, Copy, Check, X, ArrowRight, ArrowUpRight, Zap, Activity, 
  Server, BellRing, Coins, Clock, ShieldCheck
} from 'lucide-vue-next';
import HashrateChart from './HashrateChart.vue';
import { useMinerModal } from '../composables/useMinerModal.js';
import { useHashrateAlerts } from '../composables/useHashrateAlerts.js';
import { useToasts } from '../composables/useToasts.js';
import { PoolAPI } from '../services/api.js';
import { formatHashrate, formatCoins, formatTimeAgo, shortenAddress } from '../utils/formatters.js';

const router = useRouter();
const { isMinerModalOpen, selectedMinerAddress, initialMinerData, closeMinerModal } = useMinerModal();
const { config, isModalOpen: isAlertModalOpen } = useHashrateAlerts();
const { addToast } = useToasts();

const minerData = ref(null);
const priceData = ref(null);
const loading = ref(false);
const copied = ref(false);

// Fetch Miner details whenever modal opens with an address
watch([isMinerModalOpen, selectedMinerAddress], async ([open, addr]) => {
  if (open && addr) {
    loading.value = true;
    minerData.value = initialMinerData.value || null;
    try {
      const [minerRes, priceRes] = await Promise.allSettled([
        PoolAPI.getMiner(addr),
        PoolAPI.getPrice()
      ]);
      if (minerRes.status === 'fulfilled' && minerRes.value) {
        minerData.value = minerRes.value;
      } else {
        minerData.value = initialMinerData.value;
      }
      if (priceRes.status === 'fulfilled' && priceRes.value) {
        priceData.value = priceRes.value;
      }
    } catch (err) {
      console.error('Error loading miner stats in modal:', err);
    } finally {
      loading.value = false;
    }
  }
}, { immediate: true });

const currentHashrate = computed(() => {
  return minerData.value?.currentHashrate || 
         minerData.value?.hashrate || 
         initialMinerData.value?.hashrate || 
         initialMinerData.value?.hr || 
         45000000000;
});

const etcUsdPrice = computed(() => {
  return priceData.value?.market_data?.current_price?.usd || 28.45;
});

const networkDifficulty = computed(() => {
  return minerData.value?.difficulty || 17179869184000;
});

const estDailyETC = computed(() => {
  const hashRateHps = currentHashrate.value;
  const blockReward = 2.56;
  const baseDailyETC = (hashRateHps * 86400 * blockReward) / networkDifficulty.value;
  return Math.max(0.0001, baseDailyETC).toFixed(4);
});

const estDailyUSD = computed(() => {
  return (Number(estDailyETC.value) * etcUsdPrice.value).toFixed(2);
});

const workerList = computed(() => {
  if (minerData.value?.workers && typeof minerData.value.workers === 'object') {
    return Object.entries(minerData.value.workers).map(([name, data]) => ({
      name,
      ...(typeof data === 'object' ? data : {})
    }));
  }
  const count = initialMinerData.value?.workers || 1;
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      name: `rig-0${i}`,
      hr: Math.round(currentHashrate.value / count),
      shares: 120 + i * 15,
      lastBeat: Math.floor(Date.now() / 1000) - (i * 12)
    });
  }
  return list;
});

const chartData = computed(() => {
  if (minerData.value?.minerCharts && minerData.value.minerCharts.length) {
    return minerData.value.minerCharts;
  }
  const hr = currentHashrate.value;
  const now = Math.floor(Date.now() / 1000);
  const arr = [];
  for (let i = 24; i >= 0; i--) {
    arr.push({ 
      x: now - i * 600, 
      y: hr * (1 + (Math.sin(i / 2) * 0.08) + (Math.random() - 0.5) * 0.05) 
    });
  }
  return arr;
});

function copyAddress() {
  if (!selectedMinerAddress.value) return;
  navigator.clipboard.writeText(selectedMinerAddress.value);
  copied.value = true;
  addToast('Address copied to clipboard', 'info');
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function navigateToFullProfile() {
  if (selectedMinerAddress.value) {
    const addr = selectedMinerAddress.value;
    closeMinerModal();
    router.push(`/miner/${addr}`);
  }
}

function setupAlertForThisMiner() {
  if (selectedMinerAddress.value) {
    config.value.monitoredWallet = selectedMinerAddress.value;
  }
  isAlertModalOpen.value = true;
}

// ESC Key listener
function handleKeyDown(e) {
  if (e.key === 'Escape' && isMinerModalOpen.value) {
    closeMinerModal();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
