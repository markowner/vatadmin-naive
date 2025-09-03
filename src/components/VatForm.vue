<template>
  <div>
    <n-form ref="formRef" :label-placement="props.labelPlacement" label-width="auto" :model="state.data" :rules="props.rules" v-bind="props.bindProps">
      <n-grid :cols="props.colsValue" :x-gap="24"  v-if="props.formGrid">
        <template v-for="(item, index) in state.list" :key="index">
          <n-form-item-gi :span="['json_editor','editor','form_table','markdown'].includes(item.type) ? 24 : (props.gridValue || (item.config?.width ? 24 : 12) || 12)" :label="item.label" :path="item.field">
            <VatFormEl :config="item" v-model="state.data[item.field]"></VatFormEl>
          </n-form-item-gi>
        </template>
      </n-grid>
      <n-flex v-else>
        <template v-for="(item, index) in state.list" :key="index">
          <n-form-item :label="item.label" :path="item.field" class="vat-form-item" :style="{width: ['json_editor','editor','form_table','markdown'].includes(item.type) ? '100%':  item.config?.width ? item.config?.width : ''}">
            <VatFormEl :config="item" v-model="state.data[item.field]"></VatFormEl>
          </n-form-item>
        </template>
      </n-flex>
    </n-form>
  </div>
</template>

<script setup>
import VatFormEl from "./VatFormEl.vue";
const props = defineProps({
  /**
   * 表单构建JSON
   */
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  /**
   * 表单验证规则
   */
  rules: {
    type: [Array, Object],
    default: () => {
      return {}
    }
  },
  /**
   * label标签放置
   */
  formGrid: {
    type: Boolean,
    default: false
  },
  /**
   * label标签放置
   */
  labelPlacement: {
    type: String,
    default: 'top'
  },
  /**
   * grid总列份
   */
  colsValue: {
    type: Number,
    default: 24
  },
  /**
   * 元素占grid列份
   */
  gridValue: {
    type: Number,
    default: 12
  },
  /**
   * 绑定值
   */
  modelValue: {
    type: Object,
    default: () => {
      return {}
    }
  },
  bindProps: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const state = reactive({
  list: props.list,
  data: props.modelValue
})

const formRef = ref(null)

function validate(callback){
  formRef.value?.validate((errors) => {
    callback(errors)
  })
}

const emits = defineEmits(["update:modelValue", "change"]);


watch(() => props.list, (val) => {
  if(val){
    state.list = val
  }
}, {deep: true, immediate: true})


watch(() => props.modelValue, (newValue) => {
  state.data = newValue
})

watch(() => state.data, (val) => {
  emits('update:modelValue', val)
  emits('change', val)
}, {deep: true, immediate: true})

defineExpose({
  validate,
  state
})

</script>
<style scoped>
.vat-form-item{
  width: 100%;
  display: unset;
}
@media (min-width: 1000px){
  .vat-form-item {width: calc((100% - 12px) / 2);}
}
@media (max-width: 600px){
  .vat-form-item {width: 100%;}
}
</style>