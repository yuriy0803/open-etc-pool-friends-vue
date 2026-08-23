<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Active Pool Miners</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Real-time leaderboard of active addresses and miners</p>
      </div>

      <div class="flex items-center space-x-3">
        <div class="relative w-full sm:w-64">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Filter by address..."
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>
    </div>

    <!-- Summary metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 uppercase font-medium">Total Miners</div>
          <div class="text-2xl font-bold font-mono text-white mt-1">{{ minerList.length }}</div>
        </div>
        <Users class="w-6 h-6 text-emerald-400 opacity-80" />
      </div>
      <div class="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 uppercase font-medium">Total Online Hashrate</div>
          <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">{{ formatHashrate(totalMinerHash) }}</div>
        </div>
        <Zap class="w-6 h-6 text-teal-400 opacity-80" />
      </div>
      <div class="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400 uppercase font-medium">Average Hashrate / Miner</div>
          <div class="text-2xl font-bold font-mono text-white mt-1">{{ formatHashrate(avgMinerHash) }}</div>
        </div>
        <Activity class="w-6 h-6 text-indigo-400 opacity-80" />
      </div>
    </div>

    <!-- Miners Table -->
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3.5 px-4"># Rank</th>
              <th class="py-3.5 px-4">Miner Address</th>
              <th class="py-3.5 px-4">Hashrate</th>
              <th class="py-3.5 px-4">Pool Share</th>
              <th class="py-3.5 px-4">Last Share</th>
              <th class="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-slate-300">
            <tr
              v-for="(miner, index) in filteredMiners"
              :key="miner.address"
              class="hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-3.5 px-4 font-bold text-slate-400 font-sans">
                <span :class="index < 3 ? 'text-emerald-400 font-extrabold' : ''">#{{ index + 1 }}</span>
              </td>
              <td class="py-3.5 px-4">
                <router-link
                  :to="`/miner/${miner.address}`"
                  class="font-mono text-emerald-400 hover:text-emerald-300 hover:underline font-medium flex items-center space-x-1.5"
                >
                  <span>{{ miner.address }}</span>
                </router-link>
              </td>
              <td class="py-3.5 px-4 font-bold text-white">
                {{ formatHashrate(miner.hr) }}
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="bg-emerald-400 h-full rounded-full"
                      :style="{ width: `${calculateShare(miner.hr)}%` }"
                    ></div>
                  </div>
                  <span class="text-[11px] text-slate-400">{{ calculateShare(miner.hr) }}%</span>
                </div>
              </td>
              <td class="py-3.5 px-4 text-slate-400 font-sans">
                {{ formatTimeAgo(miner.lastBeat) }}
              </td>
              <td class="py-3.5 px-4 text-right">
                <router-link
                  :to="`/miner/${miner.address}`"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 font-sans text-xs transition-colors"
                >
                  <span>Stats</span>
                  <ArrowUpRight class="w-3 h-3" />
                </router-link>
              </td>
            </tr>
            <tr v-if="!filteredMiners.length">
              <td colspan="6" class="py-12 text-center text-slate-500 font-sans">
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
import { ref, computed, onMounted } from 'vue';
import { Search, Users, Zap, Activity, ArrowUpRight } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';
import { formatHashrate, formatTimeAgo } from '../utils/formatters.js';

const minersData = ref(null);
const searchTerm = ref('');

const minerList = computed(() => {
  if (!minersData.value?.miners) return [];
  return Object.entries(minersData.value.miners).map(([address, data]) => ({
    address,
    ...data
  })).sort((a, b) => (b.hr || 0) - (a.hr || 0));
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

function calculateShare(hr) {
  if (!totalMinerHash.value || totalMinerHash.value <= 0) return '0.0';
  return ((hr / totalMinerHash.value) * 100).toFixed(1);
}

async function fetchMiners() {
  try {
    const data = await PoolAPI.getMiners();
    minersData.value = data;
  } catch (err) {
    console.error('Failed to load miners:', err);
  }
}

onMounted(() => {
  fetchMiners();
});
</script>
