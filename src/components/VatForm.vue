<template>
  <div>
    <n-form ref="formRef" @validate="(field) => console.log('validate:', field)" :label-placement="props.labelPlacement" label-width="auto" :model="state.data" :disabled="props.disabled" :rules="props.rules" v-bind="props.bindProps">
      <n-grid :cols="props.colsValue" :x-gap="24"  v-if="state.layout === 'grid'">
        <template v-for="(item, index) in state.list" :key="index">
          <template v-if="props.injectEl?.before" v-for="(ele, index) in props.injectEl.before" :key="index" >
            <component v-if="ele.field == item.field" :is="ele.el"></component>
          </template>
          <n-form-item-gi v-if="item?._visible ?? true" :span="['json_editor','editor','form_table','markdown'].includes(item.type) ? 24 : (props.gridValue || (item.config?.width ? 24 : 12) || 12)" :label="item.label" :path="item.field">
            <VatFormEl :config="item" :disabled="state.disabled" v-model="state.data[item.field]"></VatFormEl>
          </n-form-item-gi>
          <template v-if="props.injectEl?.after" v-for="(ele, index) in props.injectEl.after" :key="index">
            <component v-if="ele.field == item.field" :is="ele.el"></component>
          </template>
        </template>
      </n-grid>
      <n-flex v-else>
        <template v-for="(item, index) in state.list" :key="index">
          <template v-if="props.injectEl?.before" v-for="(ele, index) in props.injectEl.before" :key="index">
            <component v-if="ele.field == item.field" :is="ele.el"></component>
          </template>
          <n-form-item v-if="item?._visible ?? true" :label="item.label" :path="item.field" :class="['vat-form-item', state.layout]" :style="{width: ['json_editor','editor','form_table','markdown'].includes(item.type) ? '100%':  item.config?.width ? item.config?.width : ''}">
            <VatFormEl :config="item" :disabled="props.disabled" v-model="state.data[item.field]"></VatFormEl>
          </n-form-item>
          <template v-if="props.injectEl?.after" v-for="(ele, index) in props.injectEl.after" :key="index">
            <component v-if="ele.field == item.field" :is="ele.el"></component>
          </template>
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
   * layout布局模式
   * auto 自动模式, row 强制行模式
   * 自动模式下, 当元素类型为 json_editor, editor, form_table, markdown 时, 强制行模式
   */
  layout: {
    type: String,
    default: 'auto' 
  },
  disabled: {
    type: Boolean,
    default: false
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
  /**
   * 绑定属性
   */
  bindProps: {
    type: Object,
    default: () => {
      return {}
    }
  },
  /**
   * 注入元素
   * 格式：
   * {
   *   before: [
   *     {
   *       field: 'password', // 注入在password字段之前
   *       el: (h) => h(NTooltip, {content: '密码必须包含字母、数字和特殊字符'})
   *     }
   *   ],
   *   after: [
   *     {
   *       field: 'password', // 注入在password字段之后
   *       el: (h) => h(NTooltip, {content: '密码必须包含字母、数字和特殊字符'})
   *     }
   *   ]
   * }
   */
  injectEl: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
let _layout = props.layout
if(props.formGrid){
  _layout = 'grid'
}

const state = reactive({
  layout: _layout,
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
<style scoped lang="scss">
.vat-form-item{
  width: 100%;
  &.auto{
    display: unset !important;
  }
  &.row{
    width: 100%;
  }
}
@media (min-width: 1000px){
  .vat-form-item.auto {width: calc((100% - 12px) / 2);}
}
@media (max-width: 600px){
  .vat-form-item.auto {width: 100%;}
}
</style>