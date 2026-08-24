<template>
  <div class="space-y-8">
    <!-- Primary Mining Pool Dashboard Component -->
    <PoolDashboard />

    <!-- Miner Payout & Transaction Tracker Section -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm" id="miner-payout-tracker">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CreditCard class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Miner Payout & Transaction History</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fetch and inspect on-chain payout transactions for any ETC miner wallet</p>
        </div>

        <!-- Quick search form -->
        <div class="flex items-center space-x-2">
          <input
            v-model="payoutTrackerAddress"
            type="text"
            placeholder="Enter ETC wallet (0x...)"
            class="bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono w-full sm:w-80 focus:outline-none transition-colors"
            @keyup.enter="fetchTrackerPayouts"
          />
          <button
            @click="fetchTrackerPayouts"
            :disabled="trackerLoading"
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw v-if="trackerLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ trackerLoading ? 'Fetching...' : 'Track Payouts' }}</span>
          </button>
        </div>
      </div>

      <!-- Result Error Message -->
      <div v-if="trackerError" class="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
        {{ trackerError }}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3 px-3">Time</th>
              <th class="py-3 px-3">Amount</th>
              <th class="py-3 px-3">Transaction Hash</th>
              <th class="py-3 px-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            <tr v-for="p in trackerPayouts" :key="p.tx" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-3 text-slate-500 dark:text-slate-400 font-sans">
                {{ formatDateTime(p.timestamp) }}
              </td>
              <td class="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCoins(p.amount) }} ETC
              </td>
              <td class="py-3 px-3 text-slate-800 dark:text-slate-300">
                <span class="hidden sm:inline">{{ shortenAddress(p.tx, 14, 10) }}</span>
                <span class="sm:hidden">{{ shortenAddress(p.tx, 8, 4) }}</span>
              </td>
              <td class="py-3 px-3 text-right font-sans">
                <a
                  :href="`https://etc.blockscout.com/tx/${p.tx}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700/60 transition-colors"
                >
                  <span>Blockscout</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr v-if="!trackerPayouts.length">
              <td colspan="4" class="py-12 text-center text-slate-500 font-sans">
                {{ trackerAddressEntered ? 'No payout transactions found for this wallet address.' : 'Enter a miner wallet address above to retrieve recent payout ledger logs.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CreditCard, RefreshCw, ExternalLink } from 'lucide-vue-next';
import PoolDashboard from '../components/PoolDashboard.vue';
import { PoolStatsService } from '../services/poolStatsService.js';
import { formatCoins, shortenAddress, formatDateTime } from '../utils/formatters.js';
import { useToasts } from '../composables/useToasts.js';

const { addToast } = useToasts();

// Miner Payout Tracker State
const payoutTrackerAddress = ref('');
const trackerPayouts = ref([]);
const trackerLoading = ref(false);
const trackerError = ref('');
const trackerAddressEntered = ref(false);

async function fetchTrackerPayouts() {
  const addr = payoutTrackerAddress.value.trim();
  if (!addr) {
    trackerError.value = 'Please enter a valid miner address.';
    addToast('Please enter a valid miner address', 'warning');
    return;
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    trackerError.value = 'Invalid Ethereum wallet address format (should start with 0x and be 42 characters).';
    addToast('Invalid wallet address format', 'error');
    return;
  }

  trackerLoading.value = true;
  trackerError.value = '';
  trackerAddressEntered.value = true;
  trackerPayouts.value = [];

  try {
    const data = await PoolStatsService.getMinerAccount(addr);
    if (data && data.payments) {
      trackerPayouts.value = data.payments;
      localStorage.setItem('etc_pool_tracker_wallet', addr);
      addToast(`Successfully retrieved ${data.payments.length} payouts for ${shortenAddress(addr, 6, 4)}`, 'success');
    } else {
      trackerPayouts.value = [];
    }
  } catch (err) {
    trackerError.value = 'Failed to load payout details. Please ensure the wallet is active and registered on the pool.';
    addToast('API Error: Failed to fetch payout transactions from pool node', 'error');
  } finally {
    trackerLoading.value = false;
  }
}

onMounted(() => {
  const savedTrackerWallet = localStorage.getItem('etc_pool_tracker_wallet');
  if (savedTrackerWallet) {
    payoutTrackerAddress.value = savedTrackerWallet;
    fetchTrackerPayouts();
  }
});
</script>
