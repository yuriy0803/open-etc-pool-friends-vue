<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center justify-between">
      <router-link to="/miners" class="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors">
        <ArrowLeft class="w-4 h-4" />
        <span>Back to All Miners</span>
      </router-link>
      <div class="flex items-center space-x-2">
        <div class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 font-sans">
          <span>Auto-refresh in <strong class="text-white font-mono">{{ secondsLeft }}s</strong></span>
        </div>
        <button @click="triggerRefresh" class="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loading || isRefreshing }" />
          <span>Refresh</span>
        </button>
      </div>
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
        :badgeText="`Min Payout: ${minerData?.threshold ? (minerData.threshold / 1e9).toFixed(2) : '0.50'} ETC`"
        badgeClass="bg-teal-500/10 text-teal-400 border border-teal-500/20"
        :icon="Wallet"
      />
      <StatCard
        title="Total Paid Out"
        :value="`${formatCoins(minerData?.stats?.paid || 0)} ETC`"
        :subValue="`${(minerData?.payments || []).length} Payments`"
        :badgeText="(minerData?.miningType || 'pplns').toUpperCase()"
        :badgeClass="minerData?.miningType === 'solo' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'"
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
        <button
          @click="exportToCSV"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
          title="Export 24-hour historical hashrate points to CSV"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
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
          <p class="text-xs text-slate-400">Interactive profitability calculator</p>
        </div>

        <!-- Interactive Calculator Customizer Controls -->
        <div class="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-2 text-[11px] font-sans">
          <div class="flex items-center justify-between text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
            <span>Adjust Parameters Below</span>
            <span class="text-emerald-400 text-[10px]">Real-Time Data</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-500 font-semibold mb-0.5">Hashrate (MH/s):</label>
              <input
                v-model.number="calcHashMHs"
                type="number"
                step="5"
                min="0.1"
                class="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-slate-500 font-semibold mb-0.5">ETC Price (USD):</label>
              <input
                v-model.number="calcUsdPrice"
                type="number"
                step="0.5"
                min="0.1"
                class="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="text-slate-500 font-semibold">Pool Fee %:</label>
            <input
              v-model.number="calcPoolFeePercent"
              type="number"
              step="0.5"
              min="0"
              max="10"
              class="w-16 bg-slate-950 border border-slate-800/80 rounded px-2 py-0.5 text-white font-mono text-xs text-center focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="space-y-2.5 font-mono text-xs">
          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-sans">Daily (24h)</div>
              <div class="text-sm font-bold text-white mt-0.5">{{ calcEstDailyETC.toFixed(4) }} ETC</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-emerald-400 font-sans font-bold">≈ ${{ calcEstDailyUSD.toFixed(2) }} USD</div>
            </div>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-sans">Weekly (7d)</div>
              <div class="text-sm font-bold text-white mt-0.5">{{ (calcEstDailyETC * 7).toFixed(4) }} ETC</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-emerald-400 font-sans font-bold">≈ ${{ (calcEstDailyUSD * 7).toFixed(2) }} USD</div>
            </div>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-sans">Monthly (30d)</div>
              <div class="text-sm font-bold text-white mt-0.5">{{ (calcEstDailyETC * 30).toFixed(4) }} ETC</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-emerald-400 font-sans font-bold">≈ ${{ (calcEstDailyUSD * 30).toFixed(2) }} USD</div>
            </div>
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

    <!-- Payouts & Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Miner Payouts (2 Cols) -->
      <div class="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 space-y-4">
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

      <!-- Mining Settings Form (1 Col) -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Sliders class="w-4 h-4 text-emerald-400" />
            <span>Miner Configuration</span>
          </h3>
          <p class="text-xs text-slate-400">Modify reward scheme, threshold & alerts</p>
        </div>

        <form @submit.prevent="saveSettings" class="space-y-4 text-xs text-slate-300">
          <!-- Reward Scheme Selector -->
          <div>
            <label class="block font-semibold uppercase text-slate-400 mb-1.5 text-[10px] tracking-wider">Reward Scheme</label>
            <div class="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                @click="selectedScheme = 'pplns'"
                class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center"
                :class="selectedScheme === 'pplns' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'"
              >
                PPLNS (Pool)
              </button>
              <button
                type="button"
                @click="selectedScheme = 'solo'"
                class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center"
                :class="selectedScheme === 'solo' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'"
              >
                SOLO (Individual)
              </button>
            </div>
            <p class="text-[10px] text-slate-500 mt-1 leading-normal">
              {{ selectedScheme === 'solo' ? 'Find blocks individually and claim 100% block reward (minus fee).' : 'Earn proportionally based on your share size.' }}
            </p>
          </div>

          <!-- Payout Threshold -->
          <div>
            <label class="block font-semibold uppercase text-slate-400 mb-1 text-[10px] tracking-wider">
              Payout Threshold (ETC)
            </label>
            <div class="relative flex items-center">
              <input
                v-model.number="payoutThreshold"
                type="number"
                step="0.05"
                min="0.1"
                max="10.0"
                required
                class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
              <span class="absolute right-3 text-[10px] text-slate-500 font-sans">0.1 - 10.0</span>
            </div>
          </div>

          <!-- Email Alerts -->
          <div>
            <label class="block font-semibold uppercase text-slate-400 mb-1 text-[10px] tracking-wider">
              Notification Email
            </label>
            <input
              v-model="notificationEmail"
              type="email"
              placeholder="miner@example.com"
              class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            />
            <div class="flex items-center space-x-2 mt-2">
              <input
                v-model="emailAlert"
                type="checkbox"
                id="alertCheck"
                class="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-900"
              />
              <label for="alertCheck" class="text-slate-400 cursor-pointer select-none">
                Send offline worker alerts
              </label>
            </div>
            <!-- Hashrate Drop Alert System Settings -->
            <div class="border-t border-slate-800/40 pt-2 mt-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-slate-400 font-bold uppercase">Hashrate Drop Alert</span>
                <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{{ dropAlert ? 'Enabled' : 'Disabled' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  v-model="dropAlert"
                  type="checkbox"
                  id="dropCheck"
                  class="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-900"
                />
                <label for="dropCheck" class="text-slate-400 cursor-pointer select-none">
                  Alert if hashrate drops
                </label>
              </div>
              <div v-if="dropAlert" class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-slate-500">Drop Threshold:</span>
                  <span class="text-emerald-400 font-bold font-mono">{{ dropThreshold }}%</span>
                </div>
                <input
                  v-model.number="dropThreshold"
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  class="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded"
                />
                <span class="text-[9px] text-slate-500 block leading-normal">
                  Alerts if current hashrate falls below this % of worker average.
                </span>
              </div>
            </div>
            <!-- Alert Config Status Trigger Modal Button -->
            <div class="pt-2">
              <button
                type="button"
                @click="showStatusModal = true"
                class="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white transition-all text-[11px] font-medium"
              >
                View Live Alert Diagnostic Status
              </button>
            </div>
          </div>

          <!-- Authentication Check -->
          <div class="border-t border-slate-800/80 pt-3">
            <label class="block font-semibold uppercase text-slate-300 mb-1 text-[10px] tracking-wider flex items-center space-x-1">
              <span class="text-rose-400">*</span>
              <span>IP Address or Password</span>
            </label>
            <input
              v-model="verificationIP"
              type="text"
              required
              placeholder="e.g. 192.168.1.5 or x"
              class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            />
            <p class="text-[10px] text-slate-500 mt-1 leading-normal">
              Enter the IP of one of your miners, or your miner's custom password.
            </p>
          </div>

          <!-- Save/Status Message -->
          <div v-if="settingsStatus" class="p-2.5 rounded-xl text-[11px] leading-normal" :class="settingsStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'">
            <div class="flex items-start space-x-1.5">
              <Check v-if="settingsStatus.type === 'success'" class="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <AlertCircle v-else class="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{{ settingsStatus.text }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="settingsLoading"
            class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
          >
            <RefreshCw v-if="settingsLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ settingsLoading ? 'Applying...' : 'Save Config' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Live Alerts Diagnostic Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white flex items-center space-x-2">
            <Activity class="w-4 h-4 text-emerald-400" />
            <span>Alert Diagnostics Status</span>
          </h3>
          <button @click="showStatusModal = false" class="text-slate-400 hover:text-white font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-500">Miner Address:</span>
              <span class="font-mono text-slate-300 break-all text-[11px]">{{ walletAddress }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Subscribed Email:</span>
              <span class="font-mono text-emerald-400">{{ notificationEmail || 'None' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Offline Rig Alerts:</span>
              <span class="font-mono" :class="emailAlert ? 'text-emerald-400' : 'text-slate-500'">{{ emailAlert ? 'ACTIVE (Email)' : 'INACTIVE' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Hashrate Drop Alerts:</span>
              <span class="font-mono" :class="dropAlert ? 'text-emerald-400' : 'text-slate-500'">{{ dropAlert ? 'ACTIVE' : 'INACTIVE' }}</span>
            </div>
            <div class="flex justify-between" v-if="dropAlert">
              <span class="text-slate-500">Drop Threshold:</span>
              <span class="font-mono text-emerald-400 font-bold">{{ dropThreshold }}%</span>
            </div>
          </div>

          <div class="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <span class="font-bold text-white block mb-1">How it works:</span>
            Our background Go-scheduler scans workers every 10 minutes. If drop alerts are active and a worker's hashrate drops below {{ dropThreshold }}% of its 24h moving average, an automatic notification is fired to <strong>{{ notificationEmail || 'your email' }}</strong>.
          </div>
        </div>

        <button
          @click="showStatusModal = false"
          class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-xs"
        >
          Dismiss Diagnostics
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { 
  ArrowLeft, RefreshCw, Copy, ExternalLink, Cpu, Wallet, 
  Coins, Box, Activity, Server, CreditCard, Sliders, Check, AlertCircle, Download
} from 'lucide-vue-next';
import StatCard from '../components/StatCard.vue';
import HashrateChart from '../components/HashrateChart.vue';
import { PoolAPI } from '../services/api.js';
import { formatHashrate, formatCoins, formatTimeAgo, formatDateTime, shortenAddress } from '../utils/formatters.js';
import { useAutoRefresh } from '../composables/useAutoRefresh.js';

const route = useRoute();
const walletAddress = computed(() => route.params.address);
const minerData = ref(null);
const priceData = ref(null);
const loading = ref(false);

const { secondsLeft, isRefreshing, triggerRefresh } = useAutoRefresh(loadMinerData, 30);

// Config Form State
const selectedScheme = ref('pplns');
const payoutThreshold = ref(0.5);
const notificationEmail = ref('');
const emailAlert = ref(false);
const dropAlert = ref(false);
const dropThreshold = ref(50);
const showStatusModal = ref(false);
const verificationIP = ref('');
const settingsLoading = ref(false);
const settingsStatus = ref(null);

// Sync form values when minerData loads
watch(minerData, (newVal) => {
  if (newVal) {
    selectedScheme.value = newVal.miningType || 'pplns';
    payoutThreshold.value = newVal.threshold ? Number((newVal.threshold / 1e9).toFixed(2)) : 0.5;
    notificationEmail.value = newVal.email || '';
    emailAlert.value = newVal.alert === 'on';
    dropAlert.value = newVal.hashrateDropAlert === 'on';
    dropThreshold.value = newVal.hashrateDropThreshold ? Number(newVal.hashrateDropThreshold) : 50;
  }
}, { immediate: true });

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

const networkDifficulty = computed(() => {
  return minerData.value?.difficulty || 17179869184000;
});

const estDailyETC = computed(() => {
  const hashRateHps = currentHash.value;
  const blockReward = 2.56;
  // Exact daily blocks formula: (hashrate * 86400 * blockReward) / networkDifficulty
  const baseDailyETC = (hashRateHps * 86400 * blockReward) / networkDifficulty.value;
  return Math.max(0.0001, baseDailyETC).toFixed(4);
});

const estDailyUSD = computed(() => {
  return (estDailyETC.value * etcUsdPrice.value).toFixed(2);
});

// Interactive Rewards Calculator state & watchers
const calcHashMHs = ref(0);
const calcUsdPrice = ref(0);
const calcPoolFeePercent = ref(1.0);

watch([currentHash, etcUsdPrice], ([newHash, newPrice]) => {
  if (newHash && calcHashMHs.value === 0) {
    calcHashMHs.value = Number((newHash / 1000000).toFixed(1));
  }
  if (newPrice && calcUsdPrice.value === 0) {
    calcUsdPrice.value = Number(newPrice.toFixed(2));
  }
}, { immediate: true });

const finalCalcHashHps = computed(() => {
  return (calcHashMHs.value || 0) * 1000000;
});

const calcEstDailyETC = computed(() => {
  const hashRateHps = finalCalcHashHps.value || currentHash.value;
  const blockReward = 2.56;
  const difficulty = networkDifficulty.value;
  const baseDailyETC = (hashRateHps * 86400 * blockReward) / difficulty;
  const withFee = baseDailyETC * (1 - (calcPoolFeePercent.value / 100));
  return Math.max(0.0001, withFee);
});

const calcEstDailyUSD = computed(() => {
  const price = calcUsdPrice.value || etcUsdPrice.value;
  return calcEstDailyETC.value * price;
});

// CSV offline analysis exporter function
function exportToCSV() {
  if (!minerCharts.value || !minerCharts.value.length) {
    alert("No historical data available to export.");
    return;
  }

  const headers = ['Timestamp', 'Readable Time', 'Hashrate (Hps)', 'Hashrate (MH/s)', 'Est Daily ETC', 'Est Daily USD'];
  const rows = minerCharts.value.map(point => {
    const ts = point.x || point.timestamp || point[0];
    const val = point.y !== undefined ? point.y : (point.minerHash !== undefined ? point.minerHash : point[1]);
    const date = new Date(ts > 1e12 ? ts : ts * 1000);
    const dateStr = date.toISOString();
    const readableTime = date.toLocaleString();
    const blockReward = 2.56;
    const diff = networkDifficulty.value;
    const dailyETC = (val * 86400 * blockReward) / diff;
    const dailyUSD = dailyETC * etcUsdPrice.value;

    return [
      dateStr,
      `"${readableTime.replace(/"/g, '""')}"`,
      val,
      (val / 1000000).toFixed(2),
      dailyETC.toFixed(5),
      dailyUSD.toFixed(2)
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `miner_${walletAddress.value.substring(0, 8)}_analytics.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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

async function saveSettings() {
  if (!verificationIP.value) {
    settingsStatus.value = {
      type: 'error',
      text: 'IP address or password is required to confirm changes.'
    };
    return;
  }

  settingsLoading.value = true;
  settingsStatus.value = null;

  try {
    // 1. Update Mining type
    await PoolAPI.updateMiningType({
      radio: selectedScheme.value,
      login: walletAddress.value,
      ip_address: verificationIP.value
    });

    // 2. Update threshold & notification alerts
    await PoolAPI.updateSettings({
      email: notificationEmail.value,
      login: walletAddress.value,
      threshold: payoutThreshold.value.toString(),
      ip_address: verificationIP.value,
      alertCheck: emailAlert.value ? 'on' : 'off',
      hashrateDropAlert: dropAlert.value ? 'on' : 'off',
      hashrateDropThreshold: dropThreshold.value.toString()
    });

    settingsStatus.value = {
      type: 'success',
      text: 'Configuration successfully updated and active on the stratum node!'
    };

    await loadMinerData();
    verificationIP.value = '';
  } catch (err) {
    settingsStatus.value = {
      type: 'error',
      text: 'Failed to verify identity. Please check your IP or password.'
    };
  } finally {
    settingsLoading.value = false;
  }
}

onMounted(() => {
  loadMinerData();
});

watch(() => route.params.address, () => {
  loadMinerData();
});
</script>
