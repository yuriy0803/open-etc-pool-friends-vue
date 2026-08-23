<template>
  <footer class="border-t border-slate-800/80 bg-[#070a11] mt-20 text-slate-400 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand / Info -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <span class="text-emerald-400 font-bold text-xs">ETC</span>
            </div>
            <span class="font-bold text-white text-base">Ethereum Classic Mining Pool</span>
          </div>
          <p class="text-slate-400 text-xs leading-relaxed max-w-md">
            High performance, low latency, PPLNS Ethereum Classic mining pool with 0.5% fee, instant payout triggers, and real-time detailed telemetry.
          </p>
          <div class="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Stratum: stratum+tcp://pool:8008</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white text-xs font-semibold uppercase tracking-wider mb-3">Mining Resources</h4>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/connect" class="hover:text-emerald-400 transition-colors">Configuration Generator</router-link></li>
            <li><router-link to="/calculator" class="hover:text-emerald-400 transition-colors">Profitability Calculator</router-link></li>
            <li><router-link to="/blocks" class="hover:text-emerald-400 transition-colors">Recent Pool Blocks</router-link></li>
            <li><router-link to="/payments" class="hover:text-emerald-400 transition-colors">Payment Ledger</router-link></li>
            <li><router-link to="/faq" class="hover:text-emerald-400 transition-colors">Troubleshooting & FAQ</router-link></li>
          </ul>
        </div>

        <!-- External & Network -->
        <div>
          <h4 class="text-white text-xs font-semibold uppercase tracking-wider mb-3">Ecosystem & Explorers</h4>
          <ul class="space-y-2 text-xs">
            <li>
              <a href="https://ethereumclassic.org/" target="_blank" rel="noopener" class="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                <span>Ethereum Classic Org</span>
              </a>
            </li>
            <li>
              <a href="https://etc.blockscout.com/" target="_blank" rel="noopener" class="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                <span>Blockscout Explorer</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/ethereumclassic" target="_blank" rel="noopener" class="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                <span>Core Github</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-slate-800/60 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 Ethereum Classic Pool Node. All systems operational.</p>
        <div class="flex items-center space-x-4 mt-4 sm:mt-0">
          <span>Fee: 0.5% PPLNS</span>
          <span>•</span>
          <span>Payout: 0.5 ETC Min</span>
        </div>
      </div>
    </div>
  </footer>
</template>
