<template>
  <div class="vat-json-container">
    <!-- 直接渲染模式 -->
    <div v-if="displayType === 'direct'" class="vat-json-direct-wrapper">
      <!-- 直接渲染JSON -->
      <div v-if="renderType === 'json'" class="vat-json-direct-json">
        <div class="vat-json-direct-header">
          <span class="vat-json-direct-title">{{ title || 'JSON数据' }}</span>
          <div class="vat-json-actions">
            <n-button 
              v-if="showCopy" 
              size="tiny" 
              type="success" 
              secondary 
              circle 
              class="vat-json-copy-btn"
              @click.stop="copyJson"
            >
              <template #icon>
                <i class="ifont i-copy" title="复制"></i>
              </template>
            </n-button>
            <n-button 
              size="tiny" 
              type="primary" 
              secondary 
              circle 
              class="vat-json-format-btn"
              @click.stop="toggleFormat"
            >
              <template #icon>
                <i class="ifont" :class="[isFormatted ? 'i-compress' : 'i-format']" :title="isFormatted ? '压缩' : '格式化'"></i>
              </template>
            </n-button>
          </div>
        </div>
        <pre class="vat-json-direct-pre">{{ displayJson }}</pre>
      </div>
      
      <!-- 直接渲染表格 -->
      <div v-else class="vat-json-table-wrapper">
        <div v-if="showCopy" class="vat-json-direct-header">
          <span class="vat-json-direct-title">{{ title || '表格数据' }}</span>
          <n-button 
            size="tiny" 
            type="success" 
            secondary 
            circle 
            class="vat-json-copy-btn"
            @click.stop="copyJson"
          >
            <template #icon>
              <i class="ifont i-copy" title="复制"></i>
            </template>
          </n-button>
        </div>
        <n-data-table 
          :data="jsonData" 
          :columns="columns" 
          size="small" 
          :scroll-x="scrollX"
          :bordered="bordered"
          class="vat-json-table"
        />
      </div>
    </div>
    
    <!-- Popover模式 -->
    <n-popover 
      v-else 
      placement="top"
      :trigger="trigger"
      :show-arrow="true"
      :width="popoverWidth"
    >
      <template #trigger>
        <div class="vat-json-popover-trigger">
          <n-button 
            size="tiny" 
            type="info" 
            secondary 
            :bordered="false"
            :class="{
              'vat-json-popover-btn': true,
              'vat-json-popover-btn-simple': simple
            }"
          >
            <template #icon>
              <i class="ifont i-view"></i>
            </template>
            {{ triggerText }}
          </n-button>
        </div>
      </template>
      <div class="vat-json-popover-content">
        <div class="vat-json-popover-title">
            <span>{{ title || (renderType === 'json' ? 'JSON数据' : '表格数据') }}</span>
            <div class="vat-json-actions">
                <n-button 
                    v-if="showCopy" 
                    size="tiny" 
                    type="success" 
                    secondary 
                    circle 
                    class="vat-json-copy-btn"
                    @click.stop="copyJson"
                >
                    <template #icon>
                    <i class="ifont i-copy"></i>
                    </template>
                </n-button>
                <n-button 
                size="tiny" 
                type="primary" 
                secondary 
                circle 
                class="vat-json-format-btn"
                @click.stop="toggleFormat"
                v-if="renderType === 'json'"
                >
                    <template #icon>
                        <i class="ifont" :class="[isFormatted ? 'i-compress' : 'i-format']" :title="isFormatted ? '压缩' : '格式化'"></i>
                    </template>
                </n-button>
            </div>
        </div>
        
        <!-- Popover渲染JSON -->
        <div v-if="renderType === 'json'" class="vat-json-raw">
          <pre>{{ displayJson }}</pre>
        </div>
        
        <!-- Popover渲染表格 -->
        <div v-else class="vat-json-table-scroll">
          <n-data-table 
            :data="jsonData" 
            :columns="columns" 
            size="small" 
            :bordered="true"
            class="vat-json-table-popover"
          />
        </div>
      </div>
    </n-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, defineAsyncComponent, inject } from 'vue';
import { NPopover, NButton} from 'naive-ui';

// 处理递归引用
const VatJson = defineAsyncComponent(() => import('./VatJson.vue'));

interface Props {
  data: any;
  columns?: any[];
  renderType?: 'json' | 'table'; // 渲染方式：json数据 | table数据
  displayType?: 'direct' | 'popover'; // 展示方式：直接渲染 | popover渲染
  trigger?: 'hover' | 'click' | 'focus';
  title?: string;
  triggerText?: string;
  popoverWidth?: number;
  scrollX?: number;
  bordered?: boolean;
  simple?: boolean;
  showCopy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  renderType: 'table',
  displayType: 'direct',
  trigger: 'hover',
  title: '',
  triggerText: '查看数据',
  popoverWidth: 600,
  scrollX: 800,
  bordered: true,
  simple: false,
  showCopy: true
});
// 定义tools对象的类型
interface Tools {
  notice?: {
    message?: {
      success?: (msg: string) => void
    }
  }
}

const tools = inject<Tools>('tools', {})
const emit = defineEmits<{
  copy: [json: string];
}>();

// 状态管理
const isFormatted = ref(true);

// 格式化JSON数据
const formattedJson = computed(() => {
  if (typeof props.data === 'string') {
    try {
      return JSON.stringify(JSON.parse(props.data), null, 2);
    } catch {
      return props.data;
    }
  }
  return JSON.stringify(props.data, null, 2);
});

// 压缩JSON数据
const minifiedJson = computed(() => {
  if (typeof props.data === 'string') {
    try {
      return JSON.stringify(JSON.parse(props.data));
    } catch {
      return props.data;
    }
  }
  return JSON.stringify(props.data);
});

// 显示的JSON数据
const displayJson = computed(() => {
  return isFormatted.value ? formattedJson.value : minifiedJson.value;
});

// 切换格式化/压缩
const toggleFormat = () => {
  isFormatted.value = !isFormatted.value;
};

// 复制JSON数据 - 使用当前显示的JSON
const copyJson = () => {
  navigator.clipboard.writeText(displayJson.value).then(() => {
    // 安全调用，避免tools对象为空时出错
    if (tools?.notice?.message?.success) {
      tools.notice.message.success('复制成功');
    }
    emit('copy', displayJson.value);
  });
};

// 转换JSON数据为表格格式
const jsonData = computed(() => {
  let data = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
  
  // 处理null和undefined
  if (data === null || data === undefined) {
    return [{ value: data }];
  }
  
  // 如果已经有自定义列，直接返回数据
  if (props.columns.length > 0) {
    return Array.isArray(data) ? data : [data];
  }
  
  // 如果是数组，直接返回
  if (Array.isArray(data)) {
    return data;
  } 
  // 如果是对象且没有自定义列，转换为key-value格式
  else if (typeof data === 'object') {
    // 转换为 [{ key: 'a', value: 1 }, { key: 'b', value: 2 }] 格式
    const keyValueData = [];
    for (const [key, value] of Object.entries(data)) {
      keyValueData.push({ key, value });
    }
    return keyValueData;
  } 
  // 基本类型
  else {
    return [{ value: data }];
  }
});

// 自动生成列
const columns = computed(() => {
  // 如果有自定义列，直接使用
  if (props.columns.length > 0) {
    return props.columns;
  }
  
  // 检查数据是否是key-value格式（单个对象转换的）
  const firstItem = jsonData.value[0];
  if (!firstItem || typeof firstItem !== 'object') {
    return [{ title: '值', key: 'value', ellipsis: true }];
  }
  
  // 如果是key-value格式（单个对象转换的），显示两列：key和value
  if (Object.prototype.hasOwnProperty.call(firstItem, 'key') && Object.prototype.hasOwnProperty.call(firstItem, 'value')) {
    return [
      {
        title: '键',
        key: 'key',
        ellipsis: true,
        width: 120,
        render: (row: any) => String(row.key)
      },
      {
        title: '值',
        key: 'value',
        ellipsis: true,
        render: (row: any) => {
          const value = row.value;
          if (value === null || value === undefined) {
            return String(value);
          }
          if (typeof value === 'object') {
            // 对于嵌套对象和数组，使用VatJson组件的popover模式展示
            return h(VatJson, {
              data: value,
              renderType: 'json',
              displayType: 'popover',
              simple: true,
              triggerText: Array.isArray(value) ? `数组[${value.length}]` : '对象',
              showCopy: false
            });
          }
          return String(value);
        }
      }
    ];
  }
  
  // 否则按原逻辑生成列
  return Object.keys(firstItem).map(key => {
    return {
      title: key,
      key: key,
      ellipsis: true,
      width: 150,
      render: (row: any) => {
        const value = row[key];
        if (value === null || value === undefined) {
          return String(value);
        }
        if (typeof value === 'object') {
          // 对于嵌套对象和数组，使用VatJson组件的popover模式展示
          return h(VatJson, {
            data: value,
            renderType: 'json',
            displayType: 'popover',
            simple: true,
            triggerText: Array.isArray(value) ? `数组[${value.length}]` : '对象',
            showCopy: false
          });
        }
        return String(value);
      }
    };
  });
});
</script>

<style scoped>
.vat-json-container {
  display: block;
  width: 100%;
  min-width: 100px;
  position: relative;
}

/* 直接渲染模式样式 */
.vat-json-direct-wrapper {
  width: 100%;
  overflow: auto;
  display: block;
  min-height: 50px;
}

/* 直接渲染JSON样式 */
.vat-json-direct-json {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.vat-json-direct-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.vat-json-direct-title {
  font-weight: 500;
}

/* 操作按钮容器 */
.vat-json-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* 格式化按钮样式 */
.vat-json-format-btn {
  padding: 2px 8px !important;
  min-width: auto !important;
  height: 22px !important;
  font-size: 12px !important;
  border-radius: 4px !important;
}

/* 复制按钮样式 */
.vat-json-copy-btn {
  padding: 2px !important;
  min-width: 22px !important;
  height: 22px !important;
  border-radius: 4px !important;
}

.vat-json-direct-pre {
  margin: 0;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 直接渲染表格样式 */
.vat-json-table-wrapper {
  width: 100%;
  overflow: auto;
  display: block;
  min-height: 50px;
}

.vat-json-table {
  font-size: 13px;
  line-height: 1.5;
  width: 100%;
  min-width: 300px;
}

/* Popover模式样式 */
.vat-json-popover-trigger {
  display: inline-block;
}

.vat-json-popover-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.vat-json-popover-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vat-json-popover-btn-simple {
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  transform: none;
  box-shadow: none;
}

.vat-json-popover-btn-simple:hover {
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.vat-json-popover-content {
  padding: 0;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.vat-json-popover-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f7f9fc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.vat-json-copy-btn {
  padding: 2px !important;
  min-width: 22px !important;
  height: 22px !important;
}

.vat-json-table-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.vat-json-table-popover {
  font-size: 12px;
  line-height: 1.4;
  background: transparent;
}

/* 原始JSON样式 */
.vat-json-raw {
  max-height: 400px;
  overflow: auto;
  padding: 12px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.vat-json-raw pre {
  margin: 0;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 滚动条样式 */
.vat-json-table-scroll::-webkit-scrollbar,
.vat-json-raw::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.vat-json-table-scroll::-webkit-scrollbar-track,
.vat-json-raw::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.vat-json-table-scroll::-webkit-scrollbar-thumb,
.vat-json-raw::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.vat-json-table-scroll::-webkit-scrollbar-thumb:hover,
.vat-json-raw::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .vat-json-table {
    font-size: 12px;
  }
  
  .vat-json-popover-content {
    max-width: 90vw;
  }
}

/* 朴素模式样式 */
.vat-json-simple {
  .vat-json-table {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }
  
  .vat-json-popover-btn {
    border: 1px solid #d1d5db;
    background: transparent;
    color: #374151;
  }
  
  .vat-json-popover-btn:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
}
</style>