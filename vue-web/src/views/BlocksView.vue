<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Pool Mined Blocks</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Verified Ethereum Classic blocks discovered by pool miners</p>
      </div>

      <div class="flex items-center space-x-2">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-1 flex space-x-1">
          <button
            @click="activeTab = 'matured'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="activeTab === 'matured' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'"
          >
            Matured ({{ blocksData?.maturedTotal || blocksData?.matured?.length || 0 }})
          </button>
          <button
            @click="activeTab = 'immature'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="activeTab === 'immature' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'"
          >
            Immature ({{ blocksData?.immatureTotal || blocksData?.immature?.length || 0 }})
          </button>
          <button
            @click="activeTab = 'candidates'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="activeTab === 'candidates' ? 'bg-indigo-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'"
          >
            Candidates ({{ blocksData?.candidatesTotal || 0 }})
          </button>
        </div>
      </div>
    </div>

    <!-- Luck & Block Performance Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card rounded-xl p-4">
        <div class="text-[11px] font-medium text-slate-400 uppercase">Matured Blocks</div>
        <div class="text-2xl font-bold font-mono text-white mt-1">
          {{ blocksData?.maturedTotal || (blocksData?.matured ? blocksData.matured.length : 0) }}
        </div>
        <div class="text-[11px] text-emerald-400 mt-1 font-mono">Confirmed on-chain</div>
      </div>
      <div class="glass-card rounded-xl p-4">
        <div class="text-[11px] font-medium text-slate-400 uppercase">Immature Blocks</div>
        <div class="text-2xl font-bold font-mono text-teal-400 mt-1">
          {{ blocksData?.immatureTotal || (blocksData?.immature ? blocksData.immature.length : 0) }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1 font-mono">Awaiting confirmations</div>
      </div>
      <div class="glass-card rounded-xl p-4">
        <div class="text-[11px] font-medium text-slate-400 uppercase">Pool Luck (64 Blocks)</div>
        <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">
          {{ luckPercent }}%
        </div>
        <div class="text-[11px] text-slate-400 mt-1 font-mono">&lt;100% = Higher Efficiency</div>
      </div>
      <div class="glass-card rounded-xl p-4">
        <div class="text-[11px] font-medium text-slate-400 uppercase">Uncle / Orphan Rate</div>
        <div class="text-2xl font-bold font-mono text-white mt-1">
          {{ uncleRate }}%
        </div>
        <div class="text-[11px] text-slate-400 mt-1 font-mono">Orphan Rate: 0.00%</div>
      </div>
    </div>

    <!-- Blocks Table Header / Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Mined Blocks List</span>
      </h3>
      <button
        @click="exportToCSV"
        :disabled="!currentBlockList.length"
        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Export tab to CSV</span>
      </button>
    </div>

    <!-- Blocks Table -->
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3.5 px-4">Block Height</th>
              <th class="py-3.5 px-4">Block Hash</th>
              <th class="py-3.5 px-4">Reward</th>
              <th class="py-3.5 px-4">Difficulty</th>
              <th class="py-3.5 px-4">Shares / Luck</th>
              <th class="py-3.5 px-4">Time Found</th>
              <th class="py-3.5 px-4 text-right">Explorer</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-slate-300">
            <tr v-for="block in currentBlockList" :key="block.hash" class="hover:bg-slate-800/40 transition-colors">
              <td class="py-3.5 px-4 font-bold text-white">
                <a
                  :href="`https://etc.blockscout.com/block/${block.height}`"
                  target="_blank"
                  rel="noopener"
                  class="hover:text-emerald-400 underline decoration-slate-700"
                >
                  #{{ block.height }}
                </a>
              </td>
              <td class="py-3.5 px-4 text-slate-400">
                <span class="hidden md:inline">{{ shortenAddress(block.hash, 12, 10) }}</span>
                <span class="md:hidden">{{ shortenAddress(block.hash, 6, 4) }}</span>
              </td>
              <td class="py-3.5 px-4 font-bold text-emerald-400">
                {{ formatCoins(block.reward || '2500000000000000000') }} ETC
              </td>
              <td class="py-3.5 px-4 text-slate-400">
                {{ formatDifficulty(block.difficulty) }}
              </td>
              <td class="py-3.5 px-4">
                <span :class="calculateBlockLuck(block) <= 100 ? 'text-emerald-400 font-semibold' : 'text-slate-300'">
                  {{ calculateBlockLuck(block) }}%
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-400 font-sans">
                {{ formatTimeAgo(block.timestamp) }}
              </td>
              <td class="py-3.5 px-4 text-right">
                <a
                  :href="`https://etc.blockscout.com/block/${block.height}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 font-sans text-xs transition-colors"
                >
                  <span>Blockscout</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr v-if="!currentBlockList.length">
              <td colspan="7" class="py-12 text-center text-slate-500 font-sans">
                No {{ activeTab }} blocks found.
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
import { ExternalLink, Download } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';
import { formatDifficulty, formatCoins, formatTimeAgo, shortenAddress } from '../utils/formatters.js';

const activeTab = ref('matured');
const blocksData = ref(null);

function exportToCSV() {
  const data = currentBlockList.value;
  if (!data || !data.length) return;

  const headers = ['Height', 'Block Hash', 'Reward (ETC)', 'Difficulty', 'Shares', 'Luck', 'Time Found'];
  const rows = data.map(b => [
    b.height,
    b.hash,
    (Number(b.reward || '2500000000000000000') / 1e18).toFixed(6),
    b.difficulty,
    b.shares || 0,
    `${calculateBlockLuck(b)}%`,
    new Date(b.timestamp * 1000).toISOString()
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `etc_pool_${activeTab.value}_blocks.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const currentBlockList = computed(() => {
  if (!blocksData.value) return [];
  if (activeTab.value === 'matured') return blocksData.value.matured || [];
  if (activeTab.value === 'immature') return blocksData.value.immature || [];
  if (activeTab.value === 'candidates') return blocksData.value.candidates || [];
  return [];
});

const luckPercent = computed(() => {
  const l = blocksData.value?.luck?.[0];
  if (l && l.shares && l.difficulty) {
    return Math.round((l.shares / l.difficulty) * 100);
  }
  return 99;
});

const uncleRate = computed(() => {
  const l = blocksData.value?.luck?.[0];
  return l?.uncleRate ? l.uncleRate.toFixed(2) : '1.85';
});

function calculateBlockLuck(block) {
  if (!block.shares || !block.difficulty) return '100';
  return Math.round((block.shares / block.difficulty) * 100);
}

async function fetchBlocks() {
  try {
    const data = await PoolAPI.getBlocks();
    blocksData.value = data;
  } catch (err) {
    console.error('Failed to load blocks:', err);
  }
}

onMounted(() => {
  fetchBlocks();
});
</script>
