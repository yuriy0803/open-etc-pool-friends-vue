<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
        <Calculator class="w-3.5 h-3.5" />
        <span>Ethereum Classic Mining Calculator</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Mining Profitability Calculator
      </h1>
      <p class="text-sm text-slate-400">
        Estimate your gross mining rewards, electricity overheads, and net profit based on live network difficulty.
      </p>
    </div>

    <!-- Main Calculator Box -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Input Panel (1 Col) -->
      <div class="glass-card rounded-2xl p-6 space-y-5">
        <h3 class="text-base font-bold text-white flex items-center space-x-2">
          <Cpu class="w-4 h-4 text-emerald-400" />
          <span>Mining Rig Parameters</span>
        </h3>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-400 mb-1">Hashrate</label>
          <div class="flex">
            <input
              v-model.number="hashrateVal"
              type="number"
              min="1"
              step="any"
              class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-l-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
            />
            <select
              v-model="hashrateUnit"
              class="bg-slate-800 border-y border-r border-slate-700 rounded-r-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="MH">MH/s</option>
              <option value="GH">GH/s</option>
              <option value="TH">TH/s</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-400 mb-1">Power Consumption (Watts)</label>
          <input
            v-model.number="powerWatts"
            type="number"
            min="0"
            step="10"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-400 mb-1">Electricity Cost ($ / kWh)</label>
          <input
            v-model.number="powerCost"
            type="number"
            min="0"
            step="0.01"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-400 mb-1">Pool Fee (%)</label>
          <input
            v-model.number="poolFee"
            type="number"
            min="0"
            max="10"
            step="0.1"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
          />
        </div>

        <!-- Quick GPU presets -->
        <div class="pt-2">
          <label class="block text-[11px] font-semibold uppercase text-slate-500 mb-2">Quick Presets</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="p in presets"
              :key="p.name"
              @click="applyPreset(p)"
              class="px-2 py-1 rounded bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/50 text-[10px] font-mono transition-colors"
            >
              {{ p.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Output Results Panel (2 Cols) -->
      <div class="md:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp class="w-4 h-4 text-emerald-400" />
              <span>Projected Earnings Breakdown</span>
            </h3>
            <span class="text-xs font-mono text-emerald-400">ETC Price: ${{ etcPrice }} USD</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Day -->
            <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <div class="text-[11px] text-slate-400 uppercase font-bold">Daily (24h)</div>
              <div class="text-lg font-bold font-mono text-emerald-400">{{ results.dailyETC }} ETC</div>
              <div class="text-xs text-white font-mono">Revenue: ${{ results.dailyRevUSD }}</div>
              <div class="text-[11px] text-rose-400 font-mono">Power: -${{ results.dailyPowerUSD }}</div>
              <div class="border-t border-slate-800 pt-1 text-xs font-bold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                Profit: ${{ results.dailyProfitUSD }}
              </div>
            </div>

            <!-- Week -->
            <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <div class="text-[11px] text-slate-400 uppercase font-bold">Weekly (7d)</div>
              <div class="text-lg font-bold font-mono text-emerald-400">{{ (results.dailyETC * 7).toFixed(4) }} ETC</div>
              <div class="text-xs text-white font-mono">Revenue: ${{ (results.dailyRevUSD * 7).toFixed(2) }}</div>
              <div class="text-[11px] text-rose-400 font-mono">Power: -${{ (results.dailyPowerUSD * 7).toFixed(2) }}</div>
              <div class="border-t border-slate-800 pt-1 text-xs font-bold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                Profit: ${{ (results.dailyProfitUSD * 7).toFixed(2) }}
              </div>
            </div>

            <!-- Month -->
            <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <div class="text-[11px] text-slate-400 uppercase font-bold">Monthly (30d)</div>
              <div class="text-lg font-bold font-mono text-emerald-400">{{ (results.dailyETC * 30).toFixed(4) }} ETC</div>
              <div class="text-xs text-white font-mono">Revenue: ${{ (results.dailyRevUSD * 30).toFixed(2) }}</div>
              <div class="text-[11px] text-rose-400 font-mono">Power: -${{ (results.dailyPowerUSD * 30).toFixed(2) }}</div>
              <div class="border-t border-slate-800 pt-1 text-xs font-bold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                Profit: ${{ (results.dailyProfitUSD * 30).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <div class="font-bold text-white">Calculation notes:</div>
          <p>
            Network difficulty: <span class="text-emerald-400 font-mono">{{ formattedDifficulty }}</span>. Reward per block: <span class="text-emerald-400 font-mono">{{ blockReward }} ETC</span>. Electricity cost is calculated as <span class="text-slate-300 font-mono">(Watts / 1000) * 24h * $/kWh</span>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Calculator, Cpu, TrendingUp } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';

const hashrateVal = ref(500);
const hashrateUnit = ref('MH');
const powerWatts = ref(650);
const powerCost = ref(0.10);
const poolFee = ref(0.5);
const etcPrice = ref(28.45);
const difficulty = ref(17179869184000); // Default 17.18 T from server API
const blockReward = ref(2.56);

const formattedDifficulty = computed(() => {
  const d = difficulty.value;
  if (d >= 1e12) return `${(d / 1e12).toFixed(2)} T`;
  if (d >= 1e9) return `${(d / 1e9).toFixed(2)} G`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(2)} M`;
  return d.toString();
});

const presets = [
  { name: '1x RTX 3080 (100 MH, 220W)', val: 100, unit: 'MH', watts: 220 },
  { name: '6x RTX 3070 (360 MH, 780W)', val: 360, unit: 'MH', watts: 780 },
  { name: '8x RX 6700XT (380 MH, 800W)', val: 380, unit: 'MH', watts: 800 },
  { name: 'Jasminer X4 (2.5 GH, 1200W)', val: 2.5, unit: 'GH', watts: 1200 },
  { name: 'Antminer E9 Pro (3.68 GH, 2200W)', val: 3.68, unit: 'GH', watts: 2200 }
];

function applyPreset(p) {
  hashrateVal.value = p.val;
  hashrateUnit.value = p.unit;
  powerWatts.value = p.watts;
}

const totalHashInMH = computed(() => {
  let mult = 1;
  if (hashrateUnit.value === 'GH') mult = 1000;
  if (hashrateUnit.value === 'TH') mult = 1000000;
  return (hashrateVal.value || 0) * mult;
});

const results = computed(() => {
  const mh = totalHashInMH.value;
  const hashRateHps = mh * 1e6; // Convert MH/s to H/s
  
  // Mathematically exact reward formula based on live network difficulty:
  // Daily Rewards = (hashrate * 86400 * blockReward) / networkDifficulty
  const baseDailyETC = (hashRateHps * 86400 * blockReward.value) / difficulty.value;
  const dailyETC = baseDailyETC * (1 - (poolFee.value || 0) / 100);
  const dailyRevUSD = dailyETC * etcPrice.value;

  const dailyPowerKWh = ((powerWatts.value || 0) * 24) / 1000;
  const dailyPowerUSD = dailyPowerKWh * (powerCost.value || 0);
  const dailyProfitUSD = dailyRevUSD - dailyPowerUSD;

  return {
    dailyETC: dailyETC.toFixed(4),
    dailyRevUSD: dailyRevUSD.toFixed(2),
    dailyPowerUSD: dailyPowerUSD.toFixed(2),
    dailyProfitUSD: dailyProfitUSD.toFixed(2),
  };
});

async function loadPrice() {
  try {
    const data = await PoolAPI.getPrice();
    if (data?.market_data?.current_price?.usd) {
      etcPrice.value = data.market_data.current_price.usd;
    }
  } catch (err) {
    console.error('Failed to load price:', err);
  }
}

async function loadStatsAndPrice() {
  await loadPrice();
  try {
    const stats = await PoolAPI.getStats();
    if (stats?.nodes?.[0]?.difficulty) {
      difficulty.value = stats.nodes[0].difficulty;
    }
  } catch (err) {
    console.warn('Failed to load stats for calculator:', err);
  }
}

onMounted(() => {
  loadStatsAndPrice();
});
</script>
