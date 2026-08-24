<template>
  <div 
    ref="containerRef" 
    class="w-full h-full min-h-[260px] relative select-none font-sans pt-12"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Y-Scale Mode Selection Overlay -->
    <div class="absolute top-2 left-2 z-10 flex items-center bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 p-0.5 rounded-lg text-[10px] font-mono shadow-sm">
      <span class="text-slate-500 px-1.5 font-bold uppercase">Y-Axis:</span>
      <button 
        @click="localZeroBaseline = false"
        class="px-2 py-0.5 rounded transition-all font-bold text-[9px] cursor-pointer"
        :class="!localZeroBaseline ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        title="Dynamic auto-scaling based on peak and low hashrate performance"
      >
        Peak Auto
      </button>
      <button 
        @click="localZeroBaseline = true"
        class="px-2 py-0.5 rounded transition-all font-bold text-[9px] cursor-pointer"
        :class="localZeroBaseline ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        title="Compare from absolute zero hashrate baseline"
      >
        0-Baseline
      </button>
    </div>

    <!-- Timeframe Selection Overlay -->
    <div class="absolute top-2 right-2 z-10 flex items-center bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 p-0.5 rounded-lg text-[10px] font-mono shadow-sm">
      <button 
        v-for="tf in ['24h', '7d', '30d']" 
        :key="tf"
        @click="selectedTimeframe = tf"
        class="px-2.5 py-1 rounded transition-all uppercase font-bold cursor-pointer"
        :class="selectedTimeframe === tf ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        {{ tf }}
      </button>
    </div>

    <!-- Fallback if no data -->
    <div v-if="!chartData || !chartData.length" class="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
      No chart data available
    </div>

    <!-- Recharts SVG Canvas -->
    <svg 
      v-else 
      :width="width" 
      :height="height" 
      class="overflow-visible"
    >
      <defs>
        <!-- Recharts Area Gradient -->
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" :stop-color="color" stop-opacity="0.3" />
          <stop offset="95%" :stop-color="color" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Cartesian Grid (Horizontal & Vertical) -->
      <g class="recharts-cartesian-grid" stroke="rgba(100, 116, 139, 0.2)" stroke-dasharray="3 3">
        <!-- Horizontal grid lines -->
        <line 
          v-for="(gridY, index) in horizontalGridLines" 
          :key="'h-' + index"
          :x1="paddingLeft"
          :y1="gridY.y"
          :x2="width - paddingRight"
          :y2="gridY.y"
        />
        <!-- Vertical grid lines -->
        <line 
          v-for="(gridX, index) in verticalGridLines" 
          :key="'v-' + index"
          :x1="gridX.x"
          :y1="paddingTop"
          :x2="gridX.x"
          :y2="height - paddingBottom"
        />
      </g>

      <!-- X-Axis line -->
      <line 
        :x1="paddingLeft" 
        :y1="height - paddingBottom" 
        :x2="width - paddingRight" 
        :y2="height - paddingBottom" 
        stroke="rgba(100, 116, 139, 0.3)" 
        stroke-width="1"
      />

      <!-- Y-Axis labels -->
      <g class="recharts-y-axis-labels" fill="#64748b" font-size="10" font-family="JetBrains Mono" text-anchor="end">
        <text 
          v-for="(gridY, index) in horizontalGridLines" 
          :key="'lbl-y-' + index"
          :x="paddingLeft - 8"
          :y="gridY.y + 3.5"
        >
          {{ formatYValue(gridY.val) }}
        </text>
      </g>

      <!-- X-Axis labels -->
      <g class="recharts-x-axis-labels" fill="#64748b" font-size="10" font-family="JetBrains Mono" text-anchor="middle">
        <text 
          v-for="(gridX, index) in verticalGridLines" 
          :key="'lbl-x-' + index"
          :x="gridX.x"
          :y="height - paddingBottom + 16"
        >
          {{ gridX.label }}
        </text>
      </g>

      <!-- Area Path (Filled Gradient underneath) -->
      <path 
        :d="areaPath" 
        :fill="`url(#${gradientId})`" 
        stroke="none"
      />

      <!-- Monotone Curve Line -->
      <path 
        :d="linePath" 
        fill="none" 
        :stroke="color" 
        stroke-width="2.5" 
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Active Cursor Vertical Line (On Hover) -->
      <line 
        v-if="hoveredPoint" 
        :x1="hoveredPoint.x" 
        :y1="paddingTop" 
        :x2="hoveredPoint.x" 
        :y2="height - paddingBottom" 
        stroke="rgba(148, 163, 184, 0.3)" 
        stroke-width="1" 
        stroke-dasharray="3 3"
      />

      <!-- Active Glow Dot (On Hover) -->
      <g v-if="hoveredPoint">
        <circle 
          :cx="hoveredPoint.x" 
          :cy="hoveredPoint.y" 
          r="8" 
          :fill="color" 
          fill-opacity="0.2" 
        />
        <circle 
          :cx="hoveredPoint.x" 
          :cy="hoveredPoint.y" 
          r="4.5" 
          :fill="color" 
          stroke="#ffffff" 
          stroke-width="1.5" 
        />
      </g>
    </svg>

    <!-- Floating Recharts HTML Tooltip -->
    <div 
      v-if="hoveredPoint" 
      class="absolute z-30 pointer-events-none bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800/80 px-3 py-2.5 rounded-xl shadow-xl text-left flex flex-col space-y-1 min-w-[150px] backdrop-blur-sm transition-all duration-75"
      :style="{
        left: tooltipStyle.left,
        top: tooltipStyle.top,
        transform: 'translate(-50%, -110%)'
      }"
    >
      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
        {{ hoveredPoint.timeLabel }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: color }"></span>
        <span class="text-xs font-bold text-slate-900 dark:text-white font-mono">
          {{ formatYValue(hoveredPoint.rawValue) }}
        </span>
      </div>
      <div class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { formatHashrate, formatDifficulty } from '../utils/formatters.js';
import * as d3 from 'd3';

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

const emit = defineEmits(['timeframeChange']);
const selectedTimeframe = ref('24h');
const localZeroBaseline = ref(false);

// Watch selectedTimeframe to bubble up changes
watch(selectedTimeframe, (newVal) => {
  emit('timeframeChange', newVal);
});

// Random ID for gradient to support multiple charts
const gradientId = computed(() => `recharts-grad-${props.type}-${Math.floor(Math.random() * 10000)}`);

// Dimensions & Resize handling
const containerRef = ref(null);
const width = ref(300);
const height = ref(240);
const paddingLeft = ref(65);
const paddingRight = ref(20);
const paddingTop = ref(15);
const paddingBottom = ref(30);

let resizeObserver = null;

const chartWidth = computed(() => Math.max(10, width.value - paddingLeft.value - paddingRight.value));
const chartHeight = computed(() => Math.max(10, height.value - paddingTop.value - paddingBottom.value));

const parsedData = computed(() => {
  if (!props.chartData || !props.chartData.length) return [];
  
  const mapped = props.chartData.map(item => {
    const ts = item.x || item.timestamp || item[0];
    const val = item.y !== undefined ? item.y : (item.minerHash !== undefined ? item.minerHash : item[1]);
    
    let timeLabel = '';
    if (ts) {
      const date = new Date(ts > 1e12 ? ts : ts * 1000);
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return {
      timestamp: ts || 0,
      timeLabel,
      value: Number(val) || 0
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

  if (mapped.length === 0) return [];

  // Filter based on selected timeframe relative to the latest data timestamp
  const latestTs = mapped[mapped.length - 1].timestamp;
  if (selectedTimeframe.value === '24h') {
    const threshold = latestTs - 24 * 3600;
    return mapped.filter(d => d.timestamp >= threshold);
  } else if (selectedTimeframe.value === '7d') {
    const threshold = latestTs - 7 * 24 * 3600;
    return mapped.filter(d => d.timestamp >= threshold);
  }
  return mapped; // 30d
});

// D3 X & Y scale computation
const xScale = computed(() => {
  if (!parsedData.value.length) return null;
  const timestamps = parsedData.value.map(d => d.timestamp);
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  
  return d3.scaleLinear()
    .domain([minTs, maxTs])
    .range([paddingLeft.value, width.value - paddingRight.value]);
});

const yScale = computed(() => {
  if (!parsedData.value.length) return null;
  const values = parsedData.value.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const diff = maxVal - minVal || 1;
  
  const bufferMin = localZeroBaseline.value ? 0 : Math.max(0, minVal - diff * 0.1);
  const bufferMax = maxVal + diff * 0.1;
  
  return d3.scaleLinear()
    .domain([bufferMin, bufferMax])
    .range([height.value - paddingBottom.value, paddingTop.value]);
});

// Plotting points
const points = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return [];
  return parsedData.value.map(d => {
    return {
      x: xScale.value(d.timestamp),
      y: yScale.value(d.value),
      rawValue: d.value,
      timeLabel: d.timeLabel,
      timestamp: d.timestamp
    };
  });
});

// Build smooth Recharts-style spline curves using d3 curveMonotoneX
const linePath = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return '';
  const lineGenerator = d3.line()
    .x(d => xScale.value(d.timestamp))
    .y(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX);
  return lineGenerator(parsedData.value);
});

// Filled area path under spline using d3 curveMonotoneX
const areaPath = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return '';
  const areaGenerator = d3.area()
    .x(d => xScale.value(d.timestamp))
    .y0(height.value - paddingBottom.value)
    .y1(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX);
  return areaGenerator(parsedData.value);
});

// Y-Axis Ticks (5 division marks)
const horizontalGridLines = computed(() => {
  if (!yScale.value) return [];
  const ticks = yScale.value.ticks(5);
  return ticks.map(val => ({
    y: yScale.value(val),
    val
  }));
});

// X-Axis Ticks (5 evenly spread vertical markers)
const verticalGridLines = computed(() => {
  if (!xScale.value || !parsedData.value.length) return [];
  const ticks = xScale.value.ticks(5);
  return ticks.map(val => {
    const date = new Date(val > 1e12 ? val : val * 1000);
    const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      x: xScale.value(val),
      label
    };
  });
});

// Formatter mapping
function formatYValue(val) {
  if (props.type === 'hashrate') {
    return formatHashrate(val);
  } else if (props.type === 'difficulty') {
    return formatDifficulty(val);
  }
  return Math.round(val).toLocaleString();
}

// Mouse tracking & Snapping
const hoveredIndex = ref(null);
const tooltipX = ref(0);
const tooltipY = ref(0);

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !points.value[hoveredIndex.value]) return null;
  return points.value[hoveredIndex.value];
});

const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return { left: '0px', top: '0px' };
  
  // Make sure the tooltip stays inside container bounds
  let leftPos = hoveredPoint.value.x;
  if (leftPos < 80) leftPos = 80;
  if (leftPos > width.value - 80) leftPos = width.value - 80;

  return {
    left: `${leftPos}px`,
    top: `${hoveredPoint.value.y - 12}px`
  };
});

function handleMouseMove(e) {
  if (!points.value.length || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  // Find closest point by x coordinate
  let closestIdx = 0;
  let minDiff = Infinity;
  
  points.value.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  
  hoveredIndex.value = closestIdx;
}

function handleMouseLeave() {
  hoveredIndex.value = null;
}

// Setup resize observer
function updateDimensions() {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth || 300;
    height.value = containerRef.value.clientHeight || 240;
  }
}

onMounted(() => {
  updateDimensions();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
  }
});
</script>

<style scoped>
.recharts-cartesian-grid line {
  transition: stroke-dasharray 0.3s ease;
}
</style>
