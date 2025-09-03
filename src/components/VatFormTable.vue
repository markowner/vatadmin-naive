<template>
  <div class="w100">
    <div class="search-item flex flex-jc-fe">
      <n-button type="primary" secondary size="tiny" @click="addRow">增加</n-button>
    </div>
    <n-data-table :columns="state.columns" :data="state.data"></n-data-table>
  </div>
</template>

<script setup>
import {inject} from "vue";
const tools = inject('tools')
import {NInput, NButton} from "naive-ui";

const props = defineProps({
  columns: {
    type: Array,
    default: []
  },
  modelValue: {
    type: Array,
    default: []
  },
  limit: {
    type: Number,
    default: 999
  },
  buildDefault: {
    type: Boolean,
    default: false
  },
})

const state = reactive({
  columns: [],
  rowData: {},
  data: props.modelValue
})

function initColumn(){
  state.columns = props.columns.map(item => {
      return {...item, render: (row, index) => {
          if(!item.hasOwnProperty('render')){
            return h(NInput, {
              value: row[item.key] + '',
              onUpdateValue: (val) => {
                state.data[index] = { ...state.data[index], [item.key]: val };
              },
            })
          }else{
            return item.render(row, index)
          }
      }
    }
  })
  // state.columns = props.columns;
  state.columns.push({
    title: '操作',
    key: 'handle',
    width: 80,
    render: (row, index) => {
      return h(NButton, {type: 'error', secondary: true, size: 'tiny', onClick:() => {
        state.data.splice(index, 1)
        }}, { default: () => h('i', { 'class': "ifont i-delete", style: {'font-size': '14px'} })})
    }
  })
  //初始化rowData
  props.columns.forEach(item => {
    state.rowData[item.key] = ''
  })

  if(props.buildDefault && props.modelValue.length < 1){
    state.data = [state.rowData]
  }
}

initColumn()

function addRow(){
  if(state.data.length > props.limit){
    return tools.notice.message.error('您添加的太多了')
  }
  state.data.push(state.rowData)
}

const emits = defineEmits(['update:modelValue', 'change'])

watch(() => state.data, (newVal) => {
  emits('update:modelValue', newVal)
  emits('change', newVal)
}, {immediate: true, deep: true})

</script>

<style scoped>
.search-item {
  margin-bottom: 10px;
  & label{
    justify-content: flex-end;
    white-space: nowrap;
    line-height: 32px;
    padding-right: 10px;
    text-align: right;
    color: #4e5969;
    flex: 0 0 50px;
  }
}
</style>