<template>
  <!-- 列表 -->
    <div style="width: 100%;">
      <n-select v-model:value="state.value" :options="state.list" :multiple="props.multiple" clearable menu-size="small" v-bind="props.configs.config?.childProps" :placeholder="props.configs?.placeholder" @update:value="toEmit" :loading="state.loading">
        <template #header>
          <!-- <VatSearch :list="state.pageJson.fields" @search="toSearch"></VatSearch> -->
          <div style="display: flex;gap:5px;">
            <n-input v-model:value="state.search" placeholder="请输入搜索内容" clearable @keydown.space.stop></n-input>
            <n-button type="primary" @click="toSearch" style="flex-shrink: 0;">搜索</n-button>
          </div>
        </template>
        <template #action>
          <n-pagination
          v-model:page="state.query.page"
          v-model:page-size="state.query.size"
          :item-count="state.total"
          :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500]"
          :page-slot="5" 
          :display-order="['size-picker','pages']"
          @update:page="onPageChange"
          :simple="true"
          @update:page-size="onPageSizeChange"
          >
          </n-pagination>
        </template>
      </n-select>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import Request from '@/utils/axios'
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
   * 是否多选
   */
  multiple: {
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
  /**
   * 每页数量
   */
  pageSize: {
    type: Number,
    default: 10
  }
})

const pageJsonData = ref(null)


//获取数据
function getList(){
  let params = {
    ...state.query,
    filter: state.search ? JSON.stringify({[props.rowShowField]: state.search}) : ""
  }
  state.loading = true
  Request.request(pageJsonData.value.api_list.list, params).then(res => {
    state.list = formatToOptions(res.data.list, props.rowShowField)
    state.total = res.data.total
    state.loading = false
  }).catch(err => {
    console.log(err)  
    state.loading = false
  })
}

function formatToOptions(list, showField){
    let options = []
    list.forEach(item => {
        options.push({
            label: item[showField],
            value: item[props.rowKey] + ''
        })
    })
    console.log(options)
    return options
}

function toSearch(){
  state.query.page = 1
  getList()
}

const state = reactive({
    value: props.multiple ? [] : '',
    search: '',
    query:{
      page: 1,
      size: props.pageSize,
      filter: ""
    },
    list:[],
    total: 0,
    loading: false
})

function setValue(){
  if(props.multiple){
    state.value = props.modelValue ? props.modelValue instanceof Array ? props.modelValue : [props.modelValue] : []
  }else{
    state.value = props.modelValue ? props.modelValue + '' : null
  }
  console.log('state.value', state.value)
}
setValue()

const emit = defineEmits(['update:modelValue'])

function onPageChange(){
  getList()
}
function onPageSizeChange(pageSize){
  state.query.page = 1
  getList()
}

function toEmit(){
  console.log('state.value', state.value)
  if(props.multiple){
    emit('update:modelValue', state.value.join(','))
  }else{
    emit('update:modelValue', state.value || '')
  }
}

async function loadPageJsonData(pageName){
  try {
    const module = await import(`/src/vat/pages/${pageName}.json`);
    // JSON 文件默认导出，所以取 module.default
    const pageJsonData = module.default;
    return pageJsonData;
  } catch (error) {
    console.error(`加载 ${pageName}.json 文件失败：`, error);
    // 加载失败时返回空对象，避免组件报错
    return {};
  }
}

onMounted(async () => {
  // 组件挂载后，根据传入的 pageName 动态加载数据
  pageJsonData.value = await loadPageJsonData(props.pageName);
  getList()
  // 此时 this.pageJsonData 就是 vat_admin_dict.json 的内容
  console.log('动态加载的 JSON 数据：', pageJsonData.value);
})


// 监听 pageName 变化，动态加载 JSON
// watch(() => props.pageName, async (newPage) => {
//   console.log(newPage)
//   if (!newPage) return
//   try {
//     // 注意：路径前缀必须写死，只将文件名部分作为变量
//     state.loading = true
//     pageJsonData.value = await loadPageJsonData(props.pageName);
//     state.loading = false
//     getList()
//   } catch (err) {
//     console.error('加载 JSON 失败:', err)
//   }
// }, { immediate: true }) // 立即执行一次

</script>
