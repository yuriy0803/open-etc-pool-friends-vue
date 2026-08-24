<template>
  <div class="space-y-8">
    <!-- Hero / Quick Miner Lookup -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#0c121e] to-[#090d16] border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-3xl">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ethereum Classic Mainnet Pool</span>
          </div>

          <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-sans">
            <RefreshCw class="w-3 h-3 text-emerald-400" :class="{ 'animate-spin': isRefreshing }" />
            <span>Auto-refreshing in <strong class="text-white font-mono">{{ secondsLeft }}s</strong></span>
          </div>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Next-Gen <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">ETCHASH</span> Mining Pool
        </h1>
        <p class="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Ultra-low latency stratum servers, PPLNS payout model with 0.5% fee, instant round calculation, and real-time worker monitoring.
        </p>

        <!-- Wallet Search Bar -->
        <div class="mt-8">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Check Your Mining Dashboard & Hashrate
          </label>
          <form @submit.prevent="lookupMiner" class="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div class="relative flex-1">
              <input
                v-model="walletInput"
                type="text"
                placeholder="Enter Ethereum Classic Wallet Address (0x...)"
                class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
              />
              <button 
                v-if="walletInput" 
                type="button" 
                @click="walletInput = ''" 
                class="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <button
              type="submit"
              class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
            >
              <Search class="w-4 h-4" />
              <span>Track Miner</span>
            </button>
          </form>
          
          <!-- Sample Miner Quick Pick -->
          <div v-if="sampleMiners.length" class="mt-3 flex items-center flex-wrap gap-2 text-xs text-slate-500">
            <span>Active sample miners:</span>
            <button
              v-for="miner in sampleMiners.slice(0, 3)"
              :key="miner"
              @click="selectSampleMiner(miner)"
              class="font-mono text-emerald-400 hover:text-emerald-300 hover:underline bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/40"
            >
              {{ shortenAddress(miner, 6, 4) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pool Hashrate"
        :value="formatHashrate(statsData?.hashrate)"
        :subValue="poolSharePercent ? `${poolSharePercent}% Net Share` : ''"
        badgeText="PPLNS"
        :icon="Cpu"
      />
      <StatCard
        title="Active Miners"
        :value="statsData?.minersTotal || 0"
        :subValue="`${statsData?.totalWorkers || 0} Workers Online`"
        badgeText="Live"
        badgeClass="bg-teal-500/10 text-teal-400 border border-teal-500/20"
        :icon="Users"
      />
      <StatCard
        title="ETC Market Price"
        :value="priceData?.market_data?.current_price?.usd ? `$${priceData.market_data.current_price.usd.toFixed(2)}` : '$28.45'"
        :subValue="priceData?.market_data?.current_price?.btc ? `${priceData.market_data.current_price.btc.toFixed(6)} BTC` : ''"
        :badgeText="priceData?.market_data?.price_change_percentage_24h_in_currency?.btc ? `${priceData.market_data.price_change_percentage_24h_in_currency.btc > 0 ? '+' : ''}${priceData.market_data.price_change_percentage_24h_in_currency.btc.toFixed(2)}%` : '+1.85%'"
        :badgeClass="(priceData?.market_data?.price_change_percentage_24h_in_currency?.btc || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
        :icon="Coins"
      />
      <StatCard
        title="Network Difficulty"
        :value="formatDifficulty(activeNode?.difficulty)"
        :subValue="`Height #${activeNode?.height || 20458120}`"
        badgeText="ETCHASH"
        badgeClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        :icon="Layers"
      />
    </div>

    <!-- Charts & Network Insights -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- Hashrate History Chart (2 Cols) -->
      <div class="xl:col-span-2 glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 class="text-base font-bold text-white flex items-center space-x-2">
              <Activity class="w-4 h-4 text-emerald-400" />
              <span>Pool Hashrate History</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Real-time sampling and network difficulty comparison</p>
          </div>

          <div class="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              @click="activeChartTab = 'pool'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="activeChartTab === 'pool' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              Hashrate
            </button>
            <button
              @click="activeChartTab = 'workers'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="activeChartTab === 'workers' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              Workers
            </button>
            <button
              @click="activeChartTab = 'diff'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="activeChartTab === 'diff' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              Difficulty
            </button>
          </div>
        </div>

        <div class="h-[280px] w-full">
          <HashrateChart
            v-if="activeChartTab === 'pool'"
            :chartData="statsData?.poolCharts || fallbackChartData"
            type="hashrate"
            label="Pool Hashrate"
            color="#10b981"
          />
          <HashrateChart
            v-else-if="activeChartTab === 'workers'"
            :chartData="statsData?.workerCharts || []"
            type="miners"
            label="Active Workers"
            color="#38bdf8"
          />
          <HashrateChart
            v-else
            :chartData="statsData?.netCharts || []"
            type="difficulty"
            label="Network Difficulty"
            color="#a855f7"
          />
        </div>
      </div>

      <!-- Standalone Pool Difficulty Trend Chart (1 Col) -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Layers class="w-4 h-4 text-purple-400" />
            <span>Network Difficulty Trend</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Complementing real-time pool hashrate monitoring</p>
        </div>
        <div class="h-[180px] w-full my-4">
          <HashrateChart
            :chartData="statsData?.netCharts || fallbackChartData"
            type="difficulty"
            label="Network Difficulty"
            color="#a855f7"
          />
        </div>
        <div class="pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-2 font-mono">
          <div class="flex justify-between">
            <span>Current Diff:</span>
            <span class="font-bold text-white">{{ formatDifficulty(activeNode?.difficulty) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Algorithm:</span>
            <span class="font-bold text-slate-300">ETCHASH</span>
          </div>
        </div>
      </div>

      <!-- Pool Specification & Quick Config (1 Col) -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2 mb-1">
            <Server class="w-4 h-4 text-teal-400" />
            <span>Pool Specs & Stratum</span>
          </h3>
          <p class="text-xs text-slate-400">Direct connection parameters</p>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Primary Stratum TCP</div>
            <div class="flex items-center justify-between text-emerald-400 font-semibold">
              <span class="truncate">stratum+tcp://pool:8008</span>
              <button @click="copyText('stratum+tcp://pool:8008')" class="ml-2 text-slate-400 hover:text-white">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SSL / TLS Stratum</div>
            <div class="flex items-center justify-between text-teal-400 font-semibold">
              <span class="truncate">stratum+ssl://pool:8443</span>
              <button @click="copyText('stratum+ssl://pool:8443')" class="ml-2 text-slate-400 hover:text-white">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1 text-slate-300">
            <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Payout Scheme</div>
              <div class="font-bold text-white mt-0.5">PPLNS (0.5% fee)</div>
            </div>
            <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Min Payout</div>
              <div class="font-bold text-emerald-400 mt-0.5">0.5 ETC</div>
            </div>
            <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Payout Interval</div>
              <div class="font-bold text-white mt-0.5">Every 2 Hours</div>
            </div>
            <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Algorithm</div>
              <div class="font-bold text-white mt-0.5">ETCHASH (Epoch >390)</div>
            </div>
          </div>
        </div>

        <router-link
          to="/connect"
          class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center space-x-2"
        >
          <Sliders class="w-3.5 h-3.5" />
          <span>Open Miner Setup Generator</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Blocks Preview Table -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Box class="w-4 h-4 text-emerald-400" />
            <span>Recent Mined Blocks</span>
          </h3>
          <p class="text-xs text-slate-400">Latest Ethereum Classic blocks found by the pool</p>
        </div>
        <router-link to="/blocks" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1">
          <span>View All ({{ blocksData?.maturedTotal || 0 }})</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">Height</th>
              <th class="py-3 px-3">Block Hash</th>
              <th class="py-3 px-3">Reward</th>
              <th class="py-3 px-3">Difficulty</th>
              <th class="py-3 px-3">Time Found</th>
              <th class="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            <tr v-for="block in recentBlocks" :key="block.height" class="hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 font-bold text-white">
                <a :href="`https://etc.blockscout.com/block/${block.height}`" target="_blank" class="hover:text-emerald-400 underline decoration-slate-700">
                  #{{ block.height }}
                </a>
              </td>
              <td class="py-3 px-3 text-slate-400">
                <span class="hidden sm:inline">{{ shortenAddress(block.hash, 10, 8) }}</span>
                <span class="sm:hidden">{{ shortenAddress(block.hash, 6, 4) }}</span>
              </td>
              <td class="py-3 px-3 font-semibold text-emerald-400">
                {{ formatCoins(block.reward || '2500000000000000000') }} ETC
              </td>
              <td class="py-3 px-3 text-slate-400">
                {{ formatDifficulty(block.difficulty) }}
              </td>
              <td class="py-3 px-3 text-slate-400 font-sans">
                {{ formatTimeAgo(block.timestamp) }}
              </td>
              <td class="py-3 px-3 text-right font-sans">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Matured
                </span>
              </td>
            </tr>
            <tr v-if="!recentBlocks.length">
              <td colspan="6" class="py-8 text-center text-slate-500 font-sans">
                Loading recent blocks from pool...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Miner Payout & Transaction Tracker Section -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <CreditCard class="w-4 h-4 text-emerald-400" />
            <span>Miner Payout & Transaction Tracker</span>
          </h3>
          <p class="text-xs text-slate-400">Fetch latest payout transactions for any ETC miner address</p>
        </div>

        <!-- Quick search form -->
        <div class="flex items-center space-x-2">
          <input
            v-model="payoutTrackerAddress"
            type="text"
            placeholder="Enter ETC wallet (0x...)"
            class="bg-slate-950/60 border border-slate-850 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono w-full sm:w-80 focus:outline-none"
            @keyup.enter="fetchTrackerPayouts"
          />
          <button
            @click="fetchTrackerPayouts"
            :disabled="trackerLoading"
            class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
          >
            <RefreshCw v-if="trackerLoading" class="w-3 h-3 animate-spin" />
            <span>{{ trackerLoading ? 'Loading...' : 'Track' }}</span>
          </button>
        </div>
      </div>

      <!-- Result View -->
      <div v-if="trackerError" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
        {{ trackerError }}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">Time</th>
              <th class="py-3 px-3">Amount</th>
              <th class="py-3 px-3">Transaction Hash</th>
              <th class="py-3 px-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            <tr v-for="p in trackerPayouts" :key="p.tx" class="hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 text-slate-400 font-sans">
                {{ formatDateTime(p.timestamp) }}
              </td>
              <td class="py-3 px-3 font-bold text-emerald-400">
                {{ formatCoins(p.amount) }} ETC
              </td>
              <td class="py-3 px-3 text-slate-300">
                <span class="hidden sm:inline">{{ shortenAddress(p.tx, 14, 10) }}</span>
                <span class="sm:hidden">{{ shortenAddress(p.tx, 8, 4) }}</span>
              </td>
              <td class="py-3 px-3 text-right font-sans">
                <a
                  :href="`https://etc.blockscout.com/tx/${p.tx}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-colors"
                >
                  <span>Blockscout</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr v-if="!trackerPayouts.length">
              <td colspan="4" class="py-12 text-center text-slate-500 font-sans">
                {{ trackerAddressEntered ? 'No payout transactions found for this wallet address.' : 'Enter a miner wallet address above to retrieve recent payout ledger logs.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Search, Cpu, Users, Coins, Layers, Activity, Server, Copy, 
  Sliders, Box, ArrowRight, RefreshCw, CreditCard, ExternalLink
} from 'lucide-vue-next';
import StatCard from '../components/StatCard.vue';
import HashrateChart from '../components/HashrateChart.vue';
import { PoolAPI } from '../services/api.js';
import { formatHashrate, formatDifficulty, formatCoins, formatTimeAgo, shortenAddress, formatDateTime } from '../utils/formatters.js';
import { useAutoRefresh } from '../composables/useAutoRefresh.js';
import { useToasts } from '../composables/useToasts.js';

const router = useRouter();
const walletInput = ref('');
const statsData = ref(null);
const priceData = ref(null);
const blocksData = ref(null);
const sampleMiners = ref([]);
const activeChartTab = ref('pool');

const { addToast } = useToasts();

// Miner Payout Tracker State
const payoutTrackerAddress = ref('');
const trackerPayouts = ref([]);
const trackerLoading = ref(false);
const trackerError = ref('');
const trackerAddressEntered = ref(false);

const { secondsLeft, isRefreshing } = useAutoRefresh(loadData, 30);

async function fetchTrackerPayouts() {
  const addr = payoutTrackerAddress.value.trim();
  if (!addr) {
    trackerError.value = 'Please enter a valid miner address.';
    addToast('Please enter a valid miner address', 'warning');
    return;
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    trackerError.value = 'Invalid Ethereum wallet address format (should start with 0x and be 42 characters).';
    addToast('Invalid wallet address format', 'error');
    return;
  }

  trackerLoading.value = true;
  trackerError.value = '';
  trackerAddressEntered.value = true;
  const oldPayments = [...trackerPayouts.value];
  trackerPayouts.value = [];

  try {
    const data = await PoolAPI.getMiner(addr);
    if (data && data.payments) {
      trackerPayouts.value = data.payments;
      localStorage.setItem('etc_pool_tracker_wallet', addr);

      // Check if a new payment transaction was confirmed
      if (oldPayments.length > 0 && data.payments.length > oldPayments.length) {
        const newPayment = data.payments[0];
        addToast(`New Payout Confirmed: ${formatCoins(newPayment.amount)} ETC sent to ${shortenAddress(addr, 6, 4)}!`, 'success', 6000);
      } else if (oldPayments.length === 0) {
        addToast(`Successfully retrieved ${data.payments.length} payouts for ${shortenAddress(addr, 6, 4)}`, 'success');
      }
    } else {
      trackerPayouts.value = [];
    }
  } catch (err) {
    trackerError.value = 'Failed to load payout details. Please ensure the wallet is active and registered on the pool.';
    addToast('API Error: Failed to fetch payout transactions from pool node', 'error');
  } finally {
    trackerLoading.value = false;
  }
}

const activeNode = computed(() => {
  return statsData.value?.nodes?.[0] || null;
});

const recentBlocks = computed(() => {
  return blocksData.value?.matured?.slice(0, 5) || [];
});

const poolSharePercent = computed(() => {
  if (!statsData.value?.hashrate || !activeNode.value?.difficulty) return null;
  // Approximation of network hashrate = difficulty / blocktime (13s)
  const netHash = activeNode.value.difficulty / 13;
  if (!netHash || netHash <= 0) return null;
  const pct = (statsData.value.hashrate / netHash) * 100;
  return pct > 0 ? pct.toFixed(2) : null;
});

const fallbackChartData = computed(() => {
  const arr = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 24; i >= 0; i--) {
    arr.push({ x: now - i * 600, y: 480000000000 + Math.random() * 20000000000 });
  }
  return arr;
});

function lookupMiner() {
  const addr = walletInput.value.trim();
  if (addr) {
    router.push(`/miner/${addr}`);
  }
}

function selectSampleMiner(addr) {
  walletInput.value = addr;
  lookupMiner();
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

async function loadData() {
  try {
    const [stats, price, blocks, miners] = await Promise.allSettled([
      PoolAPI.getStats(),
      PoolAPI.getPrice(),
      PoolAPI.getBlocks(),
      PoolAPI.getMiners()
    ]);

    let failedCount = 0;

    if (stats.status === 'fulfilled') {
      statsData.value = stats.value;
    } else {
      failedCount++;
    }

    if (price.status === 'fulfilled') {
      priceData.value = price.value;
    } else {
      failedCount++;
    }

    if (blocks.status === 'fulfilled') {
      blocksData.value = blocks.value;
    } else {
      failedCount++;
    }

    if (miners.status === 'fulfilled' && miners.value?.miners) {
      sampleMiners.value = Object.keys(miners.value.miners);
    } else {
      failedCount++;
    }

    if (failedCount > 0) {
      addToast(`API Warning: ${failedCount} server endpoint(s) failed to fetch. Showing cached values.`, 'warning');
    }
  } catch (err) {
    console.error('Error loading home data:', err);
    addToast('Critical Error: Failed to connect to mining pool daemon.', 'error');
  }
}

onMounted(() => {
  loadData();
  const savedTrackerWallet = localStorage.getItem('etc_pool_tracker_wallet');
  if (savedTrackerWallet) {
    payoutTrackerAddress.value = savedTrackerWallet;
    fetchTrackerPayouts();
  }
});
</script>
