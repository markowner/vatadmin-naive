<template>
  <div class="table-container">
    <n-data-table
        v-model:checked-row-keys="state.ids"
        :row-key="state.rowKey"
        :columns="state.columns"
        :data="state.list"
        :pagination="false"
        :loading="state.loading"
        striped
        resizable
        :size="state.size"
        :single-line="!state.singleLine"
        :max-height="1000"
        :scroll-x="state.tableWidth"
        v-bind="props.tableProps"
        @update:sorter="handleSorterChange"
        style="margin-top: 15px;"
    />
    <div class="page-fixed" :class="[useSettingStore().getConfig.mode ? 'dark' : 'light']">
      <n-pagination
        v-model:page="state.query.page"
        :item-count="state.total"
        :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
        :display-order="['size-picker','pages','quick-jumper']"
        show-size-picker
        show-quick-jumper
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
        >
        <template #prefix="{ itemCount }">
          共 {{ itemCount }} 条
        </template>
      </n-pagination>
      <div class="set flex flex-center gap">
        <div v-show="state.settingShow" class="flex flex-center pointer text-blue gap5">
          <n-radio-group v-model:value="state.size" name="size">
            <n-radio key="small" value="small" label="小"/>
            <n-radio key="medium" value="medium" label="中"/>
            <n-radio key="large" value="large" label="大"/>
          </n-radio-group>
          <n-checkbox v-model:checked="state.singleLine">
            纵向边框
          </n-checkbox>
        </div>
        <div @click="state.settingShow = !state.settingShow" class="pointer setting text-blue"><i class="ifont i-set"></i></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Request from '@/utils/axios'
import { inject } from "vue";
const api = inject('api')
const tools = inject('tools')
import { useSettingStore } from '@/store/setting'

const props = defineProps({
  apiList: {
    type: [Object] ,
    default: () => {
      return {}
    }
  },
  columns: {
    type: Array,
    default: []
  },
  // selection: {
  //   type: Boolean,
  //   default: false
  // },
  // selectionProps: {
  //   type: Object,
  //   default: () => {
  //     return {}
  //   }
  // },
  tableProps:{
    type: Object,
    default: () => {
      return {}
    }
  },
  params: {
    type: Object,
    default: () => {
      return {}
    }
  },
  page: {
    type: Object,
    default: () => {
      return {
        pageSize: 20
      }
    }
  },
})

// props.selection && props.columns.unshift(Object.assign({'type': 'selection', fixed: 'left', key: 'selection', title: '全选'}, props.selectionProps))

const state = reactive({
  query:{
    page: 1,
    size: 10,
    order: [],
    filter: ''
  },
  total: 0,
  list: [],
  ids: [],
  sorts:[],
  columns: props.columns,
  tableWidth: 0,
  rowKey: (row) => row.id,
  loading: false,
  params: props.params,
  settingShow: false,
  size: 'small',
  singleLine: false //列分割线 纵向边框
})

function initTableWidth(){
  let width = 0;
  props.columns.forEach(item => {
    width += parseInt(item.width)
  })
  // if(props.selection) width += 100
  state.table = width
  return width
}

initTableWidth()


/**
 * 获取数据
 */
function search(params = ''){
  if(state.loading){
    return
  }
  state.loading = true
  if(params){
    state.params = params
  }

  params = Object.fromEntries(
      Object.entries(state.params).filter(([key, value]) => value !== null)
  );

  state.query.filter = JSON.stringify(params)
  Request.request(props.apiList.list, state.query).then(res => {
    state.loading = false
    state.list = res.data.list
    state.total = res.data.total
  }).catch(err => {
    state.loading = false
    console.log(err)
  })
}

function handleSorterChange(sorter){
  state.sorts = []
  if(sorter.length > 0){
    let sorts = []
    sorter.forEach(item => {
      if(item.order){
        sorts.push({field: item.columnKey, order: item.order})
      }
    })
    state.query.order = sorts
  }else{
    if(sorter.order){
      state.query.order = [{field: sorter.columnKey, order: sorter.order}]
    }else{
      state.query.order = [];
    }
  }
  search()
}

function onPageChange(){
  search()
}
function onPageSizeChange(pageSize){
  state.query.size = pageSize
  search()
}

watch(() => props.columns,(newVale) => {
  state.columns = newVale
}, {immediate: true, deep: true})

defineExpose({
  search,
  state
})

</script>

<style>
.table-container {
  /* 确保父容器有足够的高度 */
  height: 100%; /* 或者其他具体的高度 */
  display: flex;
  flex-direction: column;
}
</style>