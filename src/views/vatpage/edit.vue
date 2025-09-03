<template>
  <n-modal v-model:show="state.editDialogVisible" :on-after-leave="hide">
    <n-card title="添加编辑" :style="{width: props.width}">
      <template #header-extra>
        <i class="ifont i-close-circle modal-card-close" @click="hide()"></i>
      </template>
      <VatForm :list="state.formList" :rules="state.rules" v-model="state.data"></VatForm>
      <template #action>
        <n-flex justify="end">
          <n-space>
            <n-button type="tertiary" @click="reset()">重置</n-button>
            <n-button type="tertiary" @click="hide()">取消</n-button>
            <n-button type="primary" :loading="state.loading" @click="toSubmit()">提交</n-button>
          </n-space>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import Request from '@/utils/axios'
import {inject} from "vue";
const tools = inject('tools')
import VatForm from "@/components/VatForm.vue";
import pageJsonData from "@/vat/pages/vat_pages.json";

const props = defineProps({
  /**
   * 宽度
   */
  width:{
    type: String,
    default: '50%',
  },
  /**
   * 绑定值
   */
  modelValue: {
    type: Boolean,
    default: false
  }
})
/**
 * 获取表单构建JSON
 * @type {[]}
 */
let formJson = tools.pages.buildForm(pageJsonData.fields)

const state = reactive({
  //类型 add | edit
  type: 'add',
  //加载
  loading: false,
  //表单绑定值
  data: {},
  //表单构建JSON
  formList: formJson,
  //验证规则
  rules: tools.pages.buildRule(pageJsonData.fields),
  //弹框显示
  editDialogVisible: props.modelValue,
  //原始数据，用于重置
  cloneSource: {}
})

/**
 * 初始化表单数据
 */
function initData(){
  let data = {id: 0}
  formJson.forEach((v) => {
    data[v.field] = v.value
  })
  state.data = data
}
initData()

const emits = defineEmits(['update:modelValue', 'change', 'submit'])

function type(type){
  state.type = type
  return this
}

/**
 * 展示
 */
function show(){
  state.editDialogVisible = true
  emits('update:modelValue', true)
  emits('change', true)
  return this
}

/**
 * 隐藏
 */
function hide(){
  state.editDialogVisible = false
  emits('update:modelValue', false)
  emits('change', false)
  return this
}

/**
 * 重置
 */
function reset(){
  if(state.data.id){
    state.data = JSON.parse(JSON.stringify(state.cloneSource))
  }else{
    initData()
  }
}


/**
 * 注入数据
 * @param row
 */
function injectData(row){
  state.data = tools.pages.mergeObjects(state.data, row)
  state.cloneSource = JSON.parse(JSON.stringify(state.data))
  return this
}

/**
 * 提交
 */
function toSubmit(){
  if(state.loading){
    return
  }
  state.loading = true
  //请求提交接口
  Request.request(pageJsonData.api_list.edit, state.data).then(res => {
    state.loading = false
    tools.notice.message.success(res.msg)
    hide()
    emits('submit')
  }).catch(err => {
    state.loading = false
    console.log(err)
  })
}

watch(() => props.modelValue, (val) => {
  state.editDialogVisible = val
  if(!val){
    initData()
  }
})

defineExpose({
  injectData,
  type,
  show,
  hide,
  state
})
</script>