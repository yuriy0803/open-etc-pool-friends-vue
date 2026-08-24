<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
        <HelpCircle class="w-3.5 h-3.5" />
        <span>Knowledge Base</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Frequently Asked Questions
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Everything you need to know about ETCHASH mining, payouts, vardiff, and pool reward distributions.
      </p>
    </div>

    <!-- FAQ Accordion / Cards -->
    <div class="space-y-4">
      <div
        v-for="(item, idx) in faqs"
        :key="idx"
        class="glass-card rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm"
        @click="item.open = !item.open"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <span class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
              0{{ idx + 1 }}
            </span>
            <span>{{ item.q }}</span>
          </h3>
          <ChevronDown
            class="w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200"
            :class="{ 'rotate-180 text-emerald-600 dark:text-emerald-400': item.open }"
          />
        </div>
        <div v-if="item.open" class="mt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <p>{{ item.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { HelpCircle, ChevronDown } from 'lucide-vue-next';

const faqs = ref([
  {
    q: 'What payout scheme does the pool use?',
    a: 'We use the PPLNS (Pay Per Last N Shares) payout system with a 0.5% pool fee. PPLNS prevents pool hopping and provides the highest fair rewards to loyal and consistent miners.',
    open: true
  },
  {
    q: 'What is the minimum payout threshold and payment schedule?',
    a: 'The minimum payout threshold is 0.5 ETC. Automatic payment rounds are executed every 2 hours as soon as your mature balance exceeds 0.5 ETC. Transaction network fees are covered by the pool.',
    open: false
  },
  {
    q: 'Which algorithm does Ethereum Classic use?',
    a: 'Ethereum Classic operates on the ETCHASH algorithm (ECIP-1099). It allows GPUs with 3GB+ VRAM and specialized ETCHASH ASICs (such as Jasminer and Antminer E9) to mine efficiently.',
    open: false
  },
  {
    q: 'Why does my reported hashrate fluctuate compared to my miner software?',
    a: 'Pool hashrate is mathematically calculated from the number of valid shares submitted by your rig over time. Due to standard variance in finding cryptographic shares, the calculated hashrate will float slightly above or below your local hardware hashrate.',
    open: false
  },
  {
    q: 'Do I need to register an account with a password?',
    a: 'No! The pool is completely anonymous. You just use your ETC wallet address as your username when launching your miner. Your personal dashboard and stats will appear automatically.',
    open: false
  },
  {
    q: 'How long do blocks take to mature before payment distribution?',
    a: 'Newly found blocks require approximately 100 on-chain confirmations (about 20-25 minutes) to transition from "Immature" to "Matured" status, after which rewards are unlocked and credited to your unpaid balance.',
    open: false
  }
]);
</script>
