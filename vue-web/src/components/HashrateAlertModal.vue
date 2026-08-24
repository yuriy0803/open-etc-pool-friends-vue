<template>
  <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" id="hashrate-alert-modal">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      @click="isModalOpen = false"
    ></div>

    <!-- Modal Card -->
    <div class="relative w-full max-w-2xl bg-white dark:bg-[#0c101b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] my-auto">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BellRing class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Hashrate Alert System</h3>
              <span 
                v-if="config.enabled" 
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                ACTIVE
              </span>
              <span 
                v-else 
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20"
              >
                PAUSED
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time surveillance & drop detection thresholds</p>
          </div>
        </div>

        <button 
          @click="isModalOpen = false" 
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          id="close-alert-modal-button"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-[#0c101b]">
        <button
          @click="activeTab = 'settings'"
          class="py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer"
          :class="activeTab === 'settings' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          id="alert-tab-settings"
        >
          <Sliders class="w-4 h-4" />
          <span>Alert Rules & Thresholds</span>
        </button>

        <button
          @click="activeTab = 'incidents'"
          class="py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer relative"
          :class="activeTab === 'incidents' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          id="alert-tab-incidents"
        >
          <AlertTriangle class="w-4 h-4" />
          <span>Incident Log</span>
          <span 
            v-if="unreadCount > 0" 
            class="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-rose-500 text-white rounded-full font-bold animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

        <!-- TAB 1: SETTINGS & CONFIGURATION -->
        <div v-if="activeTab === 'settings'" class="space-y-5">
          
          <!-- Master Switch -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <div class="font-bold text-sm text-slate-900 dark:text-white">Enable Hashrate Surveillance</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuously scan connected rigs and trigger alarms upon performance degradation</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="config.enabled" class="sr-only peer" id="toggle-hashrate-alerts">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <!-- Threshold Slider -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-sm text-slate-900 dark:text-white">Drop Threshold Alarm</span>
                <p class="text-xs text-slate-500 dark:text-slate-400">Trigger alert if miner hashrate dips by this percentage below average</p>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                -{{ config.thresholdPercent }}%
              </span>
            </div>

            <!-- Slider -->
            <input 
              type="range" 
              min="5" 
              max="75" 
              step="5" 
              v-model.number="config.thresholdPercent"
              class="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
              id="threshold-percentage-slider"
            />

            <!-- Presets -->
            <div class="flex items-center justify-between pt-1">
              <div class="text-[11px] text-slate-400 font-sans">Quick Presets:</div>
              <div class="flex space-x-1.5">
                <button 
                  v-for="val in [10, 20, 35, 50]" 
                  :key="val"
                  @click="config.thresholdPercent = val"
                  class="px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer"
                  :class="config.thresholdPercent === val ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'"
                >
                  {{ val }}%
                </button>
              </div>
            </div>
          </div>

          <!-- Target Wallet Scope -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-sm text-slate-900 dark:text-white">Monitored Wallet Address</label>
              <button 
                v-if="config.monitoredWallet" 
                @click="config.monitoredWallet = ''" 
                class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-sans"
              >
                Reset to All Miners
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Leave blank to monitor all connected pool miners, or enter your specific ETC wallet address.</p>
            <input 
              type="text" 
              v-model="config.monitoredWallet" 
              placeholder="All Active Miners (or enter 0x...)"
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="monitored-wallet-input"
            />
          </div>

          <!-- Notification Channels -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="font-bold text-sm text-slate-900 dark:text-white">Alert Channels & Sounds</div>

            <!-- Sound Alert Toggle -->
            <div class="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
              <div class="flex items-center space-x-2.5">
                <Volume2 class="w-4 h-4 text-slate-500" />
                <div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white">Synthesized Audio Chime</div>
                  <div class="text-[11px] text-slate-500">Play an audible warning tone via Web Audio when an incident triggers</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  @click="playAlertSound('warning')" 
                  class="px-2 py-1 text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Test Sound"
                >
                  Test Chime
                </button>
                <input type="checkbox" v-model="config.soundEnabled" class="accent-emerald-500 w-4 h-4 cursor-pointer" />
              </div>
            </div>

            <!-- Desktop Browser Push Notifications -->
            <div class="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
              <div class="flex items-center space-x-2.5">
                <Monitor class="w-4 h-4 text-slate-500" />
                <div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white">Browser Desktop Notifications</div>
                  <div class="text-[11px] text-slate-500">Receive native desktop popups even if the pool tab is running in background</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  v-if="!config.browserNotifications"
                  @click="requestBrowserPermission" 
                  class="px-2.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Enable Push
                </button>
                <span v-else class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Enabled</span>
                </span>
              </div>
            </div>

            <!-- Recovery Notification -->
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center space-x-2.5">
                <CheckCircle class="w-4 h-4 text-emerald-500" />
                <div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white">Recovery Alarms</div>
                  <div class="text-[11px] text-slate-500">Play a recovery chime when a degraded miner restores full hashrate</div>
                </div>
              </div>
              <input type="checkbox" v-model="config.notifyOnRecovery" class="accent-emerald-500 w-4 h-4 cursor-pointer" />
            </div>
          </div>

          <!-- Simulation / Test Actions -->
          <div class="flex items-center justify-between pt-2">
            <button 
              @click="testAlert" 
              class="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
              id="test-alert-button"
            >
              <Zap class="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Test Notification</span>
            </button>

            <button 
              @click="isModalOpen = false" 
              class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>

        <!-- TAB 2: INCIDENT LOG & HISTORY -->
        <div v-else-if="activeTab === 'incidents'" class="space-y-4">
          
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div class="text-xs text-slate-500 dark:text-slate-400">
              Total Recorded Incidents: <strong class="text-slate-900 dark:text-white font-mono">{{ incidents.length }}</strong>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                v-if="unreadCount > 0"
                @click="acknowledgeAll" 
                class="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-800 cursor-pointer"
              >
                Acknowledge All
              </button>
              <button 
                v-if="incidents.length > 0"
                @click="clearIncidents" 
                class="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/40 cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="incidents.length === 0" class="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <div>
              <div class="font-bold text-sm text-slate-900 dark:text-white">All Systems Operating Normally</div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">No hashrate drops or hardware degradation incidents have been detected.</p>
            </div>
            <button 
              @click="testAlert" 
              class="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-all"
            >
              Trigger Test Alert
            </button>
          </div>

          <!-- Incident Cards List -->
          <div v-else class="space-y-2.5">
            <div 
              v-for="inc in incidents" 
              :key="inc.id"
              class="p-4 rounded-xl border transition-all"
              :class="inc.resolved ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-75' : (inc.acknowledged ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30' : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30 shadow-sm')"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start space-x-3">
                  <div 
                    class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    :class="inc.resolved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
                  >
                    <CheckCircle v-if="inc.resolved" class="w-4 h-4" />
                    <AlertTriangle v-else class="w-4 h-4" />
                  </div>

                  <div>
                    <div class="flex items-center space-x-2 flex-wrap">
                      <span 
                        class="text-xs font-extrabold uppercase font-mono tracking-wide"
                        :class="inc.resolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
                      >
                        {{ inc.resolved ? 'RESOLVED / RECOVERED' : `HASHRATE DROP (-${inc.dropPercent}%)` }}
                      </span>
                      <span class="text-[10px] text-slate-400 font-sans">
                        {{ formatTimeAgo(inc.createdAt) }}
                      </span>
                    </div>

                    <div class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 mt-1">
                      Rig: <router-link :to="`/account/${inc.address}`" @click="isModalOpen = false" class="text-emerald-600 dark:text-emerald-400 hover:underline">{{ inc.shortAddr }}</router-link>
                    </div>

                    <div class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center space-x-2 font-mono">
                      <span>Observed: <strong class="text-rose-600 dark:text-rose-400">{{ formatHashrate(inc.currentHr) }}</strong></span>
                      <span>•</span>
                      <span>Target Baseline: <strong class="text-slate-700 dark:text-slate-300">{{ formatHashrate(inc.expectedHr) }}</strong></span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end space-y-1.5 shrink-0">
                  <button 
                    v-if="!inc.resolved"
                    @click="resolveIncident(inc.id)" 
                    class="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                  <button 
                    v-else-if="!inc.acknowledged"
                    @click="acknowledgeIncident(inc.id)" 
                    class="px-2 py-0.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[10px] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  X, BellRing, Sliders, AlertTriangle, Volume2, Monitor, CheckCircle, 
  CheckCircle2, Zap, ShieldCheck 
} from 'lucide-vue-next';
import { useHashrateAlerts } from '../composables/useHashrateAlerts.js';
import { formatHashrate, formatTimeAgo } from '../utils/formatters.js';

const activeTab = ref('settings');

const {
  config,
  incidents,
  unreadCount,
  isModalOpen,
  playAlertSound,
  requestBrowserPermission,
  testAlert,
  acknowledgeIncident,
  acknowledgeAll,
  resolveIncident,
  clearIncidents
} = useHashrateAlerts();
</script>
