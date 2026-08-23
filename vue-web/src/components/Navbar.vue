<template>
  <header class="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3">
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              <div class="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,15 82,50 50,85 18,50" fill="none" stroke="currentColor" stroke-width="8"/>
                  <polygon points="50,28 72,50 50,72 28,50" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div>
              <span class="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ETC Pool
              </span>
              <span class="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
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
            :class="$route.path === item.path ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Quick Wallet Search & Connect CTA -->
        <div class="flex items-center space-x-3">
          <form @submit.prevent="handleSearch" class="relative hidden sm:block w-48 lg:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Miner address 0x..."
              class="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
            <Search class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </form>

          <router-link 
            to="/connect"
            class="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all shadow-md shadow-emerald-950/50"
          >
            <Zap class="w-3.5 h-3.5 fill-current" />
            <span>Start Mining</span>
          </router-link>

          <!-- Theme Switcher -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Toggle Theme"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-sky-500" />
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
          placeholder="Miner address 0x..."
          class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
        />
      </form>

      <!-- Mobile Theme Toggle row -->
      <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Color Mode</span>
        <button 
          @click="toggleTheme" 
          class="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
        >
          <Sun v-if="isDark" class="w-3.5 h-3.5 text-amber-400" />
          <Moon v-else class="w-3.5 h-3.5 text-sky-500" />
          <span>{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>
      </div>

      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        @click="mobileOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === item.path ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
      >
        {{ item.name }}
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Zap, Menu, X, Sun, Moon } from 'lucide-vue-next';

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
  { name: 'Dashboard', path: '/' },
  { name: 'Miners', path: '/miners' },
  { name: 'Blocks', path: '/blocks' },
  { name: 'Payments', path: '/payments' },
  { name: 'Calculator', path: '/calculator' },
  { name: 'Connect', path: '/connect' },
  { name: 'FAQ', path: '/faq' },
];

function handleSearch() {
  const query = searchQuery.value.trim();
  if (query) {
    mobileOpen.value = false;
    router.push(`/miner/${query}`);
  }
}
</script>
