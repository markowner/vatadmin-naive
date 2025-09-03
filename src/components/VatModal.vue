<template>
  <n-modal
      v-model:show="state.dialogVisible"
      :title="props.title"
      draggable
      preset="card"
      size="medium"
      :segmented="{content: true}"
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
      <div style="max-height: 76vh;overflow: auto;"><slot name="default"></slot></div>
  </n-modal>
</template>
<script setup>

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
  }
})

const state = reactive({
  dialogVisible: props.modelValue
})

const emits = defineEmits(['update:modelValue', 'change'])


/**
 * 展示
 */
function show(){
  state.dialogVisible = true
  emits('update:modelValue', true)
  emits('change', true)
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

watch(() => props.modelValue, (newVal, oldVal) => {
  state.dialogVisible = newVal
})

defineExpose({
  show,
  hide,
  state
})

</script>