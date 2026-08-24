<template>
  <div class="space-y-8" id="pool-dashboard-container">
    <!-- Top Pool Header & Status Bar -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-[#0c121e] dark:to-[#090d16] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors duration-200">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <!-- Left side: Pool Branding & Status Tags -->
          <div class="space-y-3 max-w-3xl">
            <div class="flex flex-wrap items-center gap-2.5">
              <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                <span>ETC Mainnet Pool</span>
              </div>

              <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Stratum ETCHASH</span>
              </div>

              <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                <RefreshCw class="w-3 h-3 text-emerald-500 dark:text-emerald-400" :class="{ 'animate-spin': isRefreshing }" />
                <span>Auto-refresh in <strong class="text-slate-900 dark:text-white font-mono">{{ secondsLeft }}s</strong></span>
              </div>
            </div>

            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Live <span class="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">Mining Pool</span> Dashboard
            </h1>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Real-time telemetry and mining statistics fetched from the configured mining pool node. High-frequency updates with automated block tracking and hashrate analytics.
            </p>
          </div>

          <!-- Right side: Manual Refresh & Direct Actions -->
          <div class="flex flex-row lg:flex-col items-end sm:items-center lg:items-end justify-between lg:justify-center gap-3">
            <button
              @click="refreshData"
              :disabled="isRefreshing"
              id="dashboard-refresh-button"
              class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-emerald-500/40 text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
              title="Force immediate pool statistics reload"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
              <span>{{ isRefreshing ? 'Updating Stats...' : 'Refresh Telemetry' }}</span>
            </button>

            <div class="text-[11px] text-slate-500 font-mono text-right flex items-center space-x-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              <span>Proxy Active • Last: {{ lastUpdatedText }}</span>
            </div>
          </div>
        </div>

        <!-- Wallet Lookup Search Field inside Header -->
        <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Track Miner Hashrate & Payouts
          </label>
          <form @submit.prevent="lookupMiner" class="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div class="relative flex-1">
              <input
                v-model="walletInput"
                type="text"
                id="miner-address-input"
                placeholder="Enter Ethereum Classic Wallet Address (0x...)"
                class="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
              />
              <button 
                v-if="walletInput" 
                type="button" 
                @click="walletInput = ''" 
                class="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <button
              type="submit"
              id="miner-track-button"
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search class="w-4 h-4" />
              <span>Track Miner</span>
            </button>
          </form>

          <!-- Sample Quick Pick Miners -->
          <div v-if="dashboardData?.topMiners?.length" class="mt-3 flex items-center flex-wrap gap-2 text-xs text-slate-500">
            <span>Active pool miners:</span>
            <button
              v-for="miner in dashboardData.topMiners.slice(0, 3)"
              :key="miner.address"
              @click="selectMiner(miner.address)"
              class="font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline bg-slate-100 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/40 transition-colors cursor-pointer"
            >
              {{ shortenAddress(miner.address, 6, 4) }} ({{ miner.formattedHashrate }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error / Warning Banner if Upstream Failed -->
    <div v-if="dashboardData?.hasErrors" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <AlertTriangle class="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        <span>Warning: {{ dashboardData.failedCount }} upstream pool endpoint(s) did not respond. Displaying cached/fallback metrics.</span>
      </div>
      <button @click="refreshData" class="underline hover:text-slate-900 dark:hover:text-white font-semibold ml-4">Retry</button>
    </div>

    <!-- Key Statistics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="pool-stat-cards">
      <StatCard
        id="stat-card-hashrate"
        title="Pool Hashrate"
        :value="dashboardData?.pool?.formattedHashrate || '0.00 H/s'"
        :subValue="dashboardData?.pool?.networkShare ? `${dashboardData.pool.networkShare}% Net Share` : ''"
        badgeText="PPLNS"
        :icon="Cpu"
      />
      <StatCard
        id="stat-card-miners"
        title="Active Miners"
        :value="dashboardData?.pool?.minersTotal || 0"
        :subValue="`${dashboardData?.pool?.workersTotal || 0} Workers Online`"
        badgeText="Live"
        badgeClass="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
        :icon="Users"
      />
      <StatCard
        id="stat-card-price"
        title="ETC Market Price"
        :value="`$${Number(dashboardData?.market?.usdPrice || 28.45).toFixed(2)}`"
        :subValue="dashboardData?.market?.btcPrice ? `${Number(dashboardData.market.btcPrice).toFixed(6)} BTC` : ''"
        :badgeText="`${dashboardData?.market?.change24hBtc >= 0 ? '+' : ''}${Number(dashboardData?.market?.change24hBtc || 0).toFixed(2)}%`"
        :badgeClass="(dashboardData?.market?.change24hBtc || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
        :icon="Coins"
      />
      <StatCard
        id="stat-card-difficulty"
        title="Network Difficulty"
        :value="dashboardData?.network?.formattedDifficulty || '0'"
        :subValue="`Height #${dashboardData?.network?.height || 0}`"
        badgeText="ETCHASH"
        badgeClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
        :icon="Layers"
      />
    </div>

    <!-- Pool Performance & Luck Metric Ribbon -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-sm">
      <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase tracking-wider text-slate-500">Est. Block Time</span>
        <div class="text-sm font-bold text-slate-900 dark:text-white">{{ dashboardData?.pool?.estBlockFindTime || 'Calculating...' }}</div>
        <span class="text-[10px] text-slate-500 font-sans">at current pool hashrate</span>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase tracking-wider text-slate-500">Round Luck</span>
        <div class="text-sm font-bold flex items-center space-x-1.5" :class="luckColorClass">
          <span>{{ dashboardData?.pool?.roundLuck || 100 }}%</span>
          <span class="text-[10px] font-sans font-normal text-slate-500 dark:text-slate-400">({{ luckLabel }})</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
          <div class="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500" :style="{ width: `${Math.min(100, dashboardData?.pool?.roundLuck || 100)}%` }"></div>
        </div>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase tracking-wider text-slate-500">Matured Blocks</span>
        <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ dashboardData?.blocks?.maturedTotal || 0 }}</div>
        <span class="text-[10px] text-slate-500 font-sans">{{ dashboardData?.blocks?.immatureTotal || 0 }} immature validating</span>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase tracking-wider text-slate-500">Scheme & Fee</span>
        <div class="text-sm font-bold text-slate-900 dark:text-white">PPLNS (0.5%)</div>
        <span class="text-[10px] text-slate-500 font-sans">Min Payout 0.5 ETC</span>
      </div>
    </div>

    <!-- Charts & Network Insights -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- Hashrate History Chart (2 Cols) -->
      <div class="xl:col-span-2 glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm" id="pool-hashrate-chart-container">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pool Telemetry History</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuous telemetry sampling from pool API</p>
          </div>

          <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <button
              @click="activeChartTab = 'pool'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="activeChartTab === 'pool' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              Hashrate
            </button>
            <button
              @click="activeChartTab = 'workers'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="activeChartTab === 'workers' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              Workers
            </button>
            <button
              @click="activeChartTab = 'diff'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="activeChartTab === 'diff' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              Difficulty
            </button>
          </div>
        </div>

        <div class="h-[280px] w-full">
          <HashrateChart
            v-if="activeChartTab === 'pool'"
            :chartData="dashboardData?.pool?.poolCharts?.length ? dashboardData.pool.poolCharts : fallbackChartData"
            type="hashrate"
            label="Pool Hashrate"
            color="#10b981"
          />
          <HashrateChart
            v-else-if="activeChartTab === 'workers'"
            :chartData="dashboardData?.pool?.workerCharts || []"
            type="miners"
            label="Active Workers"
            color="#38bdf8"
          />
          <HashrateChart
            v-else
            :chartData="dashboardData?.pool?.netCharts || []"
            type="difficulty"
            label="Network Difficulty"
            color="#a855f7"
          />
        </div>
      </div>

      <!-- Network Difficulty Trend (1 Col) -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers class="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Network Difficulty Trend</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ethereum Classic ETCHASH network</p>
        </div>
        <div class="h-[180px] w-full my-4">
          <HashrateChart
            :chartData="dashboardData?.pool?.netCharts?.length ? dashboardData.pool.netCharts : fallbackChartData"
            type="difficulty"
            label="Network Difficulty"
            color="#a855f7"
          />
        </div>
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono">
          <div class="flex justify-between">
            <span>Current Diff:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ dashboardData?.network?.formattedDifficulty || '0' }}</span>
          </div>
          <div class="flex justify-between">
            <span>Node Name:</span>
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ dashboardData?.network?.nodeName || 'ETC Node' }}</span>
          </div>
        </div>
      </div>

      <!-- Stratum Ports & Quick Config (1 Col) -->
      <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
            <Server class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Stratum Endpoints</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Direct miner connection URLs</p>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div class="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Primary Stratum TCP</div>
            <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span class="truncate">stratum+tcp://pool:8008</span>
              <button @click="copyText('stratum+tcp://pool:8008')" class="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer" title="Copy TCP address">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80">
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SSL / TLS Stratum</div>
            <div class="flex items-center justify-between text-teal-600 dark:text-teal-400 font-semibold">
              <span class="truncate">stratum+ssl://pool:8443</span>
              <button @click="copyText('stratum+ssl://pool:8443')" class="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer" title="Copy SSL address">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1 text-slate-600 dark:text-slate-300">
            <div class="bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Payout Scheme</div>
              <div class="font-bold text-slate-900 dark:text-white mt-0.5">PPLNS (0.5% fee)</div>
            </div>
            <div class="bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div class="text-[10px] text-slate-500 uppercase">Min Payout</div>
              <div class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">0.5 ETC</div>
            </div>
          </div>
        </div>

        <router-link
          to="/connect"
          class="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500/40 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center space-x-2"
        >
          <Sliders class="w-3.5 h-3.5" />
          <span>Config Generator</span>
        </router-link>
      </div>
    </div>

    <!-- Top Pool Miners Leaderboard -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm" id="pool-top-miners">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Top Pool Miners</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Leading hashpower contributors currently connected</p>
        </div>
        <router-link to="/miners" class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center space-x-1">
          <span>View All Miners ({{ dashboardData?.pool?.minersTotal || 0 }})</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">#</th>
              <th class="py-3 px-3">Miner Wallet</th>
              <th class="py-3 px-3">Hashrate</th>
              <th class="py-3 px-3">Pool Share</th>
              <th class="py-3 px-3">Workers</th>
              <th class="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr v-for="(miner, idx) in dashboardData?.topMiners" :key="miner.address" class="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 font-bold text-slate-400 dark:text-slate-500">
                #{{ idx + 1 }}
              </td>
              <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                <router-link :to="`/miner/${miner.address}`" class="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
                  <span class="hidden sm:inline">{{ shortenAddress(miner.address, 10, 8) }}</span>
                  <span class="sm:hidden">{{ shortenAddress(miner.address, 6, 4) }}</span>
                </router-link>
              </td>
              <td class="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                {{ miner.formattedHashrate }}
              </td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">
                {{ miner.sharePercent }}%
              </td>
              <td class="py-3 px-3 text-slate-600 dark:text-slate-300">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                  {{ miner.workers }}
                </span>
              </td>
              <td class="py-3 px-3 text-right font-sans">
                <router-link
                  :to="`/miner/${miner.address}`"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700/60 transition-colors text-[11px]"
                >
                  <span>Stats</span>
                  <ArrowRight class="w-3 h-3" />
                </router-link>
              </td>
            </tr>
            <tr v-if="!dashboardData?.topMiners?.length">
              <td colspan="6" class="py-8 text-center text-slate-500 font-sans">
                Loading active miners from pool...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Blocks Preview Table -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm" id="pool-recent-blocks">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Box class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Recent Mined Blocks</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Latest Ethereum Classic blocks found by the pool</p>
        </div>
        <router-link to="/blocks" class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center space-x-1">
          <span>View All Blocks ({{ dashboardData?.blocks?.maturedTotal || 0 }})</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">Height</th>
              <th class="py-3 px-3">Block Hash</th>
              <th class="py-3 px-3">Reward</th>
              <th class="py-3 px-3">Difficulty</th>
              <th class="py-3 px-3">Time Found</th>
              <th class="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr v-for="block in dashboardData?.blocks?.recentMatured" :key="block.height" class="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">
                <a :href="`https://etc.blockscout.com/block/${block.height}`" target="_blank" rel="noopener" class="hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-slate-400 dark:decoration-slate-700">
                  #{{ block.height }}
                </a>
              </td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">
                <span class="hidden sm:inline">{{ shortenAddress(block.hash, 10, 8) }}</span>
                <span class="sm:hidden">{{ shortenAddress(block.hash, 6, 4) }}</span>
              </td>
              <td class="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                {{ formatCoins(block.reward || '2560000000000000000') }} ETC
              </td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400">
                {{ formatDifficulty(block.difficulty) }}
              </td>
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 font-sans">
                {{ formatTimeAgo(block.timestamp) }}
              </td>
              <td class="py-3 px-3 text-right font-sans">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Matured
                </span>
              </td>
            </tr>
            <tr v-if="!dashboardData?.blocks?.recentMatured?.length">
              <td colspan="6" class="py-8 text-center text-slate-500 font-sans">
                Loading recent blocks from pool...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Mining Estimator / Calculator Component Strip -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm" id="pool-quick-estimator">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calculator class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Instant Hashrate Profitability Estimator</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Calculate projected ETC rewards based on current difficulty and market price</p>
        </div>

        <div class="flex items-center space-x-2">
          <input
            v-model.number="calcHashrateInput"
            type="number"
            min="1"
            placeholder="100"
            class="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono w-28 focus:outline-none"
          />
          <select
            v-model="calcUnit"
            class="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
          >
            <option value="MH">MH/s</option>
            <option value="GH">GH/s</option>
            <option value="TH">TH/s</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div class="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <div class="text-[10px] text-slate-500 uppercase">Estimated 24h</div>
          <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ calculatedEstimate.dailyEtc }} ETC</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 font-sans">≈ ${{ calculatedEstimate.dailyUsd }} USD</div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <div class="text-[10px] text-slate-500 uppercase">Estimated 7 Days</div>
          <div class="text-base font-bold text-teal-600 dark:text-teal-400 mt-1">{{ calculatedEstimate.weeklyEtc }} ETC</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 font-sans">≈ ${{ calculatedEstimate.weeklyUsd }} USD</div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <div class="text-[10px] text-slate-500 uppercase">Estimated 30 Days</div>
          <div class="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">{{ calculatedEstimate.monthlyEtc }} ETC</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 font-sans">≈ ${{ calculatedEstimate.monthlyUsd }} USD</div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div class="text-[10px] text-slate-500 uppercase">Full Calculator</div>
          <router-link
            to="/calculator"
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center space-x-1 mt-2"
          >
            <span>Hardware & Power Costs</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Search, Cpu, Users, Coins, Layers, Activity, Server, Copy, 
  Sliders, Box, ArrowRight, RefreshCw, ShieldCheck, AlertTriangle, Calculator
} from 'lucide-vue-next';
import StatCard from './StatCard.vue';
import HashrateChart from './HashrateChart.vue';
import { PoolStatsService } from '../services/poolStatsService.js';
import { formatHashrate, formatDifficulty, formatCoins, formatTimeAgo, shortenAddress } from '../utils/formatters.js';
import { useToasts } from '../composables/useToasts.js';

const router = useRouter();
const { addToast } = useToasts();

// Dashboard Reactive State
const dashboardData = ref(null);
const isRefreshing = ref(false);
const secondsLeft = ref(30);
const lastUpdated = ref(Date.now());
const walletInput = ref('');
const activeChartTab = ref('pool');

// Calculator State
const calcHashrateInput = ref(250);
const calcUnit = ref('MH');

let autoRefreshTimer = null;
let countdownTimer = null;

const lastUpdatedText = computed(() => {
  const d = new Date(lastUpdated.value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const luckColorClass = computed(() => {
  const luck = dashboardData.value?.pool?.roundLuck || 100;
  if (luck <= 90) return 'text-emerald-400';
  if (luck <= 115) return 'text-teal-400';
  return 'text-amber-400';
});

const luckLabel = computed(() => {
  const luck = dashboardData.value?.pool?.roundLuck || 100;
  if (luck < 100) return 'Lucky';
  if (luck === 100) return 'Average';
  return 'Over-effort';
});

const fallbackChartData = computed(() => {
  const arr = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 24; i >= 0; i--) {
    arr.push({ x: now - i * 600, y: 480000000000 + Math.random() * 20000000000 });
  }
  return arr;
});

const calculatedEstimate = computed(() => {
  const multipliers = { H: 1, KH: 1e3, MH: 1e6, GH: 1e9, TH: 1e12 };
  const rawH = (calcHashrateInput.value || 0) * (multipliers[calcUnit.value] || 1e6);
  const diff = dashboardData.value?.network?.difficulty || 17179869184000;
  const price = dashboardData.value?.market?.usdPrice || 28.45;

  return PoolStatsService.calculateProfitability(rawH, diff, price);
});

function lookupMiner() {
  const addr = walletInput.value.trim();
  if (addr) {
    router.push(`/miner/${addr}`);
  }
}

function selectMiner(addr) {
  walletInput.value = addr;
  lookupMiner();
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    addToast(`Copied ${text} to clipboard`, 'info');
  }
}

async function refreshData() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;

  try {
    const data = await PoolStatsService.getDashboardData();
    dashboardData.value = data;
    lastUpdated.value = Date.now();
    secondsLeft.value = 30;

    if (data.hasErrors) {
      addToast(`API Notice: ${data.failedCount} endpoint(s) used cached values`, 'warning');
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    addToast('Failed to refresh mining pool statistics from daemon', 'error');
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  refreshData();

  countdownTimer = setInterval(() => {
    secondsLeft.value--;
    if (secondsLeft.value <= 0) {
      refreshData();
    }
  }, 1000);
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
});
</script>
