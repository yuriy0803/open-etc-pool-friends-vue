import { ref, onMounted, onUnmounted } from 'vue';

export function useAutoRefresh(callback, intervalSeconds = 30) {
  const secondsLeft = ref(intervalSeconds);
  const isRefreshing = ref(false);
  let timer = null;

  const triggerRefresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    try {
      await callback();
    } catch (err) {
      console.warn('Auto-refresh error:', err);
    } finally {
      isRefreshing.value = false;
      secondsLeft.value = intervalSeconds;
    }
  };

  onMounted(() => {
    timer = setInterval(() => {
      secondsLeft.value--;
      if (secondsLeft.value <= 0) {
        triggerRefresh();
      }
    }, 1000);
  });

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return {
    secondsLeft,
    isRefreshing,
    triggerRefresh
  };
}
