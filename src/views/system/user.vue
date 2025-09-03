<template>
  <VatPage ref="vPage" name="user" :fields="state.pageJson.fields" :api-url="state.pageJson.api" :columns="state.pageJson.columns" :tools="state.pageJson.tools" @toolsChange="toolsChange">
    <template #tools_left_append>
      <n-upload action="https://www.mocky.io/v2/5e4bafc63100007100d8b70f" :headers="{'naive-info': 'hello!'}" :data="{'naive-data': 'cool! naive!'}">
        <n-button type="warning" size="small">
          <template #icon>
            <i class="ifont i-upload"></i>
          </template>
          导入2
        </n-button>
      </n-upload>
    </template>
    <template #tools_right_append>
      <n-button circle type="warning" size="small">
        <template #icon>
          <i class="ifont i-upload"></i>
        </template>
      </n-button>
    </template>
  </VatPage>
</template>

<script setup>
import VatPage from "../../components/VatPage.vue";
import pageJsonData from '../../../../config/pages/user.json'
import {inject} from "vue";
const tools = inject('tools')
const api = inject('api')
const vPage = ref(null)
import Request from '@/utils/axios'
import { NAvatar, NButton, NImage } from 'naive-ui'

//批量选项
pageJsonData.tools.batch.options = [
  {label: '批量选品', key: 'select1', 'icon': tools.menuFormat.renderIcon('batch1')},
  {label: '批量上架', key: 'select2', 'icon': tools.menuFormat.renderIcon('batch1')},
]
let column = tools.pages.buildColumns2(pageJsonData.fields)
//格式化列操作
column.avatar.render = (row, index) => {
  return h(NAvatar, {size: 'small', src: row.avatar})
  // return h(NImage, {width: '60px', height:'60px', src: row.avatar})
}

column.roles_name.render = (row) => {
  return tools.pages.renderTags(row.roles_name)
}

column.status.render = (row) => {
  // return tools.pages.renderSwitch(row, api.api_list.pages.user.lock)
  return tools.pages.renderTextColor([0,1,1,1,1], row.status, row.status_desc)
}

column.handle = {
  title: '操作',
  key: 'handle',
  render: (row, index) => {
    return [
      h(NButton,
          {
            size: 'tiny',
            type: 'info',
            style: "margin-right:10px;",
            onClick: () => {
              tools.notice.message.success('弹出编辑页面')
            }
          },
          {default: () => '编辑'}
      ),
      h(NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => {
              tools.notice.message.success('我要删除')
            }
          },
          {default: () => '删除'}
      )
    ]
  }
}

const state = reactive({
  pageJson: {
    api: api.api_list.pages.user.list,
    columns: tools.pages.sortColumns(Object.values(column)),
    fields: tools.pages.buildSearch(pageJsonData.fields),
    tools: pageJsonData.tools
  }
})

// state.pageJson.columns

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
      tools.notice.message.success('弹出添加页面')
      break;
    case 'batch':
      console.log('ids', ids)
      if(ids.length < 1){
        return tools.notice.message.error('请先选择')
      }
      tools.notice.message.success('批量操作' + event + ids)
      break;
    case 'download':
      api.api_list.pages.user.download.url += event
      Request.request(api.api_list.pages.user.download, {filter: JSON.stringify(vPage.value.state.params)}).then(res => {
        tools.notice.message.success(res.msg)
      }).catch(err => {
        console.log(err)
      })
      break;
    default:
       break;
  }
}
</script>

<style scoped>

</style>