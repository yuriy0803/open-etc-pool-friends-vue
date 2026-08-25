<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs transition-all select-none"
      title="Switch Language"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <Globe class="w-4 h-4 text-slate-500 dark:text-slate-400" />
      <span class="font-mono uppercase">{{ currentLocale }}</span>
      <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Custom Floating Dropdown Menu -->
    <div 
      v-if="isOpen"
      class="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in"
    >
      <button
        v-for="lang in availableLocales"
        :key="lang"
        @click="changeLang(lang)"
        class="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
        :class="currentLocale === lang ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5' : 'text-slate-700 dark:text-slate-300 font-medium'"
      >
        <span class="flex items-center space-x-2">
          <span>{{ getFlagEmoji(lang) }}</span>
          <span>{{ getLanguageName(lang) }}</span>
        </span>
        <Check v-if="currentLocale === lang" class="w-3.5 h-3.5 text-emerald-500" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Globe, ChevronDown, Check } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

const { currentLocale, setLocale, availableLocales } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref(null);

function changeLang(lang) {
  setLocale(lang);
  isOpen.value = false;
}

function getFlagEmoji(lang) {
  const flags = {
    en: '🇺🇸',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷'
  };
  return flags[lang] || '🌐';
}

function getLanguageName(lang) {
  const names = {
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français'
  };
  return names[lang] || lang;
}

// Close dropdown if clicked outside
function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
