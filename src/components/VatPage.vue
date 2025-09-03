<template>
  <div class="flex flex-direction-c">
    <VatSearch :list="state.fields" @search="toSearch" v-show="state.searchShow"></VatSearch>
    <slot name="default">
      <n-divider v-show="state.searchShow" />
    </slot>
    <VatTools :api-list="props.apiList" :selection="state.selection" :tools="props.tools" :columns="props.columns" @change="toolsChange" @column-change="columnChange">
      <template #left_append>
        <slot name="tools_left_append"></slot>
      </template>
      <template #right_append>
        <slot name="tools_right_append"></slot>
      </template>
    </VatTools>
    <VatTable style="flex: 1;" ref="table" :selection="state.selection" :columns="state.columns" :api-list="props.apiList" :params="state.params" :tools="props.tools"></VatTable>
  </div>
</template>

<script setup>
import Request from '@/utils/axios'
import VatSearch from "./VatSearch.vue";
import VatTable from "./VatTable.vue";
import VatTools from "./VatTools.vue";
import { inject } from "vue";
const tools = inject('tools')
const props = defineProps({
  /**
   * api路由List
   */
  apiList: {
    type: Object,
    default: () => {
      return {}
    }
  },
  /**
   * table列信息
   */
  columns: {
    type: Array,
    default: []
  },
  /**
   * 字段信息
   */
  fields: {
    type: Array,
    default: []
  },
  /**
   * 工具栏配置信息
   */
  tools: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const state = reactive({
  fields: props.fields,
  params: {},
  searchShow: true,
  selection: !!(props.tools.delete.show || props.tools.batch.show),
  columns: props.columns,
})



const table = ref(null)
/**
 * 请求数据
 */
function toSearch(data){
  state.params = data
  if(table.value){
    if(table.value.state.loading){
      setTimeout(() => {
        table.value.search(data)
      }, 500)
    }else{
      table.value.search(data)
    }
  }else{
    nextTick(() => {
      table.value.search(data)
    })
  }
}

function refresh(){
  table.value.search()
}

const emits = defineEmits(['toolsChange'])

/**
 * 工具栏事件
 * @param type
 */
function toolsChange(type, event){
  if(type === 'refresh'){
    table.value.search()
  }else if(type === 'search'){
    state.searchShow = !state.searchShow
  }else if(type === 'lock' || type === 'unlock'){
    //锁定
    if(table.value.state.ids.length < 1){
      tools.notice.message.error('请先选择')
      return
    }

    let typeName = type === 'lock' ? '锁定' : '解锁'
    let statusCode = type === 'lock' ? 1 : 0

    tools.notice.dialog.warning({
      title: '警告',
      content: '你确定要批量' + typeName + '数据吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Request.request(props.apiList.lock, {ids: table.value.state.ids, status: statusCode}).then(res => {
          tools.notice.message.success(res.msg)
          refresh()
        }).catch(err => {
          console.log(err)
        })
      },
      onNegativeClick: () => {

      }
    })
  }else if(type === 'delete'){
    //删除
    if(table.value.state.ids.length < 1){
      tools.notice.message.error('请先选择')
      return
    }
    tools.notice.dialog.warning({
      title: '警告',
      content: '你确定要批量删除数据吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Request.request(props.apiList.delete, {ids: table.value.state.ids}).then(res => {
          tools.notice.message.success(res.msg)
          refresh()
        }).catch(err => {
          console.log(err)
        })
      },
      onNegativeClick: () => {

      }
    })
  }else{
    emits('toolsChange', type, event, table.value.state.ids)
  }
}

function columnChange(keys){
  let options = []
  props.columns.forEach(column => {
    if(!column.hasOwnProperty('key') || keys.includes(column.key)){
      options.push(column)
    }
  })
  state.columns = options
}

watch(() => props.fields, (newVal, oldVal) => {
  state.fields = newVal
}, {deep: true, immediate: true})

defineExpose({
  state,
  refresh
})

</script>

<style lang="scss" scoped>
.n-divider:not(.n-divider--vertical){
  margin: 15px 0;
}
</style>