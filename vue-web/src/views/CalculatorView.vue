<template>
  <div class="space-y-8 max-w-5xl mx-auto px-4 py-4">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
        <Calculator class="w-3.5 h-3.5" />
        <span>Ethereum Classic Mining Calculator</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Mining Profitability Calculator
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Estimate your gross mining rewards, electricity overheads, and net profit based on live network difficulty.
      </p>
    </div>

    <!-- Refactored Calculator Component -->
    <MiningCalculator />

    <!-- Historical Price Trend Component -->
    <div class="pt-4">
      <EtcPriceChart minHeight="320px" />
    </div>
  </div>
</template>

<script setup>
import { Calculator } from 'lucide-vue-next';
import MiningCalculator from '../components/MiningCalculator.vue';
import EtcPriceChart from '../components/EtcPriceChart.vue';
</script>
