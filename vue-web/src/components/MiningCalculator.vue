<template>
  <div class="space-y-6">
    <!-- Main Calculator Box -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Input Panel (5 Cols) -->
      <div class="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Mining Rig Parameters</span>
          </h3>
          <button 
            @click="resetToDefault" 
            class="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw class="w-3 h-3" />
            Reset
          </button>
        </div>

        <!-- Hashrate -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hashrate</label>
            <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {{ hashrateVal }} {{ hashrateUnit }}/s
            </span>
          </div>
          <div class="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input
              v-model.number="hashrateVal"
              type="number"
              min="0.1"
              step="any"
              class="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
              placeholder="Enter hashrate"
            />
            <select
              v-model="hashrateUnit"
              class="bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="MH">MH/s</option>
              <option value="GH">GH/s</option>
              <option value="TH">TH/s</option>
            </select>
          </div>
          <input 
            type="range" 
            v-model.number="hashrateVal" 
            :min="1" 
            :max="hashrateUnit === 'MH' ? 3000 : hashrateUnit === 'GH' ? 100 : 5"
            step="1"
            class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <!-- Power -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Power Consumption</label>
            <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {{ powerWatts }} Watts
            </span>
          </div>
          <div class="relative flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input
              v-model.number="powerWatts"
              type="number"
              min="0"
              step="10"
              class="w-full bg-transparent px-3.5 py-2.5 pr-12 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
              placeholder="0"
            />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-slate-500">W</span>
          </div>
          <input 
            type="range" 
            v-model.number="powerWatts" 
            min="0" 
            max="5000" 
            step="50"
            class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <!-- Electricity Cost -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Electricity Cost</label>
            <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              ${{ powerCost.toFixed(2) }} / kWh
            </span>
          </div>
          <div class="relative flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input
              v-model.number="powerCost"
              type="number"
              min="0"
              step="0.01"
              class="w-full bg-transparent px-3.5 py-2.5 pr-16 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
              placeholder="0.00"
            />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-slate-500">$/kWh</span>
          </div>
          <input 
            type="range" 
            v-model.number="powerCost" 
            min="0" 
            max="1.50" 
            step="0.01"
            class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <!-- Pool Fee -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pool Fee (%)</label>
            <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ poolFee }}%</span>
          </div>
          <div class="relative flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <input
              v-model.number="poolFee"
              type="number"
              min="0"
              max="15"
              step="0.1"
              class="w-full bg-transparent px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white font-mono focus:outline-none"
              placeholder="0.5"
            />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-slate-500">%</span>
          </div>
        </div>

        <!-- Hardware Presets -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Hardware Presets</label>
            <span class="text-[10px] text-slate-400 font-mono">Popular GPUs & ASICs</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="p in presets"
              :key="p.name"
              @click="applyPreset(p)"
              class="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-[10px] font-mono text-left transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <span class="font-bold truncate w-full">{{ p.shortName }}</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                {{ p.val }} {{ p.unit }} • {{ p.watts }}W
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Output Results Panel (7 Cols) -->
      <div class="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Projected Earnings Breakdown</span>
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                ETC Price: ${{ etcPrice }} USD
              </span>
            </div>
          </div>

          <!-- Profitability Metric Boxes -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Day -->
            <div class="bg-slate-50/50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Daily (24h)</div>
                <Clock class="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div class="space-y-0.5">
                <div class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{{ results.dailyETC }}</div>
                <div class="text-[10px] font-semibold text-slate-400">ETC Estimated</div>
              </div>
              <div class="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div class="flex justify-between"><span class="text-slate-500">Gross Rev:</span><span class="text-slate-800 dark:text-slate-200 font-semibold">${{ results.dailyRevUSD }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Power Cost:</span><span class="text-rose-600 dark:text-rose-400 font-semibold">-${{ results.dailyPowerUSD }}</span></div>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex justify-between items-center text-xs font-extrabold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                <span>Net Profit:</span>
                <span>${{ results.dailyProfitUSD }}</span>
              </div>
            </div>

            <!-- Week -->
            <div class="bg-slate-50/50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Weekly (7d)</div>
                <CalendarDays class="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div class="space-y-0.5">
                <div class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{{ (results.dailyETC * 7).toFixed(4) }}</div>
                <div class="text-[10px] font-semibold text-slate-400">ETC Estimated</div>
              </div>
              <div class="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div class="flex justify-between"><span class="text-slate-500">Gross Rev:</span><span class="text-slate-800 dark:text-slate-200 font-semibold">${{ (results.dailyRevUSD * 7).toFixed(2) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Power Cost:</span><span class="text-rose-600 dark:text-rose-400 font-semibold">-${{ (results.dailyPowerUSD * 7).toFixed(2) }}</span></div>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex justify-between items-center text-xs font-extrabold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                <span>Net Profit:</span>
                <span>${{ (results.dailyProfitUSD * 7).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Month -->
            <div class="bg-slate-50/50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Monthly (30d)</div>
                <Milestone class="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div class="space-y-0.5">
                <div class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{{ (results.dailyETC * 30).toFixed(4) }}</div>
                <div class="text-[10px] font-semibold text-slate-400">ETC Estimated</div>
              </div>
              <div class="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div class="flex justify-between"><span class="text-slate-500">Gross Rev:</span><span class="text-slate-800 dark:text-slate-200 font-semibold">${{ (results.dailyRevUSD * 30).toFixed(2) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Power Cost:</span><span class="text-rose-600 dark:text-rose-400 font-semibold">-${{ (results.dailyPowerUSD * 30).toFixed(2) }}</span></div>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-800/80 pt-2 flex justify-between items-center text-xs font-extrabold font-mono" :class="results.dailyProfitUSD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                <span>Net Profit:</span>
                <span>${{ (results.dailyProfitUSD * 30).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Simulations / Custom Overrides -->
        <div class="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/60 space-y-3">
          <div class="flex items-center justify-between">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders class="w-3.5 h-3.5 text-emerald-500" />
              <span>Advanced Simulations (Live Values Overrides)</span>
            </div>
            <button 
              @click="toggleSimulation" 
              class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {{ isSimulating ? 'Use Live Stats' : 'Customize Stats' }}
            </button>
          </div>

          <div v-if="isSimulating" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div class="space-y-1">
              <label class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">ETC Price ($)</label>
              <input 
                v-model.number="etcPrice" 
                type="number" 
                step="any"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Difficulty (T)</label>
              <input 
                v-model.number="simDifficultyT" 
                type="number" 
                step="any"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Block Reward (ETC)</label>
              <input 
                v-model.number="blockReward" 
                type="number" 
                step="any"
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <p class="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 pt-0.5">
            Network Difficulty is currently <span class="text-slate-800 dark:text-slate-200 font-mono font-bold">{{ formattedDifficulty }}</span>. Live reward is <span class="text-slate-800 dark:text-slate-200 font-mono font-bold">{{ blockReward }} ETC</span> per block. Revenue math is <span class="text-slate-800 dark:text-slate-200 font-mono font-semibold">Rewards = (Rig Hashrate * Block Time Reward) / Network Difficulty</span>.
          </p>
        </div>

        <!-- Real-time Threshold Alerts & Push Notifications -->
        <div class="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/60 space-y-4">
          <div class="flex items-center justify-between">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell class="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              <span>Mining Pool Price & Reward Alerts</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="toggleSound" 
                class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                :title="soundAlertsEnabled ? 'Mute Sounds' : 'Unmute Sounds'"
              >
                <Volume2 v-if="soundAlertsEnabled" class="w-3.5 h-3.5 text-emerald-500" />
                <VolumeX v-else class="w-3.5 h-3.5 text-rose-500" />
              </button>
              
              <button 
                v-if="!browserNotificationsGranted" 
                @click="requestPermission" 
                class="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert class="w-3 h-3" />
                <span>Enable Push</span>
              </button>
              <span v-else class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Check class="w-3 h-3" />
                Push Enabled
              </span>
            </div>
          </div>

          <!-- Alert configuration list -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Price alert -->
            <div class="bg-white dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">ETC Target Price</span>
                <input 
                  type="checkbox" 
                  v-model="priceAlertEnabled" 
                  class="rounded border-slate-300 dark:border-slate-800 accent-emerald-500 h-3.5 w-3.5 cursor-pointer"
                />
              </div>
              <div v-if="priceAlertEnabled" class="grid grid-cols-12 gap-1.5 pt-1">
                <select 
                  v-model="priceAlertCondition" 
                  class="col-span-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-1 rounded-lg text-[10px] font-mono focus:outline-none cursor-pointer"
                >
                  <option value="above">≥ Rises Above</option>
                  <option value="below">≤ Drops Below</option>
                </select>
                <div class="col-span-6 relative flex items-center">
                  <span class="absolute left-2 text-[10px] font-mono text-slate-400">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    v-model.number="priceAlertThreshold" 
                    class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-4 pr-1.5 py-1 rounded-lg text-[10px] font-mono focus:outline-none"
                  />
                </div>
              </div>
              <p class="text-[9px] text-slate-400">
                Current price is <span class="font-mono">${{ etcPrice.toFixed(2) }}</span>
              </p>
            </div>

            <!-- Reward alert -->
            <div class="bg-white dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">Daily Reward Target</span>
                <input 
                  type="checkbox" 
                  v-model="rewardAlertEnabled" 
                  class="rounded border-slate-300 dark:border-slate-800 accent-emerald-500 h-3.5 w-3.5 cursor-pointer"
                />
              </div>
              <div v-if="rewardAlertEnabled" class="grid grid-cols-12 gap-1.5 pt-1">
                <select 
                  v-model="rewardAlertCondition" 
                  class="col-span-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-1 rounded-lg text-[10px] font-mono focus:outline-none cursor-pointer"
                >
                  <option value="above">≥ Rises Above</option>
                  <option value="below">≤ Drops Below</option>
                </select>
                <div class="col-span-6 relative flex items-center">
                  <input 
                    type="number" 
                    step="0.001" 
                    v-model.number="rewardAlertThreshold" 
                    class="col-span-12 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-2 pr-6 py-1 rounded-lg text-[10px] font-mono focus:outline-none"
                  />
                  <span class="absolute right-2 text-[8px] font-mono text-slate-400">ETC</span>
                </div>
              </div>
              <p class="text-[9px] text-slate-400">
                Current reward is <span class="font-mono">{{ results.dailyETC }} ETC</span>
              </p>
            </div>
          </div>

          <!-- Bottom controls -->
          <div class="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800/40">
            <span class="text-[9px] text-slate-400">
              Alerts save automatically and scan live.
            </span>
            <button 
              @click="triggerSimulatedAlert" 
              class="text-[9px] text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
            >
              Simulate Test Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Cpu, TrendingUp, RotateCcw, Clock, CalendarDays, Milestone, Sliders, Bell, Volume2, VolumeX, ShieldAlert, Check } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';
import { useToasts } from '../composables/useToasts.js';

const { addToast } = useToasts();

const hashrateVal = ref(500);
const hashrateUnit = ref('MH');
const powerWatts = ref(650);
const powerCost = ref(0.12);
const poolFee = ref(0.5);

// Network parameters
const etcPrice = ref(28.45);
const difficulty = ref(17179869184000); // 17.18 T
const blockReward = ref(2.56);

// Live cached values
const livePrice = ref(28.45);
const liveDifficulty = ref(17179869184000);
const liveBlockReward = ref(2.56);

// Simulator overrides
const isSimulating = ref(false);
const simDifficultyT = ref(17.18);

// Alerts & threshold states
const priceAlertEnabled = ref(false);
const priceAlertThreshold = ref(30.00);
const priceAlertCondition = ref('above');
const priceAlertTriggered = ref(false);

const rewardAlertEnabled = ref(false);
const rewardAlertThreshold = ref(1.0);
const rewardAlertCondition = ref('above');
const rewardAlertTriggered = ref(false);

const soundAlertsEnabled = ref(true);
const browserNotificationsGranted = ref(false);

// Load persisted alerts state
try {
  const savedPriceAlertEnabled = localStorage.getItem('etc_price_alert_enabled');
  if (savedPriceAlertEnabled) priceAlertEnabled.value = JSON.parse(savedPriceAlertEnabled);
  
  const savedPriceAlertThreshold = localStorage.getItem('etc_price_alert_threshold');
  if (savedPriceAlertThreshold) priceAlertThreshold.value = Number(savedPriceAlertThreshold);
  
  const savedPriceAlertCondition = localStorage.getItem('etc_price_alert_condition');
  if (savedPriceAlertCondition) priceAlertCondition.value = savedPriceAlertCondition;
  
  const savedRewardAlertEnabled = localStorage.getItem('etc_reward_alert_enabled');
  if (savedRewardAlertEnabled) rewardAlertEnabled.value = JSON.parse(savedRewardAlertEnabled);
  
  const savedRewardAlertThreshold = localStorage.getItem('etc_reward_alert_threshold');
  if (savedRewardAlertThreshold) rewardAlertThreshold.value = Number(savedRewardAlertThreshold);
  
  const savedRewardAlertCondition = localStorage.getItem('etc_reward_alert_condition');
  if (savedRewardAlertCondition) rewardAlertCondition.value = savedRewardAlertCondition;
  
  const savedSoundAlertsEnabled = localStorage.getItem('etc_sound_alerts_enabled');
  if (savedSoundAlertsEnabled) soundAlertsEnabled.value = JSON.parse(savedSoundAlertsEnabled);
} catch (err) {
  console.warn('Failed to load local alert parameters:', err);
}

// Watchers for persistent storage & resetting trigger flags
watch(priceAlertEnabled, (v) => {
  localStorage.setItem('etc_price_alert_enabled', JSON.stringify(v));
  priceAlertTriggered.value = false;
});
watch(priceAlertThreshold, (v) => {
  localStorage.setItem('etc_price_alert_threshold', v ? v.toString() : '0');
  priceAlertTriggered.value = false;
});
watch(priceAlertCondition, (v) => {
  localStorage.setItem('etc_price_alert_condition', v);
  priceAlertTriggered.value = false;
});

watch(rewardAlertEnabled, (v) => {
  localStorage.setItem('etc_reward_alert_enabled', JSON.stringify(v));
  rewardAlertTriggered.value = false;
});
watch(rewardAlertThreshold, (v) => {
  localStorage.setItem('etc_reward_alert_threshold', v ? v.toString() : '0');
  rewardAlertTriggered.value = false;
});
watch(rewardAlertCondition, (v) => {
  localStorage.setItem('etc_reward_alert_condition', v);
  rewardAlertTriggered.value = false;
});

watch(soundAlertsEnabled, (v) => localStorage.setItem('etc_sound_alerts_enabled', JSON.stringify(v)));

function checkNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    browserNotificationsGranted.value = Notification.permission === 'granted';
  }
}

async function requestPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    addToast('Desktop push notifications are not supported in this browser.', 'warning');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    browserNotificationsGranted.value = permission === 'granted';
    if (permission === 'granted') {
      addToast('Browser notifications enabled successfully!', 'success');
      playNotificationTone();
    } else {
      addToast('Permission was denied.', 'warning');
    }
  } catch (err) {
    console.error('Failed requesting push permission:', err);
  }
}

function toggleSound() {
  soundAlertsEnabled.value = !soundAlertsEnabled.value;
  addToast(soundAlertsEnabled.value ? 'Audio alerts enabled' : 'Audio alerts muted', 'info');
}

function playNotificationTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

function triggerThresholdNotification(title, message) {
  addToast(message, 'info');
  if (soundAlertsEnabled.value) {
    playNotificationTone();
  }
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    } catch (err) {
      console.warn('Native push failed:', err);
    }
  }
}

function triggerSimulatedAlert() {
  triggerThresholdNotification('ETC Pool Simulation Alert', 'Test notification works! Target threshold crossed.');
}

function checkThresholdAlerts() {
  // 1. Price check
  if (priceAlertEnabled.value && !priceAlertTriggered.value) {
    const currentPrice = etcPrice.value;
    const thresh = priceAlertThreshold.value;
    if (priceAlertCondition.value === 'above' && currentPrice >= thresh) {
      triggerThresholdNotification('ETC Price Alert', `Ethereum Classic has risen above your target! Current: $${currentPrice.toFixed(2)} (Target: $${thresh.toFixed(2)})`);
      priceAlertTriggered.value = true;
    } else if (priceAlertCondition.value === 'below' && currentPrice <= thresh) {
      triggerThresholdNotification('ETC Price Alert', `Ethereum Classic has dropped below your target! Current: $${currentPrice.toFixed(2)} (Target: $${thresh.toFixed(2)})`);
      priceAlertTriggered.value = true;
    }
  }

  // 2. Daily reward check
  if (rewardAlertEnabled.value && !rewardAlertTriggered.value) {
    const currentReward = parseFloat(results.value.dailyETC);
    const thresh = rewardAlertThreshold.value;
    if (!isNaN(currentReward) && thresh > 0) {
      if (rewardAlertCondition.value === 'above' && currentReward >= thresh) {
        triggerThresholdNotification('ETC Reward Alert', `Daily mining rewards has exceeded your target! Current: ${currentReward.toFixed(4)} ETC (Target: ${thresh.toFixed(4)} ETC)`);
        rewardAlertTriggered.value = true;
      } else if (rewardAlertCondition.value === 'below' && currentReward <= thresh) {
        triggerThresholdNotification('ETC Reward Alert', `Daily mining rewards has dropped below your target! Current: ${currentReward.toFixed(4)} ETC (Target: ${thresh.toFixed(4)} ETC)`);
        rewardAlertTriggered.value = true;
      }
    }
  }
}

const formattedDifficulty = computed(() => {
  const d = difficulty.value;
  if (d >= 1e12) return `${(d / 1e12).toFixed(2)} T`;
  if (d >= 1e9) return `${(d / 1e9).toFixed(2)} G`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(2)} M`;
  return d.toLocaleString();
});

const presets = [
  { name: 'rtx3070', shortName: '1x RTX 3070', val: 62, unit: 'MH', watts: 130 },
  { name: 'rtx3080', shortName: '1x RTX 3080', val: 100, unit: 'MH', watts: 220 },
  { name: 'rtx4090', shortName: '1x RTX 4090', val: 240, unit: 'MH', watts: 350 },
  { name: 'jasminer', shortName: 'Jasminer X4', val: 2.5, unit: 'GH', watts: 1200 },
  { name: 'antminer', shortName: 'Antminer E9', val: 3.68, unit: 'GH', watts: 2200 }
];

function applyPreset(p) {
  hashrateVal.value = p.val;
  hashrateUnit.value = p.unit;
  powerWatts.value = p.watts;
}

function resetToDefault() {
  hashrateVal.value = 500;
  hashrateUnit.value = 'MH';
  powerWatts.value = 650;
  powerCost.value = 0.12;
  poolFee.value = 0.5;
  isSimulating.value = false;
  etcPrice.value = livePrice.value;
  difficulty.value = liveDifficulty.value;
  blockReward.value = liveBlockReward.value;
  simDifficultyT.value = parseFloat((liveDifficulty.value / 1e12).toFixed(2));
}

function toggleSimulation() {
  if (isSimulating.value) {
    // Turning off: restore live values
    isSimulating.value = false;
    etcPrice.value = livePrice.value;
    difficulty.value = liveDifficulty.value;
    blockReward.value = liveBlockReward.value;
  } else {
    // Turning on: copy values to let user edit them
    isSimulating.value = true;
    simDifficultyT.value = parseFloat((difficulty.value / 1e12).toFixed(2));
  }
}

// Watch simulator difficulty input in Terahashes and map to raw hash Difficulty value
watch(simDifficultyT, (newVal) => {
  if (isSimulating.value && newVal > 0) {
    difficulty.value = newVal * 1e12;
  }
});

const totalHashInMH = computed(() => {
  let mult = 1;
  if (hashrateUnit.value === 'GH') mult = 1000;
  if (hashrateUnit.value === 'TH') mult = 1000000;
  return (hashrateVal.value || 0) * mult;
});

const results = computed(() => {
  const mh = totalHashInMH.value;
  const hashRateHps = mh * 1e6; // Convert MH/s to H/s
  
  // Calculate block share / daily output:
  // Daily Rewards = (hashrate * 86400 * blockReward) / difficulty
  let baseDailyETC = 0;
  if (difficulty.value > 0) {
    baseDailyETC = (hashRateHps * 86400 * blockReward.value) / difficulty.value;
  }
  
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
      livePrice.value = data.market_data.current_price.usd;
      if (!isSimulating.value) {
        etcPrice.value = data.market_data.current_price.usd;
      }
    }
  } catch (err) {
    console.error('Failed to load price for calculator:', err);
  }
}

async function loadStatsAndPrice() {
  await loadPrice();
  try {
    const stats = await PoolAPI.getStats();
    if (stats?.nodes?.[0]?.difficulty) {
      liveDifficulty.value = stats.nodes[0].difficulty;
      if (!isSimulating.value) {
        difficulty.value = stats.nodes[0].difficulty;
        simDifficultyT.value = parseFloat((stats.nodes[0].difficulty / 1e12).toFixed(2));
      }
    }
  } catch (err) {
    console.warn('Failed to load stats for calculator:', err);
  }
}

// Watchers to trigger alert checks when price or daily rewards change
watch([etcPrice, () => results.value.dailyETC], () => {
  checkThresholdAlerts();
}, { deep: true });

onMounted(() => {
  checkNotificationPermission();
  loadStatsAndPrice().then(() => {
    // Check initially on load
    checkThresholdAlerts();
  });
});
</script>
