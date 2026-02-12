<template>
  <template v-if="state.config.type == 'input'">
    <n-input type="text" v-model:value="state.value" :placeholder="state.config.placeholder" clearable v-bind="state.config.config.props" />
  </template>
  <template v-if="state.config.type == 'input-pair'">
    <n-input pair v-model:value="state.value" :placeholder="state.config.placeholder || ['从','到']" clearable v-bind="state.config.config.props" />
  </template>
  <template v-if="state.config.type == 'input_number'">
    <n-input-number v-model:value="state.value" :placeholder="state.config.placeholder" clearable v-bind="state.config.config.props" />
  </template>
  <template v-if="state.config.type == 'input_dynamic'">
    <n-dynamic-input
        v-model:value="state.value"
        preset="pair"
        key-placeholder="键"
        value-placeholder="值"
        v-bind="state.config.config.props"
    />
  </template>
  <template v-else-if="state.config.type == 'hidden'">
    <input type="hidden" class="filter-item" v-model="state.value" />
  </template>
  <template v-if="state.config.type == 'password'">
    <n-input type="password" :input-props="{autocomplete:''}" show-password-on="mousedown" v-model:value="state.value" clearable :placeholder="state.config.placeholder" />
  </template>
  <template v-else-if="state.config.type == 'textarea'">
    <n-input type="textarea" v-model:value="state.value" :placeholder="state.config.placeholder" clearable :autosize="{minRows: 3, maxRows: 5}"/>
  </template>
  <template v-else-if="state.config.type == 'switch'">
    <n-switch v-model:value="state.value" :checked-value="state.config.config.map.checked" :unchecked-value="state.config.config.map.unchecked" />
  </template>
  <template v-else-if="state.config.type == 'select' || state.config.type == 'dict'">
    <n-select
        v-model:value="state.value"
        :placeholder="state.config.placeholder"
        :options="state.config.config.options"
        clearable
        v-bind="state.config.config.props"
    />
  </template>
  <template v-else-if="state.config.type == 'radio'">
    <n-radio-group v-model:value="state.value" :name="state.config.field">
      <n-space>
        <n-radio v-for="(item, index) in state.config.config.options"  :key="index" :label="item.label" :value="item.value" />
      </n-space>
    </n-radio-group>
  </template>
  <template v-else-if="state.config.type == 'radio_button'">
    <n-radio-group v-model:value="state.value" :name="state.config.field">
      <n-radio-button v-for="(item, index) in state.config.config.options"  :key="index" :label="item.label" :value="item.value" />
    </n-radio-group>
  </template>
  <template v-else-if="state.config.type == 'checkbox'">
    <n-checkbox-group v-model:value="state.value" :name="state.config.field">
      <n-space>
        <n-checkbox v-for="(item, index) in state.config.config.options" :key="index" :label="item.label" :value="item.value" />
      </n-space>
    </n-checkbox-group>
  </template>
  <template v-else-if="state.config.type == 'checkbox_button'">
    <n-checkbox-group v-model:value="state.value" :name="state.config.field">
      <n-space>
        <n-checkbox v-for="(item, index) in state.config.config.options" :key="index" :label="item.label" :value="item.value" />
      </n-space>
    </n-checkbox-group>
  </template>
  <template v-else-if="state.config.type == 'json_editor'">
    <JsonEditorVue ref="jsonEditor" v-model="state.value" v-bind="state.options" style="width: 100%; max-height: 500px; overflow-y: auto;" />
  </template>
  <template v-else-if="state.config.type == 'datepicker'">
    <n-date-picker v-model:formatted-value="state.value" :format="state.config.config.format || null" :value-format="state.config.config.format || null" :type="state.config.config.form_type" clearable style="width: 100%;"/>
  </template>
  <template v-else-if="state.config.type == 'treeselect'">
    <n-tree-select
        v-model:value="state.value"
        :placeholder="state.config.placeholder || ''"
        :options="state.config.config.options"
        clearable
        v-bind="state.config.config.props"
    />
  </template>
  <template v-else-if="state.config.type == 'cascader'">
    <n-cascader
        v-model:value="state.value"
        :placeholder="state.config.placeholder || ''"
        :expand-trigger="state.config.config.trigger || 'hover'"
        :options="state.config.config.options"
        :check-strategy="state.config.config.strategy || 'all'"
        :show-path="state.config.config.showPath || false"
        :filterable="state.config.config.filterable || true"
        clearable
        v-bind="state.config.config.props"
    />
  </template>
  <template v-else-if="state.config.type == 'editor'">
    <VatEditor v-model="state.value" v-bind="state.config.config.props"></VatEditor>
  </template>
  <template v-else-if="state.config.type == 'markdown'">
    <VatMarkdown v-model="state.value" :config="state.config.config.props"></VatMarkdown>
  </template>
  <template v-else-if="state.config.type == 'form_table'">
    <VatFormTable v-model="state.value" v-bind="state.config.config.props"></VatFormTable>
  </template>
  <template v-else-if="state.config.type == 'upload'">
    <n-upload :action="Request.uploadAction()" :headers="Request.uploadHeaders()" :default-file-list="fileList(state.value)" v-bind="state.config.config.props" @finish="uploadFinish"  @remove="uploadRemove" @error="uploadError">
      <n-upload-dragger v-if="state.config.config.props && state.config.config.props.hasOwnProperty('directory-dnd')">
        <div style="margin-bottom: 12px">
          <i class="ifont i-upload-cloud"></i>
        </div>
        <n-text style="font-size: 16px">
          点击或者拖动文件到该区域来上传
        </n-text>
      </n-upload-dragger>
    </n-upload>
  </template>
  <template v-else-if="state.config.type == 'icons'">
    <div class="flex flex-center icon-box" @click="toIcons"><i v-if="state.value" class="ifont " :class="['i-' + state.value]" style="font-size: 24px;"></i></div>
    <VatIcons ref="vatIcons" v-model="state.value"></VatIcons>
  </template>
  <template v-else-if="state.config.type == 'select_page'">
    <VatSelectPage v-model="state.value" :configs="state.config" v-bind="state.config.config.props"></VatSelectPage>
  </template>
</template>

<script setup>
import Request from '@/utils/axios'
import JsonEditorVue from 'json-editor-vue'
import VatEditor from "./VatEditor.vue";
import VatMarkdown from "./VatMarkdown.vue";
import VatFormTable from "./VatFormTable.vue";
import VatIcons from "./VatIcons.vue";
import VatSelectPage from "./VatSelectPage.vue";
import {inject} from "vue";

const tools = inject('tools')
const props = defineProps({
  /**
   * 表单单个元素JSON
   */
  config: {
    type: Object,
    default: () => {
      return {}
    }
  },
  modelValue: {
    type: [String, Number, Object, Array, Boolean, null]
  }
})
const jsonEditor = ref(null)
const vatIcons = ref(null)

const state = reactive({
  config: props.config,
  value: props.modelValue,
  editor: null,
  options: {
    mode: 'text',  // 默认模式：代码模式
    navigationBar: false, // 默认隐藏导航栏
    mainMenuBar: true,
    flattenColumns: false,
    stringified: true,
    onChange: (val) => {
    }
  }
})

//拉取api数据
function init() {
  if (props.config.config.api) {
    Request.request(props.config.config.api, props.config.config.api_params || {}).then(res => {
      state.config.config.options = res.data.list
    }).catch(err => {
      console.log(err)
    })
  }
}

init()

/**
 * 上传完成
 * @param options
 */
const uploadFinish = (options) => {
  console.log('上传完成', options)
  let result = JSON.parse(options.event.target.response)
  if (result.code === 200) {
    if (state.config.config.props.max === 1) {
      state.value = result.data.path
    } else {
      if (state.value) {
        state.value += ',' + result.data.path
      } else {
        state.value = result.data.path
      }
    }
    tools.notice.message.success(result.msg)
  } else {
    tools.notice.message.error(result.msg)
  }
}

/**
 * 上传成功
 * @param options
 */
const uploadError = (options) => {
  console.log('上传失败', options)
  tools.notice.message.error('上传失败：' + options.file.name)
}

/**
 * 删除文件
 * @param options
 */
const uploadRemove = (options) => {
  console.log('文件删除', options)
  let imgs = []
  if (state.value.startsWith('[')) {
    imgs = JSON.parse(state.value)
  } else {
    imgs = tools.common.split(state.value, ',')
  }

  imgs.splice(options.index, 1)
  state.value = imgs.join(',')
}

/**
 * 展示列表
 * @param img
 * @returns {*[]}
 */
function fileList(img) {
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

/**
 * 展示图标组件
 */
function toIcons(){
  vatIcons.value.show()
}

const emits = defineEmits(['update:modelValue', 'change'])

watch(() => props.modelValue, (newValue) => {
  state.value = newValue
})

watch(() => props.config, (newValue) => {
  state.config = newValue
})


watch(() => state.value, (newValue) => {
  emits('update:modelValue', newValue)
  emits('change', newValue)
})

</script>
<style>
.n-input-number {
  width: 100%;
}
.icon-box{
  width: 34px;height: 34px; border: 1px solid rgb(224, 224, 230); box-sizing: border-box; cursor: pointer;border-radius: 2px;
}
</style>