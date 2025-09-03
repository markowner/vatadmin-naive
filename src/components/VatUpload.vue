<template>
  <n-upload list-type="image-card" :action="Request.uploadAction()" :headers="Request.uploadHeaders()" :default-file-list="fileList(state.value)" @finish="uploadFinish"  @remove="uploadRemove" @error="uploadError" v-bind="props.configProps">
    <n-upload-dragger v-if="props.configProps && props.configProps.hasOwnProperty('directory-dnd')">
      <div style="margin-bottom: 12px">
        <i class="ifont i-upload-cloud"></i>
      </div>
      <n-text style="font-size: 16px">
        点击或者拖动文件到该区域来上传
      </n-text>
    </n-upload-dragger>
  </n-upload>
</template>

<script setup>
import Request from '@/utils/axios'
import {inject} from "vue";
const tools = inject('tools')

const props = defineProps({
  modelValue:{
    type: [String, Number, Object, Array, Boolean, null]
  },
  configProps:{
    type: Object,
    default: {}
  }
})

const state = reactive({
  value: props.modelValue
})


/**
 * 上传完成
 * @param options
 */
const uploadFinish = (options) => {
  console.log('上传完成', options)
  let result = JSON.parse(options.event.target.response)
  if(result.code === 200) {
    if(props.configProps.max === 1){
      state.value = result.data.path
    }else{
      if(state.value){
        state.value += ',' + result.data.path
      }else{
        state.value = result.data.path
      }
    }
    console.log('state.value', state.value)
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

/**
 * 删除文件
 * @param options
 */
const uploadRemove = (options) => {
  console.log('文件删除', options)
  let imgs = tools.common.split(state.value,',')
  imgs.splice(options.index,1)
  state.value = imgs.join(',')
}

/**
 * 展示列表
 * @param img
 * @returns {*[]}
 */
function fileList(img){
  let imgs = []
  if (img === null || img === undefined) {
    return imgs
  }
  if (!Array.isArray(img)) {
    if (img.startsWith('[')) {
      img = JSON.parse(img)
    } else {
      img = tools.common.split(img, ',')
    }
  }
  img.forEach(item => {
    imgs.push({id: item, name: item, status: 'finished', url: tools.pages.cdnUrl(item)})
  })
  return imgs
}

const emits = defineEmits(['update:modelValue', 'change'])

watch(() => props.modelValue, (newValue) => {
  state.value = newValue
})

watch(() => state.value, (newValue) => {
  emits('update:modelValue', newValue)
  emits('change', newValue)
})

</script>