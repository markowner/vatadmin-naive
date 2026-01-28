<template>
  <div class="vat-link-container">
    <!-- 链接主体 -->
    <a 
      :href="href" 
      :target="target" 
      class="vat-link"
      :class="{
        'vat-link-primary': type === 'primary',
        'vat-link-success': type === 'success',
        'vat-link-warning': type === 'warning',
        'vat-link-danger': type === 'danger',
        'vat-link-info': type === 'info',
        'vat-link-small': size === 'small',
        'vat-link-disabled': disabled,
        'vat-link-underline': showUnderline,
        'vat-link-bordered': showBorder && !simple,
        'vat-link-simple': simple,
        'vat-link-simple-bordered': simple && showBorder
      }"
      @click="handleClick"
      :title="showFullHrefInTooltip ? href : ''"
    >
      <i v-if="icon" class="vat-link-icon ifont" :class=[icon] />
      <!-- 显示链接，超出省略 -->
      <span class="vat-link-text">{{ displayText }}</span>
    </a>
    
    <!-- 复制按钮 -->
    <n-tooltip v-if="showCopy" placement="top">
      <template #trigger>
        <n-button 
          size="tiny" 
          :type="type" 
          secondary 
          circle 
          class="vat-link-copy-btn"
          :class="{
            'vat-link-copy-btn-simple': simple
          }"
          @click.stop="copyLink"
          :disabled="disabled"
        >
          <template #icon>
            <i class="ifont i-copy"></i>
          </template>
        </n-button>
      </template>
      {{ copySuccess ? '已复制' : '复制链接' }}
    </n-tooltip>
    
    <!-- 操作菜单（可选） -->
    <n-dropdown 
      v-if="showOperations" 
      trigger="click"
      placement="top-right"
    >
      <template #trigger>
        <n-button 
          size="tiny" 
          circle 
          class="vat-link-ops-btn"
          :disabled="disabled"
        >
          <template #icon>
            <i class="ifont i-more"></i>
          </template>
        </n-button>
      </template>
      <n-menu :options="operationOptions" />
    </n-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NIcon, NTooltip, NDropdown, NMenu } from 'naive-ui';
import { Copy as CopyIcon, MoreVertical } from '@vicons/ionicons5';

interface Props {
  href: string;
  title?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'default' | 'small';
  disabled?: boolean;
  icon?: any;
  showUnderline?: boolean;
  showBorder?: boolean;
  simple?: boolean;
  showCopy?: boolean;
  showFullHrefInTooltip?: boolean;
  showOperations?: boolean;
  operationOptions?: any[];
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  target: '_blank',
  type: 'primary',
  size: 'default',
  disabled: false,
  icon: null,
  showUnderline: false,
  showBorder: false,
  simple: false,
  showCopy: true,
  showFullHrefInTooltip: true,
  showOperations: false,
  operationOptions: () => [],
  maxLength: 30
});

// 计算显示文本，超出指定长度则省略
const displayText = computed(() => {
  const text = props.title || props.href;
  if (text.length <= props.maxLength) {
    return text;
  }
  return text.substring(0, props.maxLength) + '...';
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  copy: [href: string];
}>();

const copySuccess = ref(false);

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};

const copyLink = () => {
  navigator.clipboard.writeText(props.href).then(() => {
    copySuccess.value = true;
    emit('copy', props.href);
    setTimeout(() => {
      copySuccess.value = false;
    }, 1500);
  });
};
</script>

<style scoped>
/* 基础样式 - 适合表格的简洁设计 */
.vat-link-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  font-size: inherit;
  line-height: inherit;
}

.vat-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #1890ff;
}

/* 下划线样式 */
.vat-link-underline {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.vat-link:hover {
  color: #40a9ff;
}

.vat-link:visited {
  color: #722ed1;
}

/* 类型样式 - 表格友好的颜色 */
.vat-link-primary {
  color: #1890ff;
}

.vat-link-primary:hover {
  color: #40a9ff;
}

.vat-link-success {
  color: #52c41a;
}

.vat-link-success:hover {
  color: #73d13d;
}

.vat-link-warning {
  color: #faad14;
}

.vat-link-warning:hover {
  color: #ffc53d;
}

.vat-link-danger {
  color: #f5222d;
}

.vat-link-danger:hover {
  color: #ff4d4f;
}

.vat-link-info {
  color: #722ed1;
}

.vat-link-info:hover {
  color: #9254de;
}

/* 尺寸样式 */
.vat-link-small {
  font-size: 12px;
}

/* 禁用样式 */
.vat-link-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  color: #c0c4cc !important;
}

/* 图标样式 */
.vat-link-icon {
  font-size: 14px;
  vertical-align: middle;
}

.vat-link-small .vat-link-icon {
  font-size: 12px;
}

/* 操作按钮样式 - 简洁的更多按钮 */
.vat-link-ops-btn,
.vat-link-copy-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 2px !important;
  margin: 0 !important;
  min-width: 24px !important;
  height: 24px !important;
}

.vat-link-container:hover .vat-link-ops-btn,
.vat-link-container:hover .vat-link-copy-btn {
  opacity: 1;
}

/* 文本样式 - 优化的溢出处理 */
.vat-link-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
  line-height: inherit;
  font-size: inherit;
}

/* 复制按钮优化 - 更适合表格 */
.vat-link-copy-btn {
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  padding: 2px !important;
  margin: 0 !important;
  min-width: 24px !important;
  height: 24px !important;
  transform: scale(0.9);
  border-radius: 6px !important;
}

.vat-link-container:hover .vat-link-copy-btn {
  opacity: 1;
  transform: scale(1);
}

/* 朴素模式下的复制按钮样式 */
.vat-link-copy-btn-simple {
  opacity: 0;
  border-radius: 4px !important;
  transition: opacity 0.2s ease;
  padding: 0 !important;
  min-width: 20px !important;
  height: 20px !important;
  transform: none !important;
}

.vat-link-container:hover .vat-link-copy-btn-simple {
  opacity: 1;
}

/* 操作按钮样式 */
.vat-link-ops-btn {
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  padding: 2px !important;
  margin: 0 !important;
  min-width: 24px !important;
  height: 24px !important;
  transform: scale(0.9);
}

.vat-link-container:hover .vat-link-ops-btn {
  opacity: 1;
  transform: scale(1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .vat-link-text {
    max-width: 100px;
  }
  
  .vat-link-copy-btn,
  .vat-link-ops-btn {
    opacity: 1;
    transform: scale(1);
  }
}

/* 表格中特殊处理 */
:deep(.n-data-table-cell) {
  .vat-link {
    font-size: 14px;
    line-height: 1.5;
  }
  
  .vat-link-text {
    max-width: 120px;
    font-size: 14px;
  }
  
  /* 表格单元格内优化 */
  .vat-link-container {
    gap: 2px;
  }
}

/* 边框样式 - 现代化设计 */
.vat-link-bordered {
  padding: 4px 10px !important;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  text-decoration: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.vat-link-bordered::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
  z-index: 1;
}

.vat-link-bordered:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  text-decoration: none !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.vat-link-bordered:hover::before {
  left: 100%;
}

/* 类型边框样式 - 精致配色 */
.vat-link-primary.vat-link-bordered {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.vat-link-primary.vat-link-bordered:hover {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
}

.vat-link-success.vat-link-bordered {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.vat-link-success.vat-link-bordered:hover {
  border-color: #22c55e;
  background: #dcfce7;
  color: #15803d;
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06);
}

.vat-link-warning.vat-link-bordered {
  border-color: #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.vat-link-warning.vat-link-bordered:hover {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #78350f;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06);
}

.vat-link-danger.vat-link-bordered {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.vat-link-danger.vat-link-bordered:hover {
  border-color: #ef4444;
  background: #fee2e2;
  color: #7f1d1d;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06);
}

.vat-link-info.vat-link-bordered {
  border-color: #c7d2fe;
  background: #f5f3ff;
  color: #4338ca;
}

.vat-link-info.vat-link-bordered:hover {
  border-color: #6366f1;
  background: #ede9fe;
  color: #3730a3;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(99, 102, 241, 0.06);
}

/* 禁用状态的边框样式 - 优雅的禁用效果 */
.vat-link-disabled.vat-link-bordered {
  border-color: #e5e7eb !important;
  background: #f9fafb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  text-decoration: none !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 0.7;
}

/* 悬停效果优化 */
.vat-link:not(.vat-link-bordered):hover {
  text-decoration: underline !important;
}

/* 禁用状态优化 */
.vat-link-disabled {
  cursor: not-allowed !important;
}

/* 表格中的边框样式优化 - 紧凑设计 */
:deep(.n-data-table-cell) .vat-link-bordered {
  padding: 3px 8px !important;
  font-size: 13px;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

:deep(.n-data-table-cell) .vat-link-bordered:hover {
  transform: none;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

/* 小尺寸边框样式 */
.vat-link-small.vat-link-bordered {
  padding: 2px 6px !important;
  font-size: 12px;
  border-radius: 6px;
}

/* 朴素样式 - 极简设计 */
.vat-link-simple {
  color: #374151 !important;
  font-weight: normal !important;
}

.vat-link-simple:hover {
  color: #1f2937 !important;
  text-decoration: underline !important;
}

/* 朴素样式 - 类型颜色 */
.vat-link-simple.vat-link-primary {
  color: #3b82f6 !important;
}

.vat-link-simple.vat-link-primary:hover {
  color: #2563eb !important;
}

.vat-link-simple.vat-link-success {
  color: #10b981 !important;
}

.vat-link-simple.vat-link-success:hover {
  color: #059669 !important;
}

.vat-link-simple.vat-link-warning {
  color: #f59e0b !important;
}

.vat-link-simple.vat-link-warning:hover {
  color: #d97706 !important;
}

.vat-link-simple.vat-link-danger {
  color: #ef4444 !important;
}

.vat-link-simple.vat-link-danger:hover {
  color: #dc2626 !important;
}

.vat-link-simple.vat-link-info {
  color: #6366f1 !important;
}

.vat-link-simple.vat-link-info:hover {
  color: #4f46e5 !important;
}

/* 朴素边框样式 - 极简设计 */
.vat-link-simple-bordered {
  padding: 2px 6px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 4px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #374151 !important;
  transition: all 0.2s ease !important;
}

.vat-link-simple-bordered:hover {
  border-color: #9ca3af !important;
  background: #f9fafb !important;
  box-shadow: none !important;
  transform: none !important;
  color: #1f2937 !important;
}

/* 朴素边框类型样式 */
.vat-link-simple.vat-link-primary.vat-link-simple-bordered {
  border-color: #bfdbfe !important;
  color: #1d4ed8 !important;
}

.vat-link-simple.vat-link-primary.vat-link-simple-bordered:hover {
  border-color: #93c5fd !important;
  background: #eff6ff !important;
}

.vat-link-simple.vat-link-success.vat-link-simple-bordered {
  border-color: #d1fae5 !important;
  color: #065f46 !important;
}

.vat-link-simple.vat-link-success.vat-link-simple-bordered:hover {
  border-color: #a7f3d0 !important;
  background: #f0fdf4 !important;
}

.vat-link-simple.vat-link-warning.vat-link-simple-bordered {
  border-color: #fef3c7 !important;
  color: #92400e !important;
}

.vat-link-simple.vat-link-warning.vat-link-simple-bordered:hover {
  border-color: #fde68a !important;
  background: #fffbeb !important;
}

.vat-link-simple.vat-link-danger.vat-link-simple-bordered {
  border-color: #fee2e2 !important;
  color: #991b1b !important;
}

.vat-link-simple.vat-link-danger.vat-link-simple-bordered:hover {
  border-color: #fecaca !important;
  background: #fef2f2 !important;
}

.vat-link-simple.vat-link-info.vat-link-simple-bordered {
  border-color: #e0e7ff !important;
  color: #4338ca !important;
}

.vat-link-simple.vat-link-info.vat-link-simple-bordered:hover {
  border-color: #c7d2fe !important;
  background: #f5f3ff !important;
}

/* 朴素禁用样式 */
.vat-link-simple.vat-link-disabled {
  color: #9ca3af !important;
  cursor: not-allowed !important;
}

.vat-link-simple.vat-link-disabled.vat-link-simple-bordered {
  border-color: #e5e7eb !important;
  background: #f9fafb !important;
  color: #9ca3af !important;
}

/* 表格中的朴素样式 */
:deep(.n-data-table-cell) .vat-link-simple {
  font-size: 14px;
}

:deep(.n-data-table-cell) .vat-link-simple.vat-link-simple-bordered {
  padding: 2px 5px !important;
  font-size: 13px;
}
</style>