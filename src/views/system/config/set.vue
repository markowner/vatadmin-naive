<template>
  <div class="flex gap">
    <n-card title="配置组" size="small" style="width: 30%;" class="flex-shrink" :segmented="{content: true}" :content-style="{padding:0}">
      <template #header-extra>
        <i class="ifont i-add-circle-fill text-blue text-xl pointer" @click="toGroupAdd(0, {})"></i>
      </template>
      <div>
        <div v-for="(item, index) in state.groupList" :key="index" class="flex flex-jc-sb flex-ai-c" style="border-bottom:1px solid #f5f5f5;padding: 10px;">
          <div class="pointer" @click="selectGroup(item)">
            <n-button v-if="state.groupCur.id === item.id" type="primary" ghost>
              {{item.name}}({{item.code}})
            </n-button>
            <div v-else style="padding: 0 14px;height: 34px;line-height: 34px;">{{item.name}}({{item.code}})</div>
          </div>
          <div class="flex gap2">
            <i class="ifont i-edit-fill text-blue pointer" @click="toGroupAdd(1, item)"></i>
            <i class="ifont i-delete text-red pointer" @click="toDelete(item)"></i>
          </div>
        </div>
      </div>
    </n-card>
    <n-card :title="state.groupCur?.name ?? '配置项'" size="small" :segmented="{content: true}">
      <template #header-extra>
        <i class="ifont i-setting text-blue text-xl pointer" @click="toList"></i>
      </template>
      <VatForm ref="vatForm" :formGrid="true" labelPlacement="left" :gridValue="24" :bindProps="{'label-width':'86px', 'label-align':'right'}" :list="state.config.formList" v-model="state.config.formData"></VatForm>
      <template #action>
        <n-button type="primary" size="small" @click="toSubmit">保存设置</n-button>
      </template>
    </n-card>
  </div>
  <!-- 添加编辑 -->
  <configGroupEdit ref="editForm" @submit="toSubmitComplete"></configGroupEdit>
  <VatModal title="配置管理" ref="listForm" width="80%" :draggable="true">
    <ConfigList></ConfigList>
  </VatModal>
</template>
<script setup>
  import {inject} from "vue"
  import { NButton } from 'naive-ui'
  import Request from '@/utils/axios'
  // import VatPage from "@/components/VatPage.vue"
  import VatModal from "@/components/VatModal.vue"
  import VatForm from "@/components/VatForm.vue"
  import configGroupEdit from "./../configGroup/edit.vue"
  import ConfigList from "./index.vue"
  import pageJsonData from '@/vat/pages/vat_admin_config.json'

  const tools = inject('tools')
  const vPage = ref(null)
  const editForm = ref(null)
  const listForm = ref(null)

  //构建数据列
  let column = tools.pages.buildColumns(pageJsonData)

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

  column.handle = {
    title: '操作',
    key: 'handle',
    width: 100,
    fixed: 'right',
    render: (row, index) => {
      const defaultColumn = handleColumn(row, index)
      return h('div', {class: 'flex gap'}, {
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
      tools: pageJsonData.tools
    },
    groupList: [],
    groupCur: {},
    config:{
      total: 0,
      list: [],
      formList: [],
      formData: {}
    }
  })

  /**
   * tools组件change事件
   * @param type
   * @param event
   * @param ids
   */
  function toolsChange(type, event, ids){
    switch(type){
      case 'add':
        editForm.value.type('add').show()
        break;
      case 'batch':
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
    // vPage.value.refresh()
    groupList()
  }

  function groupList(){
    Request.request(pageJsonData.api_list.groupList, {}).then(res => {
      state.groupList = res.data.list
      if(res.data.list.length > 0){
        state.groupCur = res.data.list[0]
      }
    }).catch(err => {
      console.log(err)
    })
  }

  groupList()

  function toGroupAdd(type, item){
    if(type === 0){
      editForm.value.type('add').show()
    }else{
      editForm.value.type('edit').injectData(item).show()
    }
  }

  function selectGroup(item){
    state.groupCur = item
  }

  function toList(){
    listForm.value.show()
  }

  function buildForm(rows){
    let form = []
    let data = {}
    rows.forEach(v => {
      form.push({
        label: v.name,
        field: v.code,
        type: v.view,
        placeholder: ['input', 'input_number','password', 'textarea'].includes(v.view) ? '请输入' + v.name : '请选择' + v.name,
        value: v.value,
        config: v.view_option,
        form_order: v.sortrank
      })
      data[v.code] = v.value
    })
    state.config.formData = data

    return form
  }

  function getConfig(){
    Request.request(pageJsonData.api_list.list, {size: 30, order: 'sortrank ASC', filter:JSON.stringify({group_id: state.groupCur.id})}).then(res => {
      state.config.list = res.data.list
      state.config.total = res.data.total
      state.config.formList = buildForm(res.data.list)
    }).catch(err => {
      console.log(err)
    })
  }

  function toSubmit(){
    Request.request(pageJsonData.api_list.editMore, {data:JSON.stringify(state.config.formData)}).then(res => {
      tools.notice.message.success(res.msg)
    }).catch(err => {
      console.log(err)
    })
  }

  function toDelete(row){
    tools.notice.dialog.warning({
      title: '警告',
      content: '你确定要删除此数据吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Request.request(pageJsonData.api_list.deleteGroup, {ids: row.id}).then(res => {
          tools.notice.message.success(res.msg)
          groupList()
        }).catch(err => {
          console.log(err)
        })
      },
      onNegativeClick: () => {

      }
    })
  }


  watch(() => state.groupCur, (newVal) => {
    getConfig()
  }, {deep:true})
</script>