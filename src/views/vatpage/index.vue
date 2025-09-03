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
  <n-modal v-model:show="state.buildOptionVisible">
    <n-card title="构建页面" style="width: 50%;">
      <template #header-extra>
        <i class="ifont i-close-circle modal-card-close" @click="state.buildOptionVisible = !state.buildOptionVisible"></i>
      </template>
      <n-checkbox-group v-model:value="state.buildOptions">
        <n-space item-style="display: flex;">
          <n-checkbox value="controller" label="控制器" />
          <n-checkbox value="model" label="模型" />
          <n-checkbox value="view" label="前端页面" />
          <n-checkbox value="json" label="前端JSON" />
          <n-checkbox value="menu" label="菜单" />
        </n-space>
      </n-checkbox-group>
      <template #action>
        <n-flex justify="end">
          <n-space>
            <n-button type="tertiary" @click="state.buildOptionVisible = !state.buildOptionVisible">取消</n-button>
            <n-button type="primary" @click="toBuild">确认</n-button>
          </n-space>
        </n-flex>
      </template>

    </n-card>
  </n-modal>
</template>

<script setup>
import VatPage from "@/components/VatPage.vue";
import Edit from "./edit.vue";
import Build from "./build.vue";
import pageJsonData from '@/vat/pages/vat_pages.json'
import {inject} from "vue";
import Request from '@/utils/axios'
import { NButton } from 'naive-ui'

const tools = inject('tools')
const vPage = ref(null)
const editForm = ref(null)
const buildPage = ref(null)

//vatpage 列数据
let column = tools.pages.buildColumns(pageJsonData)

column.id.fixed = 'left'
column.table.fixed = 'left'

column.status.render = (row) => {
  return tools.pages.renderSwitch(row, pageJsonData.api_list.lock)
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
  width: 100,
  fixed: 'right',
  render: (row, index) => {
    const defaultColumn = handleColumn(row, index)
    return h('div', {class: 'flex gap'}, {
      default: () => {
        return [...defaultColumn, h(NButton,
            {
              size: 'tiny',
              type: 'info',
              secondary: true,
              onClick: () => {
                buildPage.value.injectData(row)
                state.buildDialogVisible = true
              }
            },
            {default: () => '编辑'}
          ),
          h(NButton,
              {
                size: 'tiny',
                type: 'primary',
                secondary: true,
                onClick: () => {
                  state.buildOptionVisible = true
                  state.buildId = row.id
                }
              },
              {default: () => '构建'}
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
  buildId: 0,
  buildOptions: ['controller', 'model', 'json', 'view', 'menu'],
  editDialogVisible: false,
  buildDialogVisible: false,
  buildOptionVisible: false,
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

function toBuild(){
  tools.notice.dialog.warning({
    title: '警告',
    content: '你确定要构建吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      Request.request(pageJsonData.api_list.build, {id: state.buildId, options: state.buildOptions}).then(res => {
        tools.notice.message.success(res.msg)
        state.buildOptionVisible = false
      }).catch(err => {
        console.log(err)
      })
    },
    onNegativeClick: () => {

    }
  })
}


/**
 * 添加编辑提交完成
 */
function toSubmit(){
  vPage.value.refresh()
}

</script>

<style scoped>

</style>