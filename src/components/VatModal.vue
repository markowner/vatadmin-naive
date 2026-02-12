<template>
  <n-modal
      v-model:show="state.dialogVisible"
      :title="props.title"
      draggable
      preset="card"
      size="medium"
      :segmented="{content: true, footer: true}"
      :on-after-leave="hide"
      v-bind="props.bindProps"
      :style="{width: props.width}"
  >
      <template #footer>
        <slot name="footer"></slot>
      </template>
      <template #action>
        <slot name="action"></slot>
      </template>
      <div style="max-height: 76vh;overflow: auto;">
        <!-- 外部链接 -->
        <iframe
          v-if="props.type === 'url' && props.content"
          :src="props.content"
          style="width: 100%; height: 60vh; border: none;"
          :sandbox="props.sandbox || 'allow-scripts allow-same-origin'"
        />
        
        <!-- 组件内容 -->
        <template v-else-if="props.type === 'component' && props.content">
          <component 
            :is="state.contentComponent" 
            v-if="state.contentComponent" 
            v-bind="props.componentProps"
          />
          <div v-else style="padding: 20px; text-align: center; color: #999;">
            组件未找到
          </div>
        </template>
        <!-- 传统插槽内容 -->
        <template v-else>
          <slot name="default"></slot>
        </template>
      </div>
  </n-modal>
</template>
<script setup>
import { reactive, watch, ref, markRaw } from 'vue'

const props = defineProps({
  width:{
    type: [Number, String],
    default: '50%'
  },
  title:{
    type: String,
    default: ''
  },
  modelValue:{
    type: Boolean,
    default: false
  },
  bindProps:{
    type: Object,
    default: () => {
      return {}
    }
  },
  // 内容类型: default(默认插槽), url(外部链接), component(组件)
  type:{
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'url', 'component'].includes(value)
    }
  },
  // 内容 (根据type不同有不同含义)
  content:{
    type: [String, Function, Object],
    default: ''
  },
  componentProps:{
    type: Object,
    default: () => {
      return {}
    }
  },
  // iframe 安全选项 (当type为'url'时使用)
  sandbox:{
    type: String,
    default: 'allow-scripts allow-same-origin'
  }
})

const state = reactive({
  dialogVisible: props.modelValue,
  contentComponent: null
})

const emits = defineEmits(['update:modelValue', 'change'])

/**
 * 展示
 */
function show(){
  state.dialogVisible = true
  emits('update:modelValue', true)
  emits('change', true)
  // 当类型为组件时，准备组件
  if (props.type === 'component' && props.content) {
    state.contentComponent = markRaw(props.content)
  }
  return this
}

/**
 * 隐藏
 */
function hide() {
  state.dialogVisible = false
  emits('update:modelValue', false)
  emits('change', false)
  return this
}

/**
 * 刷新内容
 */
function refresh() {
  if (props.type === 'component' && props.content) {
    // 重新设置组件以触发刷新
    state.contentComponent = null
    setTimeout(() => {
      state.contentComponent = markRaw(props.content)
    }, 0)
  }
  return this
}

watch(() => props.modelValue, (newVal, oldVal) => {
  state.dialogVisible = newVal
})

defineExpose({
  show,
  hide,
  refresh,
  state
})

</script>