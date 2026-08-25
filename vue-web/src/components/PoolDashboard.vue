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

          <!-- Right side: Manual Refresh & CSV Export Actions -->
          <div class="flex flex-col items-end gap-3">
            <div class="flex items-center flex-wrap gap-2">
              <button
                @click="isModalOpen = true"
                id="dashboard-hashrate-alert-button"
                class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-emerald-500/40 text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                title="Configure Hashrate Drop Alarms & Notifications"
              >
                <BellRing class="w-3.5 h-3.5" :class="unreadCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'" />
                <span>Alerts</span>
                <span v-if="unreadCount > 0" class="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white rounded-full font-mono font-bold">{{ unreadCount }}</span>
              </button>

              <button
                @click="exportCsv"
                :disabled="!dashboardData || isRefreshing"
                id="dashboard-export-csv-button"
                class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-emerald-500/40 text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export complete pool metrics, leaderboard, and history as CSV"
              >
                <Download class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV</span>
              </button>

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
            </div>

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
              <Info v-if="activeChartTab === 'info'" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <Activity v-else class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{{ activeChartTab === 'info' ? 'Pool Configuration & Specifications' : 'Pool Telemetry History' }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ activeChartTab === 'info' ? 'Stratum server endpoints, difficulty parameters, and hardware requirements' : 'Continuous telemetry sampling from pool API' }}
            </p>
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
            <button
              @click="activeChartTab = 'info'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              :class="activeChartTab === 'info' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
              id="dashboard-info-tab-button"
            >
              <Info class="w-3 h-3" />
              <span>Info & Config</span>
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
            minHeight="220px"
          />
          <HashrateChart
            v-else-if="activeChartTab === 'workers'"
            :chartData="dashboardData?.pool?.workerCharts || []"
            type="miners"
            label="Active Workers"
            color="#38bdf8"
            minHeight="220px"
          />
          <HashrateChart
            v-else-if="activeChartTab === 'diff'"
            :chartData="dashboardData?.pool?.netCharts || []"
            type="difficulty"
            label="Network Difficulty"
            color="#a855f7"
            minHeight="220px"
          />
          <!-- Info & Pool Configuration Tab Content -->
          <div
            v-else-if="activeChartTab === 'info'"
            class="h-full overflow-y-auto pr-1 space-y-3 font-sans text-xs custom-scrollbar"
            id="dashboard-pool-info-tab-content"
          >
            <!-- Stratum Ports Specification Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div class="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                  <span>Standard Stratum (TCP)</span>
                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">VarDiff 4G-32G</span>
                </div>
                <div class="flex items-center justify-between font-mono font-semibold text-slate-900 dark:text-white text-xs">
                  <span class="text-emerald-600 dark:text-emerald-400">stratum+tcp://pool:8008</span>
                  <button @click="copyText('stratum+tcp://pool:8008')" class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer" title="Copy URL">
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
                <div class="text-[10px] text-slate-500 mt-1">Recommended for GPU rigs & ASIC miners</div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div class="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                  <span>Encrypted Stratum (SSL/TLS)</span>
                  <span class="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono text-[9px]">TLS 1.2/1.3</span>
                </div>
                <div class="flex items-center justify-between font-mono font-semibold text-slate-900 dark:text-white text-xs">
                  <span class="text-teal-600 dark:text-teal-400">stratum+ssl://pool:8443</span>
                  <button @click="copyText('stratum+ssl://pool:8443')" class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer" title="Copy URL">
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
                <div class="text-[10px] text-slate-500 mt-1">Secure encrypted mining proxy traffic</div>
              </div>
            </div>

            <!-- Pool Requirements & Parameters Checklist -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div class="text-[11px] font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mining Requirements & Pool Rules</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div class="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div class="text-[9px] font-sans text-slate-500 uppercase">Algorithm</div>
                  <div class="font-bold text-slate-900 dark:text-white mt-0.5">ETCHASH (ETC)</div>
                </div>
                <div class="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div class="text-[9px] font-sans text-slate-500 uppercase">Payout System</div>
                  <div class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">PPLNS (0.5% Fee)</div>
                </div>
                <div class="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div class="text-[9px] font-sans text-slate-500 uppercase">Min Payout</div>
                  <div class="font-bold text-slate-900 dark:text-white mt-0.5">0.50 ETC</div>
                </div>
                <div class="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div class="text-[9px] font-sans text-slate-500 uppercase">Payout Interval</div>
                  <div class="font-bold text-slate-900 dark:text-white mt-0.5">Every 120 Min</div>
                </div>
              </div>
            </div>

            <!-- Hardware & DAG Prerequisites -->
            <div class="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-2">
              <HardDrive class="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong class="text-slate-900 dark:text-white">DAG & VRAM Requirement:</strong> ETCHASH DAG size is ~3.2 GB. Compatible with 4GB, 6GB, 8GB+ AMD/NVIDIA GPUs (e.g. GTX 1060 6GB, RX 570/580 4GB/8GB, RTX 30/40 series) & dedicated ASIC miners (Ipollo, Jasminer, Antminer E9).
              </div>
            </div>
          </div>
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
            minHeight="130px"
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
    </div>    <!-- Top Pool Miners Leaderboard & Estimated Earnings -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm" id="pool-top-miners">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Award class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Top Miners: Hashrate & Estimated Earnings</span>
                <span class="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">
                  ({{ dashboardData?.topMiners?.length || 0 }} active leaders)
                </span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Real-time hashpower and dynamically calculated reward forecasts (PPLNS) based on network difficulty
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2.5 self-start lg:self-auto">
          <!-- Timeframe Selector -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 text-xs font-semibold">
            <button
              @click="topMinersTimeframe = '24h'"
              id="top-miners-timeframe-24h"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              :class="topMinersTimeframe === '24h' ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              24h Earnings
            </button>
            <button
              @click="topMinersTimeframe = '30d'"
              id="top-miners-timeframe-30d"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              :class="topMinersTimeframe === '30d' ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              30 Days
            </button>
          </div>

          <!-- View All Link -->
          <router-link 
            to="/miners" 
            id="top-miners-view-all-link"
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          >
            <span>All Miners ({{ dashboardData?.pool?.minersTotal || 0 }})</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>

      <!-- Dedicated Wallet Address Search Bar directly above the Top-Miners Table -->
      <div class="bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 space-y-3" id="top-miners-search-bar-wrapper">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- Search Bar Input Box -->
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search class="w-4 h-4 text-emerald-500" />
            </div>
            <input
              v-model="topMinersSearch"
              @keydown.enter="handleTopMinersDirectLookup"
              type="text"
              id="top-miners-search-input"
              placeholder="Search miner wallet address (e.g. 0x... or partial address)..."
              class="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
            />
            <div class="absolute inset-y-0 right-0 pr-1.5 flex items-center space-x-1">
              <button
                v-if="topMinersSearch"
                @click="topMinersSearch = ''"
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear Search"
                id="clear-top-miners-search-btn"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <button
                @click="handleTopMinersDirectLookup"
                class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all cursor-pointer shadow-xs flex items-center space-x-1"
                title="Search / Open Miner Profile"
                id="submit-top-miners-search-btn"
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          <!-- Quick Filters & Limits -->
          <div class="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-2 text-xs">
            <span class="text-slate-500 dark:text-slate-400 text-[11px] font-sans flex items-center space-x-1">
              <Filter class="w-3 h-3" />
              <span>Show:</span>
            </span>
            <div class="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 font-mono text-[11px]">
              <button
                v-for="limit in [5, 10, 25, 'all']"
                :key="limit"
                @click="topMinersLimit = limit"
                :id="`top-miners-limit-${limit}`"
                class="px-2 py-0.5 rounded transition-all cursor-pointer"
                :class="topMinersLimit === limit ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
              >
                {{ limit === 'all' ? 'All' : limit }}
              </button>
            </div>
          </div>
        </div>

        <!-- Live Search Match & Direct Lookup Banner -->
        <div v-if="topMinersSearch" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div class="flex items-center space-x-2 font-sans">
            <span class="text-slate-500 dark:text-slate-400 text-[11px]">Filtered Results:</span>
            <span 
              class="px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border"
              :class="processedTopMiners.length > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'"
            >
              {{ processedTopMiners.length }} miners in table
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="handleTopMinersDirectLookup"
              class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer font-sans"
              id="top-miners-direct-profile-btn"
            >
              <span>View full wallet statistics for "{{ shortenAddress(topMinersSearch, 8, 6) }}"</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
        <table class="w-full text-left text-xs font-mono" id="top-miners-earnings-table">
          <thead>
            <tr class="bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3.5 text-center w-12">Rank</th>
              <th class="py-3 px-3.5">Miner Wallet</th>
              <th class="py-3 px-3.5">
                <button @click="topMinersSort = 'hashrate'" class="hover:text-emerald-500 cursor-pointer flex items-center space-x-1">
                  <span>Hashrate</span>
                  <span v-if="topMinersSort === 'hashrate'" class="text-emerald-500">▼</span>
                </button>
              </th>
              <th class="py-3 px-3.5">
                <button @click="topMinersSort = 'share'" class="hover:text-emerald-500 cursor-pointer flex items-center space-x-1">
                  <span>Pool Share</span>
                  <span v-if="topMinersSort === 'share'" class="text-emerald-500">▼</span>
                </button>
              </th>
              <th class="py-3 px-3.5">
                <button @click="topMinersSort = 'earnings'" class="hover:text-emerald-500 cursor-pointer flex items-center space-x-1">
                  <span>{{ topMinersTimeframe === '24h' ? 'Est. 24h Earnings' : 'Est. 30d Earnings' }}</span>
                  <span v-if="topMinersSort === 'earnings'" class="text-emerald-500">▼</span>
                </button>
              </th>
              <th class="py-3 px-3.5 text-center">
                <button @click="topMinersSort = 'workers'" class="hover:text-emerald-500 cursor-pointer inline-flex items-center space-x-1">
                  <span>Workers</span>
                  <span v-if="topMinersSort === 'workers'" class="text-emerald-500">▼</span>
                </button>
              </th>
              <th class="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-900/20">
            <tr 
              v-for="(miner, idx) in processedTopMiners" 
              :key="miner.address" 
              class="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <!-- Rank with Medals -->
              <td class="py-3.5 px-3.5 text-center">
                <span 
                  v-if="idx === 0" 
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs border border-amber-500/40 shadow-xs"
                  title="Rank 1 - Pool Hashrate Leader"
                >
                  🥇
                </span>
                <span 
                  v-else-if="idx === 1" 
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/30 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-400/40 shadow-xs"
                  title="Rank 2"
                >
                  🥈
                </span>
                <span 
                  v-else-if="idx === 2" 
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-300 font-bold text-xs border border-orange-500/40 shadow-xs"
                  title="Rank 3"
                >
                  🥉
                </span>
                <span v-else class="text-xs font-bold text-slate-400 dark:text-slate-500">
                  #{{ idx + 1 }}
                </span>
              </td>

              <!-- Wallet Address & Copy -->
              <td class="py-3.5 px-3.5 font-semibold text-slate-900 dark:text-white">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Online & Mining"></div>
                  <button
                    @click="openMinerModal(miner.address, miner)"
                    class="hover:text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 font-mono text-left cursor-pointer"
                    :title="`View quick stats for ${miner.address}`"
                  >
                    <span class="hidden sm:inline">{{ shortenAddress(miner.address, 10, 8) }}</span>
                    <span class="sm:hidden">{{ shortenAddress(miner.address, 6, 4) }}</span>
                  </button>
                  <button 
                    @click="copyText(miner.address)" 
                    class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition-opacity p-0.5 cursor-pointer"
                    title="Copy Address"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- Hashrate -->
              <td class="py-3.5 px-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                <div class="flex items-center space-x-1.5">
                  <Zap class="w-3.5 h-3.5 text-emerald-500" />
                  <span>{{ miner.formattedHashrate }}</span>
                </div>
              </td>

              <!-- Pool Share with mini visual bar -->
              <td class="py-3.5 px-3.5">
                <div class="flex items-center space-x-2">
                  <div class="w-14 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      class="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      :style="{ width: `${Math.min(100, Math.max(4, Number(miner.sharePercent || 0)))}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {{ miner.sharePercent }}%
                  </span>
                </div>
              </td>

              <!-- Estimated Earnings (24h vs 30d) -->
              <td class="py-3.5 px-3.5 font-mono">
                <div v-if="topMinersTimeframe === '24h'">
                  <div class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <span>+{{ (miner.estDailyEtc || 0).toFixed(4) }} ETC</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                    ≈ ${{ ((miner.estDailyUsd || 0)).toFixed(2) }} USD / Day
                  </div>
                </div>
                <div v-else>
                  <div class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <span>+{{ (miner.estMonthlyEtc || 0).toFixed(3) }} ETC</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                    ≈ ${{ ((miner.estMonthlyUsd || 0)).toFixed(2) }} USD / Month
                  </div>
                </div>
              </td>

              <!-- Active Workers count badge -->
              <td class="py-3.5 px-3.5 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  {{ miner.workers }} Rig{{ miner.workers > 1 ? 's' : '' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-3.5 text-right font-sans">
                <div class="flex items-center justify-end space-x-1.5">
                  <button
                    @click="setupDropAlertForMiner(miner.address)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
                    title="Setup hashrate drop alert for this miner"
                  >
                    <BellRing class="w-3.5 h-3.5" />
                  </button>

                  <router-link
                    :to="`/miner/${miner.address}`"
                    class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors text-[11px] font-semibold"
                    title="View full miner statistics"
                  >
                    <span>Details</span>
                    <ArrowRight class="w-3 h-3" />
                  </router-link>
                </div>
              </td>
            </tr>

            <tr v-if="!processedTopMiners.length">
              <td colspan="7" class="py-10 text-center text-slate-500 font-sans">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <Users class="w-6 h-6 text-slate-400 animate-pulse" />
                  <p class="text-xs">No active miners found matching the filter criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Summary Footer Info -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 gap-2 font-sans">
        <div class="flex items-center space-x-2">
          <Info class="w-3.5 h-3.5 text-emerald-500" />
          <span>Earnings estimates are based on PPLNS pool distribution & current ETC market price (${{ (dashboardData?.market?.usdPrice || 28.45).toFixed(2) }}).</span>
        </div>
        <div class="flex items-center space-x-3">
          <span>Showing Top {{ processedTopMiners.length }} Miners</span>
        </div>
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
  Sliders, Box, ArrowRight, RefreshCw, ShieldCheck, AlertTriangle, Calculator, Download,
  Info, CheckCircle, Zap, ExternalLink, Terminal, HardDrive, BellRing, Award, TrendingUp, DollarSign,
  Wallet, X, Filter
} from 'lucide-vue-next';
import StatCard from './StatCard.vue';
import HashrateChart from './HashrateChart.vue';
import { PoolStatsService } from '../services/poolStatsService.js';
import { formatHashrate, formatDifficulty, formatCoins, formatTimeAgo, shortenAddress } from '../utils/formatters.js';
import { exportPoolStatsToCsv } from '../utils/csvExport.js';
import { useToasts } from '../composables/useToasts.js';
import { useHashrateAlerts } from '../composables/useHashrateAlerts.js';
import { useMinerModal } from '../composables/useMinerModal.js';

const router = useRouter();
const { addToast } = useToasts();
const { isModalOpen, unreadCount, config } = useHashrateAlerts();
const { openMinerModal } = useMinerModal();

// Dashboard Reactive State
const dashboardData = ref(null);
const isRefreshing = ref(false);
const secondsLeft = ref(30);
const lastUpdated = ref(Date.now());
const walletInput = ref('');
const activeChartTab = ref('pool');

// Top Miners Table Filter & State
const topMinersTimeframe = ref('24h'); // '24h' | '30d'
const topMinersSearch = ref('');
const topMinersSort = ref('hashrate'); // 'hashrate' | 'earnings' | 'share' | 'workers'
const topMinersLimit = ref(10); // 5, 10, 25

const processedTopMiners = computed(() => {
  if (!dashboardData.value?.topMiners) return [];
  let list = [...dashboardData.value.topMiners];

  // Search filter
  if (topMinersSearch.value.trim()) {
    const q = topMinersSearch.value.trim().toLowerCase();
    list = list.filter(m => m.address.toLowerCase().includes(q));
  }

  // Sort
  list.sort((a, b) => {
    if (topMinersSort.value === 'earnings') {
      return (b.estDailyEtc || 0) - (a.estDailyEtc || 0);
    }
    if (topMinersSort.value === 'share') {
      return Number(b.sharePercent || 0) - Number(a.sharePercent || 0);
    }
    if (topMinersSort.value === 'workers') {
      return (b.workers || 0) - (a.workers || 0);
    }
    return (b.hashrate || 0) - (a.hashrate || 0);
  });

  if (topMinersLimit.value !== 'all') {
    list = list.slice(0, Number(topMinersLimit.value));
  }

  return list;
});

function setupDropAlertForMiner(address) {
  if (address) {
    config.value.monitoredWallet = address;
  }
  isModalOpen.value = true;
}

function handleTopMinersDirectLookup() {
  const query = (topMinersSearch.value || '').trim();
  if (!query) return;

  // If there is an exact or filtered match in top miners, or if it is a wallet string
  const exactMatch = processedTopMiners.value.find(m => m.address.toLowerCase() === query.toLowerCase());
  if (exactMatch) {
    router.push(`/miner/${exactMatch.address}`);
  } else if (processedTopMiners.value.length === 1) {
    router.push(`/miner/${processedTopMiners.value[0].address}`);
  } else {
    // Navigate directly to the searched wallet address stats
    router.push(`/miner/${query}`);
  }
}

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

function exportCsv() {
  if (!dashboardData.value) {
    addToast('No pool statistics data available to export', 'warning');
    return;
  }
  try {
    exportPoolStatsToCsv(dashboardData.value);
    addToast('Pool statistics exported successfully as CSV', 'success');
  } catch (err) {
    console.error('Failed to export CSV:', err);
    addToast('Failed to export CSV file', 'error');
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
