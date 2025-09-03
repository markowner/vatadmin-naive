<template>
  <div class="w100" v-if="state.config.type == 'tab'" style="padding: 0 0 10px 0;">
    <n-tabs :type="state.config.type || 'card'" size="small" v-model:value="state.value" @update:value="tabChange">
      <n-tab v-for="subItem in state.config.config.options" :name="subItem.value">
        {{ subItem.label }}
      </n-tab>
    </n-tabs>
  </div>
  <template v-else>
  <div class="search-item" :style="{width: state.config.type === 'hidden' ? '0' : ''}">
    <label v-if="props.labelShow && state.config.type !== 'tab' && state.config.type !== 'hidden'">{{ state.config.label }}</label>
    <template v-if="state.config.type == 'input'">
      <div class="filter-item">
        <n-input v-model:value="state.value" type="text" :placeholder="state.config.placeholder || ''" clearable />
      </div>
    </template>
    <template v-if="state.config.type == 'input-pair'">
      <div class="filter-item">
        <n-input pair v-model:value="state.value" :placeholder="state.config.placeholder || ['从','到']" clearable />
      </div>
    </template>
    <template v-else-if="state.config.type == 'select'">
      <div class="filter-item">
        <n-select
            v-model:value="state.value"
            :placeholder="state.config.placeholder || ''"
            :options="state.config.config.options"
            :multiple="state.config.config.multiple"
            v-bind="Object.assign({},state.config.config.props, state.config.config.search_props )"
            clearable />
      </div>
    </template>
    <template v-else-if="state.config.type == 'treeselect'">
      <div class="filter-item">
        <n-tree-select
            v-model:value="state.value"
            :placeholder="state.config.placeholder || ''"
            :options="state.config.config.options"
            clearable
            v-bind="Object.assign({},state.config.config.props, state.config.config.search_props )"
        />
      </div>
    </template>
    <template v-else-if="state.config.type == 'cascader'">
      <n-cascader
          v-model:value="state.value"
          :placeholder="state.config.placeholder || ''"
          :expand-trigger="state.config.config.trigger || 'hover'"
          :options="state.config.config.options"
          :check-strategy="state.config.config.strategy || 'all'"
          :show-path="state.config.config.showPath || false"
          :filterable="state.config.config.filterable || true"
          clearable
          v-bind="state.config.config.props"
      />
    </template>
    <template v-else-if="state.config.type == 'hidden'">
      <input type="hidden" class="filter-item" v-model="state.value" />
    </template>
    <template v-else-if="state.config.type == 'datepicker'">
      <div class="filter-item">
        <n-date-picker v-model:formatted-value="state.value" :format="state.config.format || null" :value-format="state.config.format || null" :type="state.config.config.type" clearable />
      </div>
    </template>
  </div>
  </template>
</template>

<script setup>
import { ref, defineProps, watch, reactive } from 'vue'
import Request from '@/utils/axios'
import {inject} from "vue";
const tools = inject('tools')
const props = defineProps({
  /**
   * 单个元素JSON
   */
  config: {
    type: Object,
    default: () => {
      return {}
    }
  },
  modelValue:{
    type: [String, Number, Object, Array, Boolean, null]
  },
  labelShow: {
    type: Boolean,
    default: true
  }
})

const state = reactive({
  config: props.config,
  value: props.modelValue
})

const fieldJson = ref({})
const emits = defineEmits(['update:modelValue', 'search', 'change'])

//拉取api数据
function init(){
  if(props.config.config.api){
    Request.request(props.config.config.api, props.config.config.api_params || {}).then(res => {
      state.config.config.options = res.data.list
    }).catch(err => {
      console.log(err)
    })
  }
}

init()

/**
 * tab切换
 */
function tabChange() {
  emits('search', fieldJson.value)
}

watch(() => props.modelValue, (newValue) => {
  state.value = newValue
})

watch(() => state.value, (newValue) => {
  emits('update:modelValue', newValue)
  emits('change', newValue)
})

</script>

<style scoped lang="scss">
.search-item{
  display: flex;
  align-items: center;
  width: 33.33333%;
  padding: 5px 5px 5px;
  box-sizing: border-box;
  & label{
    justify-content: flex-end;
    white-space: nowrap;
    line-height: 32px;
    padding-right: 10px;
    text-align: right;
    color: #4e5969;
    flex: 0 0 65px;
  }
}
.filter-item{
  width: 100%;
}
.search-btn-group{
  & i{
    font-size: 13px;
  }
}

.mobile .search-item{
  width: 100% !important;
}

@media (max-width: 1400px){
  .search-item {width: 50%;}
}
@media (max-width: 600px){
  .search-item {width: 100%;}
}
</style>