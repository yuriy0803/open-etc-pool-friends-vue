<template>
  <header class="sticky top-0 z-50 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3">
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              <div class="w-full h-full bg-white dark:bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,15 82,50 50,85 18,50" fill="none" stroke="currentColor" stroke-width="8"/>
                  <polygon points="50,28 72,50 50,72 28,50" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div>
              <span class="text-lg font-extrabold tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-400 dark:bg-clip-text dark:text-transparent">
                ETC Pool
              </span>
              <span class="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                ETCHASH
              </span>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <router-link 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === item.path ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'"
          >
            {{ t(item.key) }}
          </router-link>
        </nav>

        <!-- Quick Wallet Search & Connect CTA -->
        <div class="flex items-center space-x-2.5 sm:space-x-3">
          <form @submit.prevent="handleSearch" class="relative hidden sm:block w-44 lg:w-60">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('minerAddressPlaceholder')"
              class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
          </form>

          <router-link 
            to="/connect"
            class="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all shadow-md shadow-emerald-950/20"
          >
            <Zap class="w-3.5 h-3.5 fill-current" />
            <span>{{ t('startMining') }}</span>
          </router-link>

          <!-- Language Selector -->
          <LanguageToggle />

          <!-- Hashrate Alert Notification Bell -->
          <button 
            @click="isModalOpen = true" 
            id="navbar-alert-bell-button"
            class="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Hashrate Alert & Incident Settings"
            aria-label="Hashrate Benachrichtigungen"
          >
            <BellRing v-if="unreadCount > 0" class="w-4 h-4 text-rose-500 animate-bounce" />
            <Bell v-else class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            
            <span 
              v-if="unreadCount > 0" 
              class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center animate-pulse"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Theme Switcher Button -->
          <button 
            @click="toggleTheme" 
            id="theme-toggle-button"
            class="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            :title="isDark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln'"
            aria-label="Theme umschalten"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            <Moon v-else class="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
          </button>

          <!-- Mobile Hamburger -->
          <button 
            @click="mobileOpen = !mobileOpen"
            class="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800"
          >
            <Menu v-if="!mobileOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div v-if="mobileOpen" class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] px-4 pt-3 pb-5 space-y-2">
      <form @submit.prevent="handleSearch" class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('minerAddressPlaceholder')"
          class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
        />
      </form>

      <!-- Mobile Theme Toggle row -->
      <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ t('colorMode') }}</span>
        <button 
          @click="toggleTheme" 
          class="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
        >
          <Sun v-if="isDark" class="w-3.5 h-3.5 text-amber-400" />
          <Moon v-else class="w-3.5 h-3.5 text-sky-500" />
          <span>{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>
      </div>

      <!-- Mobile Language Toggle row -->
      <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Language</span>
        <LanguageToggle />
      </div>

      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        @click="mobileOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === item.path ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
      >
        {{ t(item.key) }}
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Zap, Menu, X, Sun, Moon, Bell, BellRing } from 'lucide-vue-next';
import { useHashrateAlerts } from '../composables/useHashrateAlerts.js';
import LanguageToggle from './LanguageToggle.vue';
import { useI18n } from '../composables/useI18n.js';

const { unreadCount, isModalOpen } = useHashrateAlerts();
const { t } = useI18n();

const router = useRouter();
const searchQuery = ref('');
const mobileOpen = ref(false);
const isDark = ref(true);

onMounted(() => {
  isDark.value = localStorage.getItem('etc_theme') !== 'light';
});

function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('etc_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('etc_theme', 'light');
  }
}

const navItems = [
  { name: 'Dashboard', key: 'poolStats', path: '/' },
  { name: 'Miners', key: 'miners', path: '/miners' },
  { name: 'Blocks', key: 'blocks', path: '/blocks' },
  { name: 'Calculator', key: 'calculator', path: '/calculator' },
  { name: 'Connect', key: 'connect', path: '/connect' }
];

function handleSearch() {
  const query = searchQuery.value.trim();
  if (query) {
    mobileOpen.value = false;
    router.push(`/miner/${query}`);
  }
}
</script>
