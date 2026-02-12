<template>
  <VatPage ref="vPage" name="admin_user" :fields="state.pageJson.fields" :api-list="state.pageJson.api" :columns="state.pageJson.columns" :tools="state.pageJson.tools" :settings="state.pageJson.settings" @toolsChange="toolsChange">
  </VatPage>
  <Edit ref="editForm" @submit="toSubmitComplete"></Edit>
</template>

<script setup>
import VatPage from "@/components/VatPage.vue";
import Edit from "./edit.vue";
import pageJsonData from '@/vat/pages/vat_admin_user.json'
import {inject} from "vue";
const tools = inject('tools')
const vPage = ref(null)
import Request from '@/utils/axios'
import { NButton } from 'naive-ui'

const editForm = ref(null)

let column = tools.pages.buildColumns(pageJsonData)

column.roles.render = (row) => {
    return tools.pages.renderTags(row.roles_name)
}

column.department_id.render = (row) => row.department_name


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
              type: 'primary',
              secondary: true,
              onClick: () => {
                row.password = ''
                editForm.value.type('edit').injectData(row).show()
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
              secondary: true,
              onClick: () => {
                tools.notice.dialog.warning({
                  title: '警告',
                  content: '你确定要删除此数据吗？',
                  positiveText: '确定',
                  negativeText: '取消',
                  onPositiveClick: () => {
                    tools.notice.message.success('我要删除')
                    Request.request(pageJsonData.api_list.delete, {ids: row.id}).then(res => {
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
column.id.fixed = 'left'
column.name.fixed = 'left'
column.status.fixed = 'right'
column.handle = {
  title: '操作',
  key: 'handle',
  width: 100,
  fixed: 'right',
  render: (row, index) => {
    const defaultColumn = handleColumn(row, index)
    return h('div', {class: 'flex gap', style: row.id === 1 ? "display: none;" : ''}, {
      default: () => {
        return [...defaultColumn]
      }
    })
  }
}

const state = reactive({
  pageJson: {
    api: pageJsonData.api_list,
    columns: tools.pages.sortColumns(Object.values(column)),
    fields: tools.pages.buildSearch(pageJsonData.fields),
    tools: pageJsonData.tools,
    settings: pageJsonData?.setting || {}
  }
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
      editForm.value.type('add').show()
      break;
    case 'batch':
      //批量操作
      if(ids.length < 1){
        return tools.notice.message.error('请先选择')
      }
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

/**
 * 添加编辑提交完成
 */
function toSubmitComplete(){
  vPage.value.refresh()
}

</script>

<style scoped>

</style>