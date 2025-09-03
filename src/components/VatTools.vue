<template>
  <div class="flex flex-ai-c flex-jc-sb vat-tools">
    <div class="left">
      <div class="flex gap">
        <n-button type="primary" size="small" v-if="props.tools?.add.show && checkPermission(props.tools.add.permission_key)" @click="toChange('add')">
          <template #icon>
            <i class="ifont i-add"></i>
          </template>
          增加
        </n-button>
        <n-button type="success" size="small" v-if="props.tools?.unlock?.show && checkPermission(props.tools?.unlock.permission_key)" @click="toChange('unlock')">
          <template #icon>
            <i class="ifont i-unlock"></i>
          </template>
          解锁
        </n-button>
        <n-button type="warning" size="small" v-if="props.tools?.lock?.show && checkPermission(props.tools?.lock.permission_key)" @click="toChange('lock')">
          <template #icon>
            <i class="ifont i-lock"></i>
          </template>
          锁定
        </n-button>
        <n-button type="error" size="small" v-if="props.tools?.delete.show && checkPermission(props.tools?.delete.permission_key)" @click="toChange('delete')">
          <template #icon>
            <i class="ifont i-del"></i>
          </template>
          删除
        </n-button>
        <n-upload :show-file-list="false" :action="state.uploadUrl" :headers="state.uploadHeaders" :data="state.uploadParams" @finish="uploadFinish" @error="uploadError">
          <n-button type="warning" size="small" v-if="props.tools?.import.show && checkPermission(props.tools?.import.permission_key)" @click="toChange('import')">
            <template #icon>
              <i class="ifont i-upload"></i>
            </template>
             导入
          </n-button>
        </n-upload>
        <slot name="left_append"></slot>
        <n-dropdown :options="props.tools?.batch?.options" v-if="props.tools?.batch.show && checkPermission(props.tools?.batch.permission_key)" @select="toChange('batch', $event)">
          <n-button type="info" size="small" color="#2c3e50">
            <template #icon>
              <i class="ifont i-batch"></i>
            </template>
            批量操作
          </n-button>
        </n-dropdown>
      </div>
    </div>
    <div class="right flex gap">
      <slot name="right_append"></slot>
      <n-button ghost circle size="small" v-if="props.tools?.refresh.show" @click="toChange('refresh')">
        <template #icon>
          <i class="ifont i-refresh"></i>
        </template>
      </n-button>
      <n-dropdown :options="props.tools?.download.options" v-if="props.tools?.download.show && checkPermission(props.tools?.download.permission_key)" @select="toChange('download', $event)">
        <n-button ghost circle size="small">
          <template #icon>
            <i class="ifont i-download"></i>
          </template>
        </n-button>
      </n-dropdown>
      <n-popover placement="bottom" trigger="click">
        <template #trigger>
          <n-button ghost circle size="small">
            <template #icon>
              <i class="ifont i-table-column"></i>
            </template>
          </n-button>
        </template>
        <div class="large-text">
          <n-checkbox-group v-model:value="state.columns">
            <div v-for="(item, index) in props.columns" :key="index">
              <n-checkbox v-if="item.hasOwnProperty('key')" :value="item.key" :label="item.title" />
            </div>
          </n-checkbox-group>
        </div>
      </n-popover>
      <n-button ghost circle size="small" v-if="props.tools?.search.show" @click="toChange('search')">
        <template #icon>
          <i class="ifont i-search"></i>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, watch, reactive, inject} from 'vue'
import Request from '@/utils/axios'
const tools = inject('tools')
const props = defineProps({
  /**
   * api路由List
   */
  apiList: {
    type: Object ,
    default: () => {
      return {}
    }
  },
  tools: {
    type: Object,
    default: () => {
      return {}
    }
  },
  columns: {
    type: Array,
    default: []
  },
  selection: {
    type: Boolean,
    default: false
  },
  selectionProps: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

props.selection && props.columns.unshift(Object.assign({'type': 'selection', fixed: 'left', key: 'selection', title: '全选', width: 60}, props.selectionProps))

const uploadUrl = props.tools.import.api ? import.meta.env.VITE_APP_PROXY_PREFIX + props.tools.import.api :  (import.meta.env.VITE_APP_PROXY_PREFIX + props.apiList.import.url || Request.uploadAction())

const state = reactive({
  uploadHeaders: Request.uploadHeaders(),
  uploadUrl: uploadUrl,
  uploadParams: props.tools.import.params ? {params: JSON.stringify(props.tools.import.params)} : {},
  permissionKeys: tools.data.get('Vat-Views'),
  columns: []
})

const emits = defineEmits(['change', 'column-change'])


function initColumn(){
  let options = []
  props.columns.forEach(column => {
    if(column.hasOwnProperty('key')){
      options.push(column.key)
    }
  })
  state.columns = options
}
initColumn()

/**
 * 点击change事件
 * @param type
 */
function toChange(type, event){
  emits('change', type, event)
}

/**
 * 上传完成
 * @param options
 */
const uploadFinish = (options) => {
  console.log('上传完成', options)
  let result = JSON.parse(options.event.target.response)
  if(result.code === 200) {
    tools.notice.message.success(result.msg)
  }else{
    tools.notice.message.error(result.msg)
  }
}

/**
 * 上传成功
 * @param options
 */
const uploadError = (options) => {
  console.log('上传失败', options)
  tools.notice.message.error('上传失败：'+ options.file.name)
}

function checkPermission(permissionKey){
  return state.permissionKeys.includes(permissionKey)
}

watch(() => state.columns, (newVal) => {
  emits('column-change', newVal)
}, {deep: true, immediate: true})

</script>

<style lang="scss" scoped>
.vat-tools{
  //padding: 0 5px;
  & i{
    font-size: 14px;
  }
}
</style>