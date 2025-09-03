<template>
  <VatPage
    ref="vPage"
    name="vat_pages"
    :fields="state.pageJson.fields"
    :api-list="state.pageJson.api"
    :columns="state.pageJson.columns"
    :tools="state.pageJson.tools"
    @toolsChange="toolsChange"
  >
  </VatPage>
  <Edit v-model="state.editDialogVisible" ref="editForm" @submit="toSubmit"></Edit>
  <Build v-model="state.buildDialogVisible" width="90%" ref="buildPage" @submit="toSubmit"></Build>
</template>

<script setup>
import VatPage from "@/components/VatPage.vue";
import Edit from "./edit.vue";
import Build from "./build.vue";
import pageJsonData from '@/vat/pages/pages.json'
import {inject} from "vue";
const tools = inject('tools')
const vPage = ref(null)
import Request from '@/utils/axios'
import { NButton } from 'naive-ui'
import { useRoute } from 'vue-router'

const editForm = ref(null)
const buildPage = ref(null)

let column = tools.pages.buildColumns(pageJsonData)

column.status.render = (row) => {
  return tools.pages.renderSwitch(row, pageJsonData.api_list.lock)
  // return tools.pages.renderTextColor([0,1,1,1,1], row.status, row.status_desc)
}
pageJsonData.tools.edit.show = false
/**
 * 操作列
 * @param row
 * @param index
 * @returns {*[]}
 */
function handleColumn(row, index) {
  let columns = []
  if (pageJsonData.tools.edit.show) {
    columns.push(
      h(NButton,
        {
          size: 'tiny',
          type: 'info',
          onClick: () => {
            editForm.value.injectData(row)
            state.editDialogVisible = true
          }
        },
        {default: () => '编辑'}
      )
    )
  }
  if (pageJsonData.tools.delete.show) {
    columns.push(
      h(NButton,
        {
          size: 'tiny',
          type: 'error',
          style: "margin:0 10px;",
          onClick: () => {
            tools.notice.dialog.warning({
              title: '警告',
              content: '你确定要删除此数据吗？',
              positiveText: '确定',
              negativeText: '取消',
              onPositiveClick: () => {
                tools.notice.message.success('我要删除')
                Request.request(pageJsonData.api_list.delete, {id: row.id}).then(res => {
                  tools.notice.message.success(res.msg)
                }).catch(err => {
                  console.log(err)
                })
              },
              onNegativeClick: () => {

              }
            })
          }
        },
        {default: () => '删除'}
      )
    )
  }
  return columns
}

column.handle = {
  title: '操作',
  key: 'handle',
  render: (row, index) => {
    const defaultColumn = handleColumn(row, index)
    return h('div', {class: 'flex gap'}, {
      default: () => {
        return [...defaultColumn, h(NButton,
            {
              size: 'tiny',
              type: 'info',
              onClick: () => {
                buildPage.value.injectData(row)
                state.buildDialogVisible = true
              }
            },
            {default: () => '编辑'}
          )
        ]
      }
    })
  }
}

const state = reactive({
  pageJson: {
    api: pageJsonData.api_list,
    columns: tools.pages.sortColumns(Object.values(column)),
    fields: tools.pages.buildSearch(pageJsonData.fields),
    tools: pageJsonData.tools
  },
  editDialogVisible: false,
  buildDialogVisible: false,
})

/**
 * tools组件change事件
 * @param type
 * @param event
 * @param ids
 * @returns {MessageReactive}
 */
function toolsChange(type, event, ids){
  switch(type){
    case 'add':
      state.editDialogVisible = true
      break;
    case 'batch':
      console.log('ids', ids)
      if(ids.length < 1){
        return tools.notice.message.error('请先选择')
      }
      tools.notice.message.success('批量操作' + event + ids)
      break;
    case 'download':
      pageJsonData.api_list.download.url += event
      Request.request(pageJsonData.api_list.download, {filter: JSON.stringify(vPage.value.state.params)}).then(res => {
        tools.notice.message.success(res.msg)
      }).catch(err => {
        console.log(err)
      })
      break;
    default:
       break;
  }
}

const route = useRoute()
console.log(route.matched)
state.breadcrumb = route.matched.filter((item) => {
  return item.meta && item.meta.title
})


/**
 * 添加编辑提交完成
 */
function toSubmit(){
  vPage.value.refresh()
}

</script>

<style scoped>

</style>