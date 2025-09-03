<template>
  <div v-if="props.list.length > 0" style="margin:0 0 0px 0;" class="flex flex-wrap flex-ai-c">
    <template v-for="(item, index) in props.list" :key="index">
      <VatSearchEl :config="item" :label-show="props.labelShow" v-model="fieldJson[item.field]"></VatSearchEl>
    </template>
    <div class="search-item search-btn-group">
      <label v-if="props.labelShow && checkDisplayNum(props.list) > 0"></label>
      <div class="flex" style="gap: 10px;">
        <n-button v-if="props.searchText" secondary type="primary" @click="onSubmit">
          <template #icon>
            <i class="ifont i-search"></i>
          </template>
          {{ props.searchText }}
        </n-button>
        <n-button v-if="props.resetText" secondary color="#333" @click="onReset">
          <template #icon>
            <i class="ifont i-refresh"></i>
          </template>
          {{ props.resetText }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, reactive } from 'vue'
import VatSearchEl from "./VatSearchEl.vue";

const props = defineProps({
  list: {
    type: Array,
    required: true
  },
  searchText: {
    type: String,
    default: '搜索'
  },
  resetText: {
    type: String,
    default: '重置'
  },
  direction: {
    type: String,
    default: 'row'
  },
  labelShow: {
    type: Boolean,
    default: true
  }
})

const fieldJson = ref({})
const emits = defineEmits(['search','search-change']);

/**
 * 初始化数据格式
 */
function initFieldJson() {
  let fieldJsonTemp = {}
  props.list.forEach(function (value, index) {
    fieldJsonTemp[value.field] = value.default
  })
  fieldJson.value = fieldJsonTemp
  emits('search-change', fieldJson.value)
  emits('search', fieldJson.value)
}

initFieldJson()


function checkDisplayNum(){
  return props.list
      .filter(item => item.type !== 'hidden') // 过滤出 type 不等于 hidden 的对象
      .length;
}

/**
 * tab切换
 */
function tabChange() {
  emits('search-change', fieldJson.value)
  emits('search', fieldJson.value)
}

/**
 * 重置
 */
function onReset(){
  initFieldJson()
}
/**
 * 数据提交
 */
function onSubmit() {
  emits('search-change', fieldJson.value)
  emits('search', fieldJson.value)
}

watch(() => props.list, function (newVal) {
  newVal.forEach(function (value, index) {
    fieldJson.value[value.field] = value.default
    // if (!fieldJson.value.hasOwnProperty(value.field)) {
    //   fieldJson.value[value.field] = value.default
    // }
  })
})

watch(() => fieldJson.value, function (newVal) {
  emits('search', newVal)
  emits('search-change', newVal)
}, { deep: true })

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

@media (max-width: 1200px){
  .search-item {width: 50%;}
}
@media (max-width: 600px){
  .search-item {width: 100%;}
}
</style>