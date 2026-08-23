<template>
  <div class="space-y-8 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
        <Zap class="w-3.5 h-3.5 fill-current" />
        <span>Quick Connect & Setup</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Start Mining Ethereum Classic
      </h1>
      <p class="text-sm text-slate-400">
        Generate custom batch files, bash scripts, and command lines for your mining hardware in seconds.
      </p>
    </div>

    <!-- Stratum Server Endpoints -->
    <div class="glass-card rounded-2xl p-6 space-y-4">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <Globe class="w-4 h-4 text-emerald-400" />
        <span>Stratum Regional Endpoints</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-slate-300 font-sans font-bold">
            <span class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Europe (Primary)</span>
            </span>
            <span class="text-[10px] text-emerald-400 font-mono">15ms</span>
          </div>
          <div class="text-slate-400 text-[11px]">TCP Stratum:</div>
          <div class="text-white font-semibold flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span class="truncate">stratum+tcp://pool:8008</span>
            <button @click="copyText('stratum+tcp://pool:8008')" class="ml-2 text-slate-400 hover:text-white">
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-slate-300 font-sans font-bold">
            <span class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>North America (US)</span>
            </span>
            <span class="text-[10px] text-teal-400 font-mono">35ms</span>
          </div>
          <div class="text-slate-400 text-[11px]">TCP Stratum:</div>
          <div class="text-white font-semibold flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span class="truncate">stratum+tcp://us.pool:8008</span>
            <button @click="copyText('stratum+tcp://us.pool:8008')" class="ml-2 text-slate-400 hover:text-white">
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-slate-300 font-sans font-bold">
            <span class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Asia / Pacific</span>
            </span>
            <span class="text-[10px] text-indigo-400 font-mono">55ms</span>
          </div>
          <div class="text-slate-400 text-[11px]">TCP Stratum:</div>
          <div class="text-white font-semibold flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span class="truncate">stratum+tcp://asia.pool:8008</span>
            <button @click="copyText('stratum+tcp://asia.pool:8008')" class="ml-2 text-slate-400 hover:text-white">
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Config Generator -->
    <div class="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders class="w-5 h-5 text-emerald-400" />
            <span>Interactive Mining Configuration Generator</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Select your mining software and enter your wallet credentials</p>
        </div>
      </div>

      <!-- Generator Inputs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block font-semibold uppercase text-slate-400 mb-1.5 font-sans text-[11px]">Mining Software</label>
          <select
            v-model="selectedMiner"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-sans focus:outline-none"
          >
            <option value="t-rex">T-Rex Miner (NVIDIA)</option>
            <option value="teamredminer">TeamRedMiner (AMD)</option>
            <option value="lolminer">LolMiner (NVIDIA / AMD)</option>
            <option value="gminer">GMiner (NVIDIA / AMD)</option>
            <option value="rigel">Rigel Miner (NVIDIA)</option>
            <option value="phoenix">PhoenixMiner</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-400 mb-1.5 font-sans text-[11px]">Operating System</label>
          <select
            v-model="selectedOS"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-sans focus:outline-none"
          >
            <option value="windows">Windows (.bat)</option>
            <option value="linux">Linux (.sh)</option>
            <option value="hiveos">HiveOS Flightsheet</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-400 mb-1.5 font-sans text-[11px]">Worker Name</label>
          <input
            v-model="workerName"
            type="text"
            placeholder="rig01"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-400 mb-1.5 font-sans text-[11px]">Region Server</label>
          <select
            v-model="selectedRegion"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-sans focus:outline-none"
          >
            <option value="pool:8008">Europe (TCP 8008)</option>
            <option value="us.pool:8008">North America (TCP 8008)</option>
            <option value="asia.pool:8008">Asia (TCP 8008)</option>
            <option value="pool:8443">SSL Encrypted (8443)</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-semibold uppercase text-slate-400 mb-1.5 font-sans text-[11px]">Your ETC Payout Wallet Address</label>
        <input
          v-model="walletAddress"
          type="text"
          placeholder="0xFc9B271B1b03B60e5aD68CB89Bb1016b9eAc2baC"
          class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <!-- Generated Code Box -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase text-emerald-400 font-sans tracking-wider">
            Ready to copy configuration
          </span>
          <button
            @click="copyText(generatedCommand)"
            class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow"
          >
            <Copy class="w-3.5 h-3.5" />
            <span>{{ copied ? 'Copied!' : 'Copy Config' }}</span>
          </button>
        </div>

        <div class="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {{ generatedCommand }}
        </div>
      </div>
    </div>

    <!-- HiveOS Quick Setup Instructions -->
    <div class="glass-card rounded-2xl p-6 space-y-4">
      <h3 class="text-base font-bold text-white flex items-center space-x-2">
        <Server class="w-4 h-4 text-teal-400" />
        <span>HiveOS Flight Sheet Configuration</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase">Coin</div>
          <div class="font-bold text-white mt-1">ETC</div>
        </div>
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase">Wallet</div>
          <div class="font-bold text-white mt-1">Your ETC Wallet</div>
        </div>
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase">Pool</div>
          <div class="font-bold text-white mt-1">Configure in miner</div>
        </div>
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase">Pool Server URL</div>
          <div class="font-bold text-emerald-400 mt-1 font-mono">stratum+tcp://pool:8008</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Zap, Globe, Sliders, Server, Copy } from 'lucide-vue-next';

const selectedMiner = ref('t-rex');
const selectedOS = ref('windows');
const workerName = ref('rig01');
const selectedRegion = ref('pool:8008');
const walletAddress = ref('0xFc9B271B1b03B60e5aD68CB89Bb1016b9eAc2baC');
const copied = ref(false);

const generatedCommand = computed(() => {
  const wallet = walletAddress.value.trim() || '0xFc9B271B1b03B60e5aD68CB89Bb1016b9eAc2baC';
  const worker = workerName.value.trim() || 'rig01';
  const server = selectedRegion.value;
  const isSsl = server.includes('8443');
  const proto = isSsl ? 'stratum+ssl://' : 'stratum+tcp://';

  if (selectedOS.value === 'hiveos') {
    return `POOLS: ${proto}${server}
WALLET: ${wallet}
WORKER: %WORKER_NAME%
ALGO: etchash`;
  }

  if (selectedMiner.value === 't-rex') {
    if (selectedOS.value === 'windows') {
      return `t-rex.exe -a etchash -o ${proto}${server} -u ${wallet} -p x -w ${worker}\npause`;
    } else {
      return `./t-rex -a etchash -o ${proto}${server} -u ${wallet} -p x -w ${worker}`;
    }
  }

  if (selectedMiner.value === 'teamredminer') {
    if (selectedOS.value === 'windows') {
      return `teamredminer.exe -a etchash -o ${proto}${server} -u ${wallet}.${worker} -p x\npause`;
    } else {
      return `./teamredminer -a etchash -o ${proto}${server} -u ${wallet}.${worker} -p x`;
    }
  }

  if (selectedMiner.value === 'lolminer') {
    if (selectedOS.value === 'windows') {
      return `lolMiner.exe --algo ETCHASH --pool ${proto}${server} --user ${wallet}.${worker}\npause`;
    } else {
      return `./lolMiner --algo ETCHASH --pool ${proto}${server} --user ${wallet}.${worker}`;
    }
  }

  if (selectedMiner.value === 'gminer') {
    if (selectedOS.value === 'windows') {
      return `miner.exe --algo etchash --server ${server.split(':')[0]} --port ${server.split(':')[1]} --user ${wallet}.${worker}\npause`;
    } else {
      return `./miner --algo etchash --server ${server.split(':')[0]} --port ${server.split(':')[1]} --user ${wallet}.${worker}`;
    }
  }

  if (selectedMiner.value === 'rigel') {
    if (selectedOS.value === 'windows') {
      return `rigel.exe -a etchash -o ${proto}${server} -u ${wallet} -w ${worker}\npause`;
    } else {
      return `./rigel -a etchash -o ${proto}${server} -u ${wallet} -w ${worker}`;
    }
  }

  return `miner -a etchash -o ${proto}${server} -u ${wallet}.${worker} -p x`;
});

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>
