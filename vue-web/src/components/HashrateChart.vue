<template>
  <div 
    ref="containerRef" 
    class="w-full h-full min-h-[240px] relative select-none font-sans"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
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
      <g class="recharts-cartesian-grid" stroke="rgba(51, 65, 85, 0.15)" stroke-dasharray="3 3">
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
        stroke="rgba(51, 65, 85, 0.4)" 
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
      class="absolute z-30 pointer-events-none bg-slate-950/95 border border-slate-800/80 px-3 py-2.5 rounded-xl shadow-xl text-left flex flex-col space-y-1 min-w-[150px] backdrop-blur-sm transition-all duration-75"
      :style="{
        left: tooltipStyle.left,
        top: tooltipStyle.top,
        transform: 'translate(-50%, -110%)'
      }"
    >
      <div class="text-[10px] text-slate-400 font-mono font-medium">
        {{ hoveredPoint.timeLabel }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: color }"></span>
        <span class="text-xs font-bold text-white font-mono">
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { formatHashrate, formatDifficulty } from '../utils/formatters.js';

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
  
  return props.chartData.map(item => {
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
});

// Coordinate bounds
const valBounds = computed(() => {
  if (!parsedData.value.length) return { min: 0, max: 1 };
  const values = parsedData.value.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Add a 10% ceiling buffer and 10% floor buffer
  const diff = max - min || 1;
  const bufferMax = max + diff * 0.1;
  const bufferMin = Math.max(0, min - diff * 0.1);
  return { min: bufferMin, max: bufferMax };
});

// Plotting points
const points = computed(() => {
  if (!parsedData.value.length) return [];
  const N = parsedData.value.length;
  const bounds = valBounds.value;
  const range = bounds.max - bounds.min || 1;
  
  return parsedData.value.map((d, index) => {
    const x = paddingLeft.value + (N > 1 ? (index / (N - 1)) * chartWidth.value : chartWidth.value / 2);
    const y = paddingTop.value + chartHeight.value - ((d.value - bounds.min) / range) * chartHeight.value;
    return {
      x,
      y,
      rawValue: d.value,
      timeLabel: d.timeLabel,
      timestamp: d.timestamp
    };
  });
});

// Build smooth Recharts-style spline curves
const linePath = computed(() => {
  if (!points.value.length) return '';
  const pts = points.value;
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    
    // Smooth control points
    const cpX1 = p0.x + (p1.x - p0.x) / 3.5;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3.5;
    const cpY2 = p1.y;
    
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
});

// Filled area path under spline
const areaPath = computed(() => {
  if (!points.value.length) return '';
  const pts = points.value;
  const startX = pts[0].x;
  const endX = pts[pts.length - 1].x;
  const baseY = height.value - paddingBottom.value;
  
  return `${linePath.value} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
});

// Y-Axis Ticks (5 division marks)
const horizontalGridLines = computed(() => {
  const bounds = valBounds.value;
  const lines = [];
  const count = 5;
  for (let i = 0; i < count; i++) {
    const val = bounds.max - (i / (count - 1)) * (bounds.max - bounds.min);
    const y = paddingTop.value + (i / (count - 1)) * chartHeight.value;
    lines.push({ y, val });
  }
  return lines;
});

// X-Axis Ticks (5 evenly spread vertical markers)
const verticalGridLines = computed(() => {
  if (!points.value.length) return [];
  const pts = points.value;
  const lines = [];
  const count = Math.min(5, pts.length);
  if (count <= 1) return pts.map(p => ({ x: p.x, label: p.timeLabel }));
  
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (pts.length - 1));
    const p = pts[idx];
    if (p) {
      lines.push({ x: p.x, label: p.timeLabel });
    }
  }
  return lines;
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
