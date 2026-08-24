<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Pool Payout Ledger</h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Immutable record of automatic reward distributions</p>
      </div>

      <div class="flex items-center space-x-3">
        <div class="relative w-full sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search wallet / TX hash..."
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>
    </div>

    <!-- Payout Information Banner -->
    <div class="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-start space-x-3.5">
        <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <DollarSign class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Automated PPLNS Payments</h3>
          <p class="text-xs text-slate-400 mt-0.5 max-w-xl">
            Payouts run automatically every 2 hours for all miners with a confirmed balance of at least <strong>0.5 ETC</strong>. Pool fee is strictly 0.5% with zero transaction deduction.
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-4 text-xs font-mono text-slate-300">
        <div class="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
          <div class="text-[10px] text-slate-500 uppercase">Min Threshold</div>
          <div class="font-bold text-emerald-400">0.50 ETC</div>
        </div>
        <div class="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
          <div class="text-[10px] text-slate-500 uppercase">Payout Cycle</div>
          <div class="font-bold text-white">Every 120 Min</div>
        </div>
      </div>
    </div>

    <!-- Payments Table Header / Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Payout History Ledger</span>
      </h3>
      <button
        @click="exportToCSV"
        :disabled="!filteredPayments.length"
        class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Export Ledger to CSV</span>
      </button>
    </div>

    <!-- Payments Table -->
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-sans text-[11px] uppercase tracking-wider">
              <th class="py-3.5 px-4">Timestamp</th>
              <th class="py-3.5 px-4">Payee Address</th>
              <th class="py-3.5 px-4">Amount</th>
              <th class="py-3.5 px-4">Transaction Hash</th>
              <th class="py-3.5 px-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-slate-300">
            <tr
              v-for="payment in filteredPayments"
              :key="payment.tx"
              class="hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-3.5 px-4 text-slate-400 font-sans">
                {{ formatDateTime(payment.timestamp) }}
              </td>
              <td class="py-3.5 px-4">
                <router-link
                  :to="`/miner/${payment.address}`"
                  class="font-mono text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                >
                  <span class="hidden md:inline">{{ shortenAddress(payment.address, 10, 8) }}</span>
                  <span class="md:hidden">{{ shortenAddress(payment.address, 6, 4) }}</span>
                </router-link>
              </td>
              <td class="py-3.5 px-4 font-bold text-white">
                {{ formatCoins(payment.amount) }} ETC
              </td>
              <td class="py-3.5 px-4 text-slate-400">
                <span class="hidden md:inline">{{ shortenAddress(payment.tx, 14, 10) }}</span>
                <span class="md:hidden">{{ shortenAddress(payment.tx, 8, 4) }}</span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <a
                  :href="`https://etc.blockscout.com/tx/${payment.tx}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 font-sans text-xs transition-colors"
                >
                  <span>Blockscout</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </td>
            </tr>
            <tr v-if="!filteredPayments.length">
              <td colspan="5" class="py-12 text-center text-slate-500 font-sans">
                No payments found matching your filter.
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
import { Search, DollarSign, ExternalLink, Download } from 'lucide-vue-next';
import { PoolAPI } from '../services/api.js';
import { formatCoins, formatDateTime, shortenAddress } from '../utils/formatters.js';

const paymentsData = ref(null);
const searchQuery = ref('');

function exportToCSV() {
  const data = filteredPayments.value;
  if (!data || !data.length) return;

  const headers = ['Time Paid', 'Miner Address', 'Amount (ETC)', 'Transaction Hash'];
  const rows = data.map(p => [
    new Date(p.timestamp * 1000).toISOString(),
    p.address,
    (Number(p.amount) / 1e9).toFixed(6), // Since formatCoins divides by 1e9
    p.tx
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'etc_pool_payout_ledger.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const paymentList = computed(() => {
  return paymentsData.value?.payments || [];
});

const filteredPayments = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return paymentList.value;
  return paymentList.value.filter(p => 
    (p.address && p.address.toLowerCase().includes(query)) ||
    (p.tx && p.tx.toLowerCase().includes(query))
  );
});

async function fetchPayments() {
  try {
    const data = await PoolAPI.getPayments();
    paymentsData.value = data;
  } catch (err) {
    console.error('Failed to load payments:', err);
  }
}

onMounted(() => {
  fetchPayments();
});
</script>
