<template>
  <n-modal v-model:show="state.editDialogVisible" :on-after-leave="hide">
    <n-card title="设置权限" :style="{width: props.width}">
      <template #header-extra>
        <i class="ifont i-close-circle modal-card-close" @click="hide()"></i>
      </template>
      <n-tree
          show-line
          block-line
          :data="state.menusData.list"
          :default-checked-keys="state.menusData.selected"
          expand-on-click
          check-on-click
          checkable
          multiple
          selectable
          :render-suffix="renderSuffix"
          :watch-props="['defaultCheckedKeys']"
          @update:checked-keys="checkedChange"
          style="height: 400px;overflow-y: scroll"
      />
      <template #action>
        <n-flex justify="end">
          <n-space>
            <n-button type="tertiary" @click="hide()">取消</n-button>
            <n-button type="primary" :loading="state.loading" @click="toSubmit">提交</n-button>
          </n-space>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import {inject} from "vue"
import Request from '@/utils/axios'
import pageJsonData from "@/vat/pages/vat_admin_role.json"
import { NCheckbox } from "naive-ui";

const tools = inject('tools')
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

const state = reactive({
  //加载
  loading: false,
  //表单绑定值
  data: {
    role_id: 0,
    selected:[]
  },
  menusData: {},
  checkedKeys: [],
  //弹框显示
  editDialogVisible: props.modelValue,
})

const emits = defineEmits(['update:modelValue', 'change', 'submit'])


function initData(){
  //请求数据
  Request.request(pageJsonData.api_list.roleMenus, state.data).then(res => {
    state.menusData = res.data
    state.data.selected = res.data.selected
  }).catch(err => {
    console.log(err)
  })
}

function checkedChange(keys){
  state.data.selected = keys
}

// 递归获取所有子节点 keys
const getAllChildKeys = (node) => {
  const keys = []
  if (node.children) {
    node.children.forEach(child => {
      keys.push(child.key)
      keys.push(...getAllChildKeys(child))
    })
  }
  return keys
}

// 检查节点状态
const getCheckState = (node) => {
  const childKeys = getAllChildKeys(node)
  if (childKeys.length === 0) return 'none'

  const checkedCount = childKeys.filter(key =>
      state.menusData.selected.includes(key)
  ).length

  if (checkedCount === 0) return 'none'
  if (checkedCount === childKeys.length) return 'all'
  return 'some'
}

const handleCheckboxClick = (node) => {
  const childKeys = getAllChildKeys(node)
  const currentState = getCheckState(node)

  //添加自己
  childKeys.push(node.key)
  if (currentState === 'all') {
    // 移除所有子节点 keys
    state.menusData.selected = state.data.selected = state.menusData.selected.filter(
        key => !childKeys.includes(key)
    )
  } else {
    // 添加未选中的子节点 keys
    const newKeys = childKeys.filter(
        key => !state.menusData.selected.includes(key)
    )
    state.menusData.selected = [...state.menusData.selected, ...newKeys]
    state.data.selected = [...state.menusData.selected, ...newKeys]
  }
}


const renderSuffix = ({ option }) => {
  const state = getCheckState(option)
  const hasChildren = option.children?.length > 0

  return h(NCheckbox, {
    indeterminate: state === 'some',
    checked: state === 'all',
    disabled: !hasChildren,
    label: "全选",
    onClick: (e) => {
      e.stopPropagation()
      if (hasChildren) handleCheckboxClick(option)
    },
    style: { marginLeft: '8px' }
  })
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
 * 注入数据
 * @param row
 */
function injectData(row){
  state.data = tools.pages.mergeObjects(state.data, row)
  return this
}

/**
 * 提交
 */
function toSubmit(e){
  if(state.loading){
    return
  }
  state.loading = true
  Request.request(pageJsonData.api_list.roleMenuSubmit, state.data).then(res => {
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
})

watch(() => state.editDialogVisible, (val) => {
  if(val){
    initData()
  }
})

defineExpose({
  injectData,
  show,
  hide,
  state
})
</script>