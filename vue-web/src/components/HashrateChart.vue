<template>
  <div class="w-full h-full min-h-[220px] relative">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { formatHashrate, formatDifficulty } from '../utils/formatters.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => []
  },
  type: {
    type: String,
    default: 'hashrate' // 'hashrate', 'difficulty', 'miners'
  },
  label: {
    type: String,
    default: 'Pool Hashrate'
  },
  color: {
    type: String,
    default: '#10b981' // emerald
  }
});

const canvasRef = ref(null);
let chartInstance = null;

function buildLabelsAndValues() {
  if (!props.chartData || !props.chartData.length) {
    return { labels: [], values: [] };
  }

  const labels = [];
  const values = [];

  props.chartData.forEach(item => {
    // Timestamp
    const ts = item.x || item.timestamp || item[0];
    const val = item.y !== undefined ? item.y : (item.minerHash !== undefined ? item.minerHash : item[1]);

    if (ts) {
      const date = new Date(ts > 1e12 ? ts : ts * 1000);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      labels.push('');
    }
    values.push(Number(val) || 0);
  });

  return { labels, values };
}

function initChart() {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const { labels, values } = buildLabelsAndValues();
  const ctx = canvasRef.value.getContext('2d');

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, `${props.color}40`);
  gradient.addColorStop(1, `${props.color}00`);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: props.label,
          data: values,
          borderColor: props.color,
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: props.color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          tension: 0.35,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#090d16',
          titleColor: '#94a3b8',
          bodyColor: '#ffffff',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function (context) {
              const val = context.parsed.y;
              if (props.type === 'hashrate') {
                return `${props.label}: ${formatHashrate(val)}`;
              } else if (props.type === 'difficulty') {
                return `${props.label}: ${formatDifficulty(val)}`;
              }
              return `${props.label}: ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.2)',
            drawBorder: false,
          },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: 'JetBrains Mono' },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7
          }
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.2)',
            drawBorder: false,
          },
          ticks: {
            color: '#64748b',
            font: { size: 10, family: 'JetBrains Mono' },
            callback: function (val) {
              if (props.type === 'hashrate') {
                return formatHashrate(val);
              } else if (props.type === 'difficulty') {
                return formatDifficulty(val);
              }
              return val;
            }
          }
        }
      }
    }
  });
}

onMounted(() => {
  initChart();
});

watch(() => props.chartData, () => {
  initChart();
}, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
