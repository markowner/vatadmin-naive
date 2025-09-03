<template>
  <MdEditor v-model="state.value" :previewTheme="props.theme" :codeTheme="state.codeTheme" v-bind="props.configs"/>
</template>
<script setup>
/**
 * https://github.com/imzbf/md-editor-v3
 * https://imzbf.github.io/md-editor-v3/zh-CN/
 */
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'default' //default、github、vuepress、mk-cute、smart-blue、cyanosis
  },
  codeTheme: {
    type: String,
    default: 'atom' //atom、a11y、github、gradient、kimbie、paraiso、qtcreator、stackoverflow
  },
  configs:{
    type: Object,
    default: {}
  }
})

const state = reactive({
  value: props.modelValue
})

const emits = defineEmits(['change', 'update:modelValue']);

watch(props.modelValue, (val) => {
  state.value = val
})


</script>
<style lang="scss" scoped>

</style>