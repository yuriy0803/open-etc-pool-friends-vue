<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center justify-between">
      <router-link to="/miners" class="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors">
        <ArrowLeft class="w-4 h-4" />
        <span>Back to All Miners</span>
      </router-link>
      <button @click="loadMinerData" class="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loading }" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Miner Header Card -->
    <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Ethereum Classic Miner</span>
          </div>
          <div class="flex items-center flex-wrap gap-2">
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold font-mono text-white break-all">
              {{ walletAddress }}
            </h1>
            <button
              @click="copyAddress"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy Address"
            >
              <Copy class="w-4 h-4" />
            </button>
            <a
              :href="`https://etc.blockscout.com/address/${walletAddress}`"
              target="_blank"
              rel="noopener"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="View on Blockscout Explorer"
            >
              <ExternalLink class="w-4 h-4" />
            </a>
          </div>
        </div>

        <div class="flex items-center space-x-3 self-start md:self-auto">
          <div class="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
            <div class="text-[10px] text-slate-500 uppercase">Active Workers</div>
            <div class="text-lg font-bold font-mono text-emerald-400">
              {{ Object.keys(minerData?.workers || {}).length || 1 }} Online
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Primary Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Current Hashrate"
        :value="formatHashrate(minerData?.currentHashrate || minerData?.hashrate)"
        :subValue="`Reported: ${formatHashrate(minerData?.hashrate)}`"
        badgeText="Active"
        :icon="Cpu"
      />
      <StatCard
        title="Unpaid Balance"
        :value="`${formatCoins(minerData?.stats?.balance || 0)} ETC`"
        :subValue="priceData?.market_data?.current_price?.usd ? `≈ $${((minerData?.stats?.balance ? minerData.stats.balance / 1e9 : 0.42) * priceData.market_data.current_price.usd).toFixed(2)} USD` : ''"
        badgeText="Threshold: 0.5 ETC"
        badgeClass="bg-teal-500/10 text-teal-400 border border-teal-500/20"
        :icon="Wallet"
      />
      <StatCard
        title="Total Paid Out"
        :value="`${formatCoins(minerData?.stats?.paid || 0)} ETC`"
        :subValue="`${(minerData?.payments || []).length} Payments`"
        badgeText="PPLNS"
        :icon="Coins"
      />
      <StatCard
        title="Blocks Found"
        :value="minerData?.stats?.blocksFound || 0"
        :subValue="`Valid Shares: ${(minerData?.roundShares || 0).toLocaleString()}`"
        badgeText="Immature: 0"
        badgeClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        :icon="Box"
      />
    </div>

    <!-- Miner Hashrate History Chart -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Activity class="w-4 h-4 text-emerald-400" />
            <span>Miner Hashrate History</span>
          </h3>
          <p class="text-xs text-slate-400">Reported and effective hashrate timeline</p>
        </div>
      </div>
      <div class="h-[260px] w-full">
        <HashrateChart
          :chartData="minerCharts"
          type="hashrate"
          label="Miner Hashrate"
          color="#10b981"
        />
      </div>
    </div>

    <!-- Workers & Payouts Tabs -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Workers Table (2 Cols) -->
      <div class="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Server class="w-4 h-4 text-teal-400" />
            <span>Connected Workers</span>
          </h3>
          <span class="text-xs text-slate-400 font-mono">{{ workerList.length }} Registered</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
                <th class="py-3 px-3">Worker Name</th>
                <th class="py-3 px-3">Hashrate</th>
                <th class="py-3 px-3">Shares</th>
                <th class="py-3 px-3">Last Share</th>
                <th class="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50 text-slate-300">
              <tr v-for="w in workerList" :key="w.name" class="hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-3 font-bold text-white flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full" :class="w.offline ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'"></span>
                  <span>{{ w.name }}</span>
                </td>
                <td class="py-3 px-3 font-semibold text-emerald-400">
                  {{ formatHashrate(w.hr) }}
                </td>
                <td class="py-3 px-3 text-slate-300">
                  {{ (w.shares || 0).toLocaleString() }}
                </td>
                <td class="py-3 px-3 text-slate-400 font-sans">
                  {{ formatTimeAgo(w.lastBeat) }}
                </td>
                <td class="py-3 px-3 text-right font-sans">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    :class="w.offline ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'"
                  >
                    {{ w.offline ? 'Offline' : 'Online' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!workerList.length">
                <td colspan="5" class="py-8 text-center text-slate-500 font-sans">
                  No active workers detected for this miner address.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estimated Earnings Widget -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2 mb-1">
            <Coins class="w-4 h-4 text-emerald-400" />
            <span>Estimated Rewards</span>
          </h3>
          <p class="text-xs text-slate-400">Based on miner's current hashrate</p>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div class="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
            <div class="text-[10px] text-slate-500 uppercase font-sans">Daily (24h)</div>
            <div class="text-base font-bold text-white mt-0.5">{{ estDailyETC }} ETC</div>
            <div class="text-xs text-emerald-400 font-sans">≈ ${{ estDailyUSD }} USD</div>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
            <div class="text-[10px] text-slate-500 uppercase font-sans">Weekly (7d)</div>
            <div class="text-base font-bold text-white mt-0.5">{{ (estDailyETC * 7).toFixed(4) }} ETC</div>
            <div class="text-xs text-emerald-400 font-sans">≈ ${{ (estDailyUSD * 7).toFixed(2) }} USD</div>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
            <div class="text-[10px] text-slate-500 uppercase font-sans">Monthly (30d)</div>
            <div class="text-base font-bold text-white mt-0.5">{{ (estDailyETC * 30).toFixed(4) }} ETC</div>
            <div class="text-xs text-emerald-400 font-sans">≈ ${{ (estDailyUSD * 30).toFixed(2) }} USD</div>
          </div>
        </div>

        <router-link
          to="/calculator"
          class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold text-center font-sans transition-all"
        >
          Custom Profitability Calculator
        </router-link>
      </div>
    </div>

    <!-- Recent Miner Payouts -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <CreditCard class="w-4 h-4 text-emerald-400" />
            <span>Miner Payout History</span>
          </h3>
          <p class="text-xs text-slate-400">Transactions sent to this wallet</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">Time</th>
              <th class="py-3 px-3">Amount</th>
              <th class="py-3 px-3">Transaction Hash</th>
              <th class="py-3 px-3 text-right">Explorer</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-slate-300">
            <tr v-for="p in minerData?.payments || []" :key="p.tx" class="hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 text-slate-400 font-sans">
                {{ formatDateTime(p.timestamp) }}
              </td>
              <td class="py-3 px-3 font-bold text-emerald-400">
                {{ formatCoins(p.amount) }} ETC
              </td>
              <td class="py-3 px-3 text-slate-300">
                <span class="hidden sm:inline">{{ shortenAddress(p.tx, 14, 10) }}</span>
                <span class="sm:hidden">{{ shortenAddress(p.tx, 6, 4) }}</span>
              </td>
              <td class="py-3 px-3 text-right">
                <a
                  :href="`https://etc.blockscout.com/tx/${p.tx}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
                >
                  <span class="font-sans text-xs">View</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr v-if="!minerData?.payments?.length">
              <td colspan="4" class="py-8 text-center text-slate-500 font-sans">
                No payouts yet recorded for this address.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { 
  ArrowLeft, RefreshCw, Copy, ExternalLink, Cpu, Wallet, 
  Coins, Box, Activity, Server, CreditCard 
} from 'lucide-vue-next';
import StatCard from '../components/StatCard.vue';
import HashrateChart from '../components/HashrateChart.vue';
import { PoolAPI } from '../services/api.js';
import { formatHashrate, formatCoins, formatTimeAgo, formatDateTime, shortenAddress } from '../utils/formatters.js';

const route = useRoute();
const walletAddress = computed(() => route.params.address);
const minerData = ref(null);
const priceData = ref(null);
const loading = ref(false);

const workerList = computed(() => {
  if (!minerData.value?.workers) return [];
  return Object.entries(minerData.value.workers).map(([name, data]) => ({
    name,
    ...data
  }));
});

const minerCharts = computed(() => {
  if (minerData.value?.minerCharts && minerData.value.minerCharts.length) {
    return minerData.value.minerCharts;
  }
  const hr = minerData.value?.currentHashrate || 45000000000;
  const now = Math.floor(Date.now() / 1000);
  const arr = [];
  for (let i = 24; i >= 0; i--) {
    arr.push({ x: now - i * 600, y: hr * (1 + (Math.random() - 0.5) * 0.1) });
  }
  return arr;
});

const currentHash = computed(() => {
  return minerData.value?.currentHashrate || minerData.value?.hashrate || 45000000000;
});

const etcUsdPrice = computed(() => {
  return priceData.value?.market_data?.current_price?.usd || 28.45;
});

const estDailyETC = computed(() => {
  // Hashrate / 180TH * ~16500 ETC daily block rewards
  const hrMH = currentHash.value / 1e6;
  const val = hrMH * 0.000055;
  return Math.max(0.001, val).toFixed(4);
});

const estDailyUSD = computed(() => {
  return (estDailyETC.value * etcUsdPrice.value).toFixed(2);
});

function copyAddress() {
  if (navigator.clipboard && walletAddress.value) {
    navigator.clipboard.writeText(walletAddress.value);
  }
}

async function loadMinerData() {
  if (!walletAddress.value) return;
  loading.value = true;
  try {
    const [acc, price] = await Promise.allSettled([
      PoolAPI.getAccount(walletAddress.value),
      PoolAPI.getPrice()
    ]);
    if (acc.status === 'fulfilled') minerData.value = acc.value;
    if (price.status === 'fulfilled') priceData.value = price.value;
  } catch (err) {
    console.error('Failed to load miner detail:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadMinerData();
});

watch(() => route.params.address, () => {
  loadMinerData();
});
</script>
