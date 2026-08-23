<template>
  <div class="fixed top-20 right-4 z-[9999] pointer-events-none flex flex-col gap-2 max-w-sm w-full">
    <transition-group name="toast" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300"
        :class="getToastClasses(toast.type)"
      >
        <!-- Icon -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-400" />
          <Info v-else class="w-5 h-5 text-sky-400" />
        </div>

        <!-- Content -->
        <div class="flex-1 text-xs font-medium leading-relaxed">
          {{ toast.message }}
        </div>

        <!-- Close Button -->
        <button
          @click="removeToast(toast.id)"
          class="shrink-0 text-slate-400 hover:text-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToasts } from '../composables/useToasts.js';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, removeToast } = useToasts();

function getToastClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100';
    case 'error':
      return 'bg-rose-950/90 border-rose-500/30 text-rose-100';
    case 'warning':
      return 'bg-amber-950/90 border-amber-500/30 text-amber-100';
    case 'info':
    default:
      return 'bg-slate-900/90 border-slate-700 text-slate-100';
  }
}
</script>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
.toast-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.toast-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
</style>
