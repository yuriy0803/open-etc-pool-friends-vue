<template>
  <div 
    ref="containerRef" 
    class="w-full h-full relative select-none font-sans flex flex-col justify-between"
    :style="{ minHeight: minHeight }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @touchmove="handleTouchMove"
    @touchend="handleMouseLeave"
  >
    <!-- Top Controls & Real-Time Stats Bar -->
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 z-10">
      <!-- D3 Computed Live Metric Badges -->
      <div class="flex items-center flex-wrap gap-2 text-[10px] font-mono">
        <div class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <span class="text-slate-500">Current:</span>
          <strong class="text-slate-900 dark:text-white" :style="{ color: color }">{{ formatYValue(summaryStats.current) }}</strong>
        </div>
        <div class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <span class="text-slate-500">Avg:</span>
          <strong class="text-slate-900 dark:text-white">{{ formatYValue(summaryStats.avg) }}</strong>
        </div>
        <div class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <span class="text-slate-500">Peak:</span>
          <strong class="text-emerald-600 dark:text-emerald-400">{{ formatYValue(summaryStats.max) }}</strong>
        </div>
      </div>

      <!-- Controls: Y-Axis Baseline & Timeframe Switchers -->
      <div class="flex items-center space-x-2">
        <!-- Y-Axis Mode -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-[10px] font-mono shadow-xs">
          <button 
            @click="localZeroBaseline = false"
            class="px-2 py-0.5 rounded transition-all font-bold text-[9px] cursor-pointer"
            :class="!localZeroBaseline ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            title="Auto-scale Y-axis to data range"
          >
            Auto
          </button>
          <button 
            @click="localZeroBaseline = true"
            class="px-2 py-0.5 rounded transition-all font-bold text-[9px] cursor-pointer"
            :class="localZeroBaseline ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            title="Baseline from 0"
          >
            0-Base
          </button>
        </div>

        <!-- Timeframe Switcher -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-[10px] font-mono shadow-xs">
          <button 
            v-for="tf in ['24h', '7d', '30d']" 
            :key="tf"
            @click="selectedTimeframe = tf"
            class="px-2 py-0.5 rounded transition-all uppercase font-bold cursor-pointer"
            :class="selectedTimeframe === tf ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ tf }}
          </button>
        </div>
      </div>
    </div>

    <!-- Fallback if no data -->
    <div v-if="!parsedData.length" class="flex-1 min-h-[200px] flex items-center justify-center text-xs text-slate-400 font-mono">
      <span>No historical telemetry samples available</span>
    </div>

    <!-- D3 Interactive SVG Canvas -->
    <div v-else class="relative flex-1 w-full min-h-[210px] overflow-visible">
      <svg 
        :width="width" 
        :height="svgHeight" 
        class="w-full h-full overflow-visible"
      >
        <defs>
          <!-- D3 Gradient for smooth Area under curve -->
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.35" />
            <stop offset="60%" :stop-color="color" stop-opacity="0.08" />
            <stop offset="100%" :stop-color="color" stop-opacity="0.0" />
          </linearGradient>

          <!-- Glow Filter -->
          <filter :id="glowFilterId" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Background Cartesian Grid (D3 Ticks) -->
        <g class="d3-grid" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3">
          <!-- Horizontal grid lines -->
          <line 
            v-for="(gridY, index) in horizontalGridLines" 
            :key="'h-' + index"
            :x1="paddingLeft"
            :y1="gridY.y"
            :x2="width - paddingRight"
            :y2="gridY.y"
            class="text-slate-500 dark:text-slate-400"
          />
          <!-- Vertical grid lines -->
          <line 
            v-for="(gridX, index) in verticalGridLines" 
            :key="'v-' + index"
            :x1="gridX.x"
            :y1="paddingTop"
            :x2="gridX.x"
            :y2="svgHeight - paddingBottom"
            class="text-slate-500 dark:text-slate-400"
          />
        </g>

        <!-- Average Benchmark Horizontal Line -->
        <g v-if="yScale && summaryStats.avg">
          <line
            :x1="paddingLeft"
            :y1="yScale(summaryStats.avg)"
            :x2="width - paddingRight"
            :y2="yScale(summaryStats.avg)"
            stroke="#10b981"
            stroke-dasharray="4 4"
            stroke-opacity="0.4"
            stroke-width="1.2"
          />
        </g>

        <!-- X-Axis base line -->
        <line 
          :x1="paddingLeft" 
          :y1="svgHeight - paddingBottom" 
          :x2="width - paddingRight" 
          :y2="svgHeight - paddingBottom" 
          stroke="currentColor" 
          stroke-opacity="0.15"
          stroke-width="1"
          class="text-slate-600 dark:text-slate-400"
        />

        <!-- Y-Axis labels (D3 formatted values) -->
        <g class="d3-y-axis-labels" font-size="9.5" font-family="JetBrains Mono, monospace" text-anchor="end">
          <text 
            v-for="(gridY, index) in horizontalGridLines" 
            :key="'lbl-y-' + index"
            :x="paddingLeft - 8"
            :y="gridY.y + 3.5"
            class="fill-slate-500 dark:fill-slate-400 font-medium"
          >
            {{ formatYValue(gridY.val) }}
          </text>
        </g>

        <!-- X-Axis labels (D3 time ticks) -->
        <g class="d3-x-axis-labels" font-size="9.5" font-family="JetBrains Mono, monospace" text-anchor="middle">
          <text 
            v-for="(gridX, index) in verticalGridLines" 
            :key="'lbl-x-' + index"
            :x="gridX.x"
            :y="svgHeight - paddingBottom + 16"
            class="fill-slate-500 dark:fill-slate-400 font-medium"
          >
            {{ gridX.label }}
          </text>
        </g>

        <!-- D3 Area Gradient Path -->
        <path 
          v-if="areaPath"
          :d="areaPath" 
          :fill="`url(#${gradientId})`" 
          stroke="none"
        />

        <!-- D3 Main Spline Curve -->
        <path 
          v-if="linePath"
          :d="linePath" 
          fill="none" 
          :stroke="color" 
          stroke-width="2.5" 
          stroke-linecap="round"
          stroke-linejoin="round"
          :filter="`url(#${glowFilterId})`"
        />

        <!-- Active Crosshair Lines on Hover -->
        <g v-if="hoveredPoint">
          <!-- Vertical crosshair -->
          <line 
            :x1="hoveredPoint.x" 
            :y1="paddingTop" 
            :x2="hoveredPoint.x" 
            :y2="svgHeight - paddingBottom" 
            stroke="currentColor" 
            stroke-opacity="0.35" 
            stroke-width="1.2" 
            stroke-dasharray="2 2"
            class="text-slate-400 dark:text-slate-300"
          />
          <!-- Horizontal crosshair to Y-axis -->
          <line 
            :x1="paddingLeft" 
            :y1="hoveredPoint.y" 
            :x2="hoveredPoint.x" 
            :y2="hoveredPoint.y" 
            stroke="currentColor" 
            stroke-opacity="0.25" 
            stroke-width="1" 
            stroke-dasharray="2 2"
            class="text-slate-400 dark:text-slate-300"
          />
        </g>

        <!-- Active Hover Pulsating Indicator Dot -->
        <g v-if="hoveredPoint">
          <circle 
            :cx="hoveredPoint.x" 
            :cy="hoveredPoint.y" 
            r="10" 
            :fill="color" 
            fill-opacity="0.2" 
            class="animate-ping"
          />
          <circle 
            :cx="hoveredPoint.x" 
            :cy="hoveredPoint.y" 
            r="6" 
            :fill="color" 
            fill-opacity="0.4" 
          />
          <circle 
            :cx="hoveredPoint.x" 
            :cy="hoveredPoint.y" 
            r="3.5" 
            :fill="color" 
            stroke="#ffffff" 
            stroke-width="1.5" 
          />
        </g>
      </svg>

      <!-- Interactive Floating HTML Tooltip -->
      <div 
        v-if="hoveredPoint" 
        class="absolute z-30 pointer-events-none bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 px-3 py-2.5 rounded-xl shadow-xl text-left flex flex-col space-y-1 min-w-[160px] backdrop-blur-md transition-all duration-75"
        :style="tooltipStyle"
      >
        <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium border-b border-slate-100 dark:border-slate-800 pb-1">
          <span>{{ hoveredPoint.fullDateLabel }}</span>
          <span class="text-[9px] font-bold uppercase text-slate-400">{{ selectedTimeframe }}</span>
        </div>

        <div class="flex items-center space-x-2 pt-0.5">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: color }"></span>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-900 dark:text-white font-mono">
              {{ formatYValue(hoveredPoint.rawValue) }}
            </span>
            <span class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
              {{ label }}
            </span>
          </div>
        </div>

        <!-- Delta relative to timeframe average -->
        <div v-if="summaryStats.avg > 0" class="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
          <span>vs Average:</span>
          <span 
            :class="hoveredPoint.rawValue >= summaryStats.avg ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
            class="font-bold"
          >
            {{ hoveredPoint.rawValue >= summaryStats.avg ? '+' : '' }}{{ (((hoveredPoint.rawValue - summaryStats.avg) / summaryStats.avg) * 100).toFixed(1) }}%
          </span>
        </div>
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
  },
  minHeight: {
    type: String,
    default: '160px'
  }
});

const emit = defineEmits(['timeframeChange']);
const selectedTimeframe = ref('24h');
const localZeroBaseline = ref(false);

watch(selectedTimeframe, (newVal) => {
  emit('timeframeChange', newVal);
});

// Unique ID for SVG definitions to avoid collisions
const randId = Math.floor(Math.random() * 100000);
const gradientId = computed(() => `d3-grad-${props.type}-${randId}`);
const glowFilterId = computed(() => `d3-glow-${props.type}-${randId}`);

// Dimensions & Responsive Resize handling
const containerRef = ref(null);
const width = ref(300);
const svgHeight = ref(210);
const paddingLeft = ref(85);
const paddingRight = ref(20);
const paddingTop = ref(15);
const paddingBottom = ref(26);

let resizeObserver = null;

const parsedData = computed(() => {
  if (!props.chartData || !props.chartData.length) return [];
  
  const mapped = props.chartData.map(item => {
    const rawTs = item.x !== undefined ? item.x : (item.timestamp !== undefined ? item.timestamp : item[0]);
    const val = item.y !== undefined ? item.y : (item.minerHash !== undefined ? item.minerHash : item[1]);
    
    // Normalize to seconds
    const ts = rawTs > 1e11 ? Math.floor(rawTs / 1000) : rawTs;
    const date = new Date(ts * 1000);
    
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + timeLabel;
    
    return {
      timestamp: ts || 0,
      date,
      timeLabel,
      fullDateLabel,
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

// D3 Summary Statistics (Min, Max, Avg, Current)
const summaryStats = computed(() => {
  if (!parsedData.value.length) {
    return { min: 0, max: 0, avg: 0, current: 0 };
  }
  const values = parsedData.value.map(d => d.value);
  const min = d3.min(values) || 0;
  const max = d3.max(values) || 0;
  const avg = d3.mean(values) || 0;
  const current = values[values.length - 1] || 0;

  return { min, max, avg, current };
});

// D3 X-Scale (Time Scale)
const xScale = computed(() => {
  if (!parsedData.value.length) return null;
  const [minTs, maxTs] = d3.extent(parsedData.value, d => d.timestamp);
  
  return d3.scaleLinear()
    .domain([minTs, maxTs || minTs + 1])
    .range([paddingLeft.value, width.value - paddingRight.value]);
});

// D3 Y-Scale (Linear Scale with buffer or zero baseline)
const yScale = computed(() => {
  if (!parsedData.value.length) return null;
  const values = parsedData.value.map(d => d.value);
  const minVal = d3.min(values) || 0;
  const maxVal = d3.max(values) || 1;
  const diff = maxVal - minVal || maxVal * 0.1 || 1;
  
  const domainMin = localZeroBaseline.value ? 0 : Math.max(0, minVal - diff * 0.08);
  const domainMax = maxVal + diff * 0.08;
  
  return d3.scaleLinear()
    .domain([domainMin, domainMax])
    .range([svgHeight.value - paddingBottom.value, paddingTop.value]);
});

// Plot points with D3 coordinates
const points = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return [];
  return parsedData.value.map(d => ({
    x: xScale.value(d.timestamp),
    y: yScale.value(d.value),
    rawValue: d.value,
    timeLabel: d.timeLabel,
    fullDateLabel: d.fullDateLabel,
    timestamp: d.timestamp
  }));
});

// D3 Spline Curve Generator (d3.curveMonotoneX)
const linePath = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return '';
  const lineGen = d3.line()
    .x(d => xScale.value(d.timestamp))
    .y(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX);
  return lineGen(parsedData.value);
});

// D3 Area Generator (d3.curveMonotoneX)
const areaPath = computed(() => {
  if (!parsedData.value.length || !xScale.value || !yScale.value) return '';
  const areaGen = d3.area()
    .x(d => xScale.value(d.timestamp))
    .y0(svgHeight.value - paddingBottom.value)
    .y1(d => yScale.value(d.value))
    .curve(d3.curveMonotoneX);
  return areaGen(parsedData.value);
});

// D3 Y-Axis Ticks (5 division marks)
const horizontalGridLines = computed(() => {
  if (!yScale.value) return [];
  const ticks = yScale.value.ticks(5);
  return ticks.map(val => ({
    y: yScale.value(val),
    val
  }));
});

// D3 X-Axis Ticks
const verticalGridLines = computed(() => {
  if (!xScale.value || !parsedData.value.length) return [];
  const count = width.value < 400 ? 3 : 5;
  const ticks = xScale.value.ticks(count);
  return ticks.map(val => {
    const date = new Date(val * 1000);
    const label = selectedTimeframe.value === '24h' 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
    return {
      x: xScale.value(val),
      label
    };
  });
});

function formatYValue(val) {
  const isMobile = width.value < 480;
  if (props.type === 'hashrate') {
    return formatHashrate(val, isMobile ? 1 : 2);
  } else if (props.type === 'difficulty') {
    return formatDifficulty(val, isMobile ? 1 : 2);
  }
  return Math.round(val).toLocaleString();
}

// Mouse Scrubbing with D3 Bisector
const hoveredIndex = ref(null);

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !points.value[hoveredIndex.value]) return null;
  return points.value[hoveredIndex.value];
});

const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return { left: '0px', top: '0px', transform: 'translate(-50%, -105%)' };
  
  let leftPos = hoveredPoint.value.x;
  // Keep horizontally within bounds
  if (leftPos < 90) leftPos = 90;
  if (leftPos > width.value - 90) leftPos = width.value - 90;

  const y = hoveredPoint.value.y;
  // If the point is high up (less than 100px from the top), render the tooltip below the point to prevent clipping
  const showBelow = y < 100;

  return {
    left: `${leftPos}px`,
    top: `${y}px`,
    transform: showBelow ? 'translate(-50%, 15px)' : 'translate(-50%, calc(-100% - 12px))'
  };
});

// D3 Bisector for finding nearest data point on hover
const bisectDate = d3.bisector(d => d.timestamp).center;

function handleMouseMove(e) {
  if (!parsedData.value.length || !xScale.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  // Inverse scale to find approximate timestamp
  const hoveredTs = xScale.value.invert(mouseX);
  const idx = bisectDate(parsedData.value, hoveredTs);
  hoveredIndex.value = Math.max(0, Math.min(parsedData.value.length - 1, idx));
}

function handleTouchMove(e) {
  if (!e.touches || !e.touches[0] || !parsedData.value.length || !xScale.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = e.touches[0].clientX - rect.left;
  const hoveredTs = xScale.value.invert(mouseX);
  const idx = bisectDate(parsedData.value, hoveredTs);
  hoveredIndex.value = Math.max(0, Math.min(parsedData.value.length - 1, idx));
}

function handleMouseLeave() {
  hoveredIndex.value = null;
}

function updateDimensions() {
  if (containerRef.value) {
    const w = containerRef.value.clientWidth || 300;
    width.value = w;
    
    // Dynamically adjust padding to maximize graph render area on smaller mobile screens
    if (w < 480) {
      paddingLeft.value = 56;
      paddingRight.value = 10;
    } else {
      paddingLeft.value = 85;
      paddingRight.value = 20;
    }
    
    const clientH = containerRef.value.clientHeight || 280;
    svgHeight.value = Math.max(100, clientH - 45); // Account for top controls bar
  }
}

onMounted(() => {
  updateDimensions();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!containerRef.value) return;
        updateDimensions();
      });
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
.d3-grid line {
  transition: all 0.2s ease;
}
</style>
