<template>
    <VatModal v-model="state.visible" title="选择图标" :width="props.width">
      <template #footer>
        <n-flex justify="space-between" >
          <div>
            <div class="flex flex-center pointer icon-box" :title="item" ><i class="ifont" :class="['i-' + props.modelValue]" style="font-size: 24px"></i></div>
          </div>
          <n-button 
            color="#999999"
            @click="clearSelection"
            v-show="props.modelValue"
          >
            取消选择
          </n-button>
        </n-flex>
      </template>
      
      <div style="margin-bottom: 16px;">
        <n-input
          v-model:value="state.search"
          placeholder="搜索图标..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <i class="ifont i-search"></i>
          </template>
        </n-input>
      </div>
      <div style="height: 40vh; overflow-y: auto;">
        <n-flex style="gap: 10px;">
          <template class="pointer" v-for="item in filteredList">
            <div class="flex flex-center pointer icon-box" @click="toSelect(item)" :title="item" ><i class="ifont" :class="['i-' + item]" style="font-size: 24px"></i></div>
          </template>
          <div v-if="filteredList.length === 0" style="padding: 40px; text-align: center; color: #999;">
            未找到匹配的图标
          </div>
        </n-flex>
      </div>
    </VatModal>
</template>
<script setup>
import { reactive, computed, onMounted } from 'vue'
import VatModal from "./VatModal.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: '80%'
  }
})

const state = reactive({
  visible: false,
  search: '',
  list: [
    "ziliao",
    "material",
    "link",
    "link1",
    "link2",
    "image",
    "image-fill",
    "image1",
    "image2",
    "file",
    "file1",
    "table-column",
    "table-column2",
    "table-column1",
    "shop1",
    "diamond-mall",
    "bag",
    "shop3",
    "point-mall",
    "bag1",
    "shop2",
    "cart",
    "shop",
    "point-mall-1",
    "cart-fill",
    "jupin",
    "pin",
    "monitor3",
    "monitor1",
    "monitor2",
    "monitor",
    "monitor3-fill",
    "fuzhi",
    "copy",
    "fuzhi1",
    "fuzhi-fill",
    "copy1",
    "fuzhi2",
    "fuzhi3",
    "page",
    "page3",
    "page2",
    "page1",
    "book",
    "book2",
    "dict2",
    "dict1",
    "dict",
    "department",
    "department1",
    "department2",
    "department3",
    "batch",
    "batch1",
    "batch2",
    "batch3",
    "more-circle",
    "more",
    "star-fill",
    "star",
    "boundary-left",
    "boundary-right",
    "kefu",
    "phone-consult1",
    "kefu1",
    "kefu2",
    "consult-fill",
    "consult",
    "phone-consult",
    "radio-checked",
    "checkbox-checked",
    "checkbox-checked-fill",
    "checked",
    "checked-fill",
    "refresh",
    "refresh-1",
    "refresh-2",
    "refresh-3",
    "refresh-4",
    "moon",
    "moon-fill",
    "sun",
    "sun-fill",
    "moon-star",
    "quit-fill",
    "quit",
    "edit-fill",
    "edit",
    "edit-order",
    "collect-fill",
    "collect",
    "voice",
    "weixin",
    "qq-circle-fill",
    "weixin-fill",
    "qq-circle",
    "qq-fill",
    "qq",
    "follow",
    "follow-fill",
    "guaduan",
    "zuoxi",
    "zu",
    "zuoxiguanli",
    "zu1",
    "zu2",
    "zu3",
    "zuoxi1",
    "tuige",
    "tuige1",
    "tuige2",
    "government",
    "government-fill",
    "scale",
    "time1",
    "date1",
    "time",
    "time-fill",
    "date",
    "city-full",
    "city",
    "qiye",
    "qiye1",
    "qiyemenhu",
    "user-s",
    "user1",
    "lbs",
    "money-bag-fill",
    "money-bag",
    "down-fill",
    "up-fill",
    "money2",
    "money",
    "money-dollar",
    "money-fill",
    "location",
    "location-fill",
    "phone",
    "money3",
    "phone1",
    "phone2",
    "Location",
    "phone3",
    "disabled",
    "checkbox",
    "radio",
    "radio-fill",
    "checkbox-fill",
    "radio2",
    "radio2-fill",
    "switch-off",
    "switch-on",
    "up",
    "right",
    "left",
    "down",
    "video-pause-fill",
    "warning-fill",
    "order-detail",
    "unlock-fill",
    "menu",
    "lock",
    "menu-plus",
    "menu-plus-fill",
    "info",
    "info-dark",
    "unlock",
    "menu-fill",
    "lock-fill",
    "password-fill",
    "password",
    "audit",
    "audit-fill",
    "question",
    "question-fill",
    "tick",
    "order",
    "sms",
    "pictures",
    "coin",
    "share",
    "share-fill",
    "success",
    "fullscreen",
    "upload-cloud-small",
    "pause",
    "price",
    "caret-bottom",
    "warning",
    "sortto",
    "picture",
    "caret-top",
    "sharearrow",
    "positon-fill",
    "caret-left",
    "caret-right",
    "dollar",
    "caret",
    "shareto",
    "delete",
    "price-bag",
    "error",
    "sort-down",
    "sort-up",
    "list",
    "sortto-up",
    "full",
    "price-fill",
    "sortto-down",
    "notice",
    "pause-thick",
    "load",
    "unfold-more",
    "messages",
    "upload-cloud",
    "video-play-dark",
    "del",
    "fold",
    "unfold",
    "loading",
    "error-fill",
    "full-screen",
    "notice-fill",
    "close-circle",
    "video-play",
    "search-dark",
    "sort",
    "download",
    "tick-circle",
    "upload",
    "view",
    "search",
    "success-fill",
    "close",
    "download-simple",
    "video-pause",
    "close-circle-dark",
    "del-fill",
    "view-fill",
    "upload-local",
    "fold-more",
    "message",
    "positon",
    "play",
    "close-small",
    "hamburger-right",
    "hamburger-left",
    "data",
    "minus-fill",
    "minus",
    "add-circle-fill",
    "add-circle",
    "set",
    "minus-dark",
    "add",
    "userset",
    "setting",
    "user-more",
    "user",
    "data-stat",
    "home",
    "home-small"
  ]
})

// 计算过滤后的图标列表
const filteredList = computed(() => {
  if (!state.search) {
    return state.list
  }
  return state.list.filter(item => {
    return item.toLowerCase().includes(state.search.toLowerCase())
  })
})

/**
 * 处理搜索
 */
function handleSearch() {
  // 搜索逻辑由computed属性自动处理
}

/**
 * 清除选择
 */
function clearSelection() {
  state.visible = false
  emits('update:modelValue', '')
  emits('change', '')
}



/**
 * 展示
 */
function show(){
  state.visible = true
  return this
}
/**
 * 隐藏
 */
function hide() {
  state.visible = false
  return this
}
const emits = defineEmits(['update:modelValue', 'change'])

function toSelect(item){
  state.visible = false
  emits('update:modelValue', item)
  emits('change', item)
}

defineExpose({
  show,
  hide,
  state
})


</script>
<style scoped lang="scss">
.icon-box{
  width:34px;height:34px;border: 1px solid #d6d4d4; box-sizing: border-box;
  &:hover{
    border-color: #666666;
    background-color: #f5f5f5;
  }
}
</style>