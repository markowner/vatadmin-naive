<template>
  <!-- 列表 -->
    <div style="width: 100%;">
        <n-popover trigger="manual" :show="state.dialogVisible">
            <template #trigger>
                <n-input readonly :modelValue="state.valueShow" :placeholder="props.configs?.placeholder" @click="open" style="width: 100%;"></n-input>
            </template>
            <div>
                <VatPage
                    ref="vPage"
                    :fields="state.pageJson.fields"
                    :api-list="state.pageJson.api"
                    :columns="state.pageJson.columns"
                    :tools="state.pageJson.tools"
                    :settings="state.pageJson.settings"
                    :row-key="props.rowKey">
                </VatPage>
                <div>{{ state.valueShow }}</div>
            </div>
            <template #footer>
                <n-flex justify="flex-end">
                <n-button type="default" size="small" color="#b2b2b2" @click="state.dialogVisible = false">关闭</n-button>
                <n-button type="default" size="small" @click="cancelChooseClick">清空</n-button>
                <n-button type="primary" size="small" @click="confirmChooseClick">确认</n-button>
                </n-flex>
            </template>
        </n-popover>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import pageJsonData from '@/vat/pages/vat_admin_role.json'
import { config } from 'md-editor-v3'
const tools = inject('tools')
const props = defineProps({
    /**
     * 页面名称
     */
  pageName: {
    type: String,
    default: () => {
      return ''
    },
    required: true
  },
  /**
   * 显示字段
   */
  displayFields: {
    type: [String, Array],
    default: () => {
      return []
    }
  },
  /**
   * 是否多选
   */
  multi: {
    type: Boolean,
    default: () => {
      return false
    }
  },
  /**
   * 搜索值
   */
  modelValue: {
    type: [Array, String, Number],
    default: () => {
      return []
    }
  },
   /**
   * 配置项
   */
  configs: {
    type: Object,
    default: () => {
      return {}
    }
  },
  /**
   * 行key
   */
  rowKey: {
    type: String,
    default: 'id'
  },
  /**
   * 行key
   */
  rowShowField: {
    type: String,
    default: 'name'
  },
})

console.log(props.configs)
const vPage = ref(null)
//加载pageJsonData
// let pageJsonData = {}
// const module = await import(`@/vat/pages/${props.pageName}.json`)
// const pageJsonData = module.default

let column = tools.pages.buildColumns(pageJsonData)
//获取当前路由参数
let settings = {}
let query = router.currentRoute.value.query
if(query?.settings){
    settings = JSON.parse(query.settings)
}

//过滤显示字段
let displayFields = []
props.displayFields.forEach((field) => {
    if(column?.[field]){
        displayFields.push(column[field])
    }
})
console.log(displayFields)
pageJsonData.tools.add.show = false
pageJsonData.tools.delete.show = false
pageJsonData.tools.download.show = false
pageJsonData.tools.import.show = false
pageJsonData.tools.batch.show = false
pageJsonData.tools.lock.show = false
pageJsonData.tools.unlock.show = false
displayFields.unshift({'type': 'selection', fixed: 'left', key: 'selection', title: '选择', multiple: props.multi})
// console.log(pageJsonData.setting)
const state = reactive({
    dialogVisible: false,
    value: props.modelValue instanceof Array ? props.modelValue : [props.modelValue],
    valueShow: '',
    pageJson: {
        api: pageJsonData.api_list,
        columns: tools.pages.sortColumns(displayFields),
        fields: tools.pages.buildSearch(pageJsonData.fields),
        tools: pageJsonData.tools,
        settings: {
            ...pageJsonData.settings,
            ...settings
        }
    }
})
console.log(state.pageJson)

const emit = defineEmits(['update:modelValue'])

function confirmChooseClick(){
    //获取选中行数据
    let selectedRows = vPage.value.tableIds()
    if(selectedRows.length == 0){
        tools.notice.message.error('请先选择数据')
        return
    }
    console.log(selectedRows)
    let selectedKeys = []
    //确认选择
    if(props.rowKey == ''){
        state.valueShow = selectedRows.map((item) => {
            let row = {}
            if(typeof item == 'string'){
                row = JSON.parse(item)
            }
            selectedKeys.push(row[props.rowKey])
            return row[props.rowShowField]
        }).join(',')
    }else{
        selectedKeys = selectedRows
        state.valueShow = selectedRows.join(',')
    }

    emit('update:modelValue', props.multi ? selectedKeys : selectedKeys[0] || '')
    state.dialogVisible = false
}

function cancelChooseClick(){
    //取消选择
    state.valueShow = ''
    emit('update:modelValue', [])
    state.dialogVisible = false
}
function open(){
    state.dialogVisible = true
    nextTick(() => {
        vPage.value.setSelectionIds(state.value)
    })
}

function detail(){
    pageJsonData.api_list.list
    Request.request(pageJsonData.api_list.download, {filter: JSON.stringify(vPage.value.state.params)}).then(res => {
    tools.notice.message.success(res.msg)
    }).catch(err => {
    console.log(err)
    })
}

watch(() => props.modelValue, (newVal, oldVal) => {
    console.log(newVal, oldVal)
    if(newVal != oldVal){
        if(newVal){
            state.value = newVal instanceof Array ? newVal : tools.common.isNumeric(newVal) ? [tools.common.toNumber(newVal)] : [newVal]
        }else{
            state.value = []
        }
    }
}, {deep: true, immediate: true})

</script>
