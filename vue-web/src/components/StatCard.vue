<template>
  <div class="glass-card glass-card-hover rounded-xl p-5 relative overflow-hidden group shadow-sm transition-all duration-200">
    <!-- Glow corner -->
    <div class="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300 pointer-events-none"></div>

    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{{ title }}</span>
      <div v-if="icon" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors">
        <component :is="icon" class="w-4 h-4" />
      </div>
    </div>

    <div class="mt-3 flex items-baseline justify-between">
      <div class="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
        {{ value }}
      </div>
      <div v-if="subValue" class="text-xs text-slate-500 dark:text-slate-400 font-mono">
        {{ subValue }}
      </div>
    </div>

    <div v-if="badgeText || progress" class="mt-2.5 flex items-center justify-between text-xs">
      <span v-if="badgeText" :class="badgeClass" class="px-2 py-0.5 rounded-md font-medium text-[11px]">
        {{ badgeText }}
      </span>
      <span v-if="extraLabel" class="text-slate-400 dark:text-slate-500 text-[11px]">
        {{ extraLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subValue: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  badgeClass: { type: String, default: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  extraLabel: { type: String, default: '' },
  icon: { type: Object, default: null },
  progress: { type: Number, default: null }
});
</script>
