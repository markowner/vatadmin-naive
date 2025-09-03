<template>
  <div id="tags-view-container" class="tags-view-container flex flex-ai-c flex-jc-sb" :class="['navbar-theme-' + useSettingStore().getConfig.theme, useSettingStore().getConfig.mode ? 'dark' : 'light' ]">
    <div ref="scrollContainer" class="tags-view-wrapper" @wheel="handleScroll">
<!--      <i class="ifont i-left boundary left"></i>-->
      <div class="route-box flex">
        <div class="tags-view-item-box" v-for="tag in visitedViews" :key="tag.path" :class="[isActive(tag) ? 'active' : '']">
          <div class="left" :class="[useSettingStore().getConfig.mode ? 'dark' : 'light']"></div>
          <router-link
              ref="tag"
              :class="['vat-link', isActive(tag) ? 'active' : '']"
              :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
              tag="span"
              class="tags-view-item"
              @click.middle.native="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          >
            {{ tag.meta.title }}
            <i class="ifont i-close icon-ep" v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)"></i>
          </router-link>
          <div class="right" :class="[useSettingStore().getConfig.mode ? 'dark' : 'light']"></div>
        </div>
      </div>
<!--      <i class="ifont i-right boundary right"></i>-->
    </div>
    <n-dropdown size="small" trigger="hover" :options="state.menuTab" class="menu-tab">
      <i class="ifont i-menu-fill pointer" style="font-size: 14px;font-weight:bold;margin-right: 15px;"></i>
    </n-dropdown>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch, nextTick, reactive, inject} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsViewStore } from '@/store/tagsView'
import { useSettingStore } from '@/store/setting'
import { usePermissionStore } from '@/store/permission'
const route = useRoute();
const router = useRouter();
const permissionStore = usePermissionStore()
const tagsViewStore = useTagsViewStore()
const visitedViews = computed(() => {
  return tagsViewStore.getVisitedViews
})
const tools = inject('tools')
const affixTags = ref([])
const selectedTag = ref({})
const scrollContainer = ref(null);
const state = reactive({
  menuTab: [
    {
      label: '刷新',
      key: 'refresh',
      icon: tools.menuFormat.renderIcon('refresh'),
      props: {
        onClick: () => {
          refresh()
        }
      }
    },
    {
      label: '关闭',
      key: 'close',
      icon: tools.menuFormat.renderIcon('close'),
      show: !isAffix(selectedTag),
      props: {
        onClick: () => {
          closeSelectedTag(selectedTag)
        }
      }
    },
    {
      label: '关闭其它',
      key: 'closeOther',
      icon: tools.menuFormat.renderIcon('close-circle'),
      props: {
        onClick: () => {
          closeOthersTags()
        }
      }
    },
    {
      label: '关闭所有',
      key: 'closeAll',
      icon: tools.menuFormat.renderIcon('close-circle-dark'),
      props: {
        onClick: () => {
          closeAllTags(selectedTag)
        }
      }
    }
  ]
})

/**
 * 是否选中
 * @param route
 * @returns {boolean}
 */
const isActive = (route) => {
  const activeTag = route.path === router.currentRoute.value.path
  if (activeTag) selectedTag.value = route
  return activeTag
}
/**
 * 是否固定路由标签
 * @param tag
 */
function isAffix(tag) {
  return tag.meta && tag.meta.affix
}

/**
 * 滚动事件
 * @param e
 */
const handleScroll = (e) => {
  e.preventDefault(); // 阻止默认的滚动行为
  const eventDelta = e.wheelDelta || -e.deltaY * 40
  scrollContainer.value.scrollLeft += eventDelta / 4
};

/**
 * 初始化路由标签
 */
function initTags() {
  affixTags.value = tools.menuFormat.filterAffixTags(permissionStore.getMenus)
  for (const tag of affixTags.value) {
    if (tag.name) {
      tagsViewStore.addView(tag)
    }
  }
}

/**
 * 添加路由导航标签
 */
function addTags() {
  const name = router.currentRoute.value.name
  if (name) {
    tagsViewStore.addView(router.currentRoute.value)
  }

  return false
}

/**
 * 关闭
 * @param tag
 */
const closeSelectedTag = (tag) => {
  if (isAffix(tag)) return;
  // 实现关闭标签的逻辑
  const index = visitedViews.value.findIndex((v) => v.path === tag.path);
  if (index > -1) {
    visitedViews.value.splice(index, 1);
  }
  if (isActive(tag)) {
    toLastView();
  }
}

/**
 * 刷新当前路由
 */
const refresh = () => {
  const currentPath = route.path
  const currentQuery = route.query
  router.replace({ path: '/refresh' }).then(() => {
    router.replace({ path: currentPath, query: currentQuery })
  })
}

/**
 * 关闭其他标签
 */
function closeOthersTags() {
  router.push(selectedTag.value)
  tagsViewStore.delOtherView(selectedTag.value)
}
const toLastView = () => {
  const lastView = visitedViews.value.slice(-1)[0]
  if (lastView) {
    router.push(lastView)
  } else {
    router.push('/')
  }
};

/**
 * 关闭所有打开的可关闭标签
 * @param view
 */
function closeAllTags(view) {
  tagsViewStore.delAllView()
  if (affixTags.value.some(tag => tag.path === view.path)) {
    return
  }
  toLastView(visitedViews.value, view)
}

initTags()

watch(() => router.currentRoute.value.path, (toPath) => {
  //要执行的方法
  addTags()
  nextTick(() => {
    if(scrollContainer.value.scrollWidth > scrollContainer.value.clientWidth){
      //确保当前标签在可视范围内
      let targetTag = scrollContainer.value.querySelector(".active")
      targetTag.scrollIntoView()
    }
  })
},{immediate: true,deep: true})


</script>

<style lang="scss">
.boundary{
  position: absolute;
  font-size: 14px;
  //color: #fff;
  background: #fff;
  height: 90%;
  display: flex;
  align-items: center;
  padding: 0 5px;
  cursor: pointer;
  &.left{
    left: 0;
  }
  &.right{
    right: 0;
  }
}
.route-box{
  //margin: 16px;
}
.tags-view-container {
  height: 34px;
  width:100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  position: relative;
  z-index: 10;
  margin-top:60px;
  &.dark{
    background: none;
  }
  &.light{
    background: #fff;
  }
  & .tags-view-wrapper {
    position: relative;
    width: 100%;
    padding: 0 10px;
    height: 36px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    overflow: hidden;
    //background: rgba(64, 152, 252, 0.1);

    /* 确保内容区域可以滚动 */
    & > * {
      flex-shrink: 0; /* 防止内容缩小 */
    }
  }
  & .tags-view-item-box{
    display: flex;
    //border-right: 1px solid #f1f1f1;
    &.active{
      background: rgba(64, 152, 252, 0.1);
    }
    & .left{
      width: 14px;
      height: 100%;
      border-bottom-right-radius: 50%;
      border-top-right-radius: 50%;
      &.dark{
        background: none;
      }
      &.light{
        background: #fff;
      }
    }
    & .right{
      width: 14px;
      height: 100%;
      border-bottom-left-radius: 50%;
      border-top-left-radius: 50%;
      &.dark{
        background: none;
      }
      &.light{
        background: #fff;
      }
    }
  }
  & .tags-view-item {
    display: inline-block;
    padding: 0 8px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    font-size: 13px;
    color: #495060;
    border-radius: 14px;
    transition: all 0.2s;
    box-sizing: border-box;
    //&:hover {
    //  color: #18a058;
    //}
    //
    //&.active {
    //  background-color: #18a058;
    //  color: #fff;
    //  border-color: #18a058;
    //  transition: all 0.5s;
    //  &::before {
    //    content: '';
    //    background: #fff;
    //    display: inline-block;
    //    width: 8px;
    //    height: 8px;
    //    border-radius: 50%;
    //    position: relative;
    //    margin-right: 2px;
    //  }
    //  &:hover {
    //    color: #fff;
    //  }
    //}
  }

  & .icon-ep{
    border-radius: 50%;
    width: 10px;
    height: 10px;
    //vertical-align: -1px;
    padding:1px;
    transition: all .3s cubic-bezier(.645, .045, .355, 1);
    transform-origin: 100% 50%;
    margin-left:3px;
    font-size: 12px;
    &:hover{
      background-color: #b4bccc;
      color: #fff;
    }
  }
}
.navbar-theme-0 {
  & .tags-view-item-box {
    &.active {
      background: rgba(24, 160, 88, 0.1);
    }
  }
  & .tags-view-item {
    &:hover {
      color: #18a058;
    }

    &.active {
      //background-color: rgba(24, 160, 88, 0.1);
      color: #18a058;
      border-color: #18a058;
      transition: all 0.5s;

      &::before {
        content: '';
        background: #18a058;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
        margin-right: 2px;
      }

      &:hover {
        color: #18a058;
      }
    }
  }
}
.navbar-theme-1,.navbar-theme-2 {
  & .tags-view-item {
    &:hover {
      color: #4098FCFF;
    }

    &.active {
      //background-color: rgba(64, 152, 252, 0.1);
      color: #4098FCFF;
      border: none;
      transition: all 0.5s;

      &::before {
        content: '';
        background: #4098FCFF;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
        margin-right: 2px;
      }

      &:hover {
        color: #4098FCFF;
      }
    }
  }
}

.n-dropdown-menu .n-dropdown-option .n-dropdown-option-body{
  font-size: 12px;
}
</style>