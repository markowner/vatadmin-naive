<template>
    <template v-if="!hideLayout">
    <n-layout has-sider class="w100" :class="store.device">
      <n-layout-header style="" :style="{borderBottom: !state.config.mode ? '1px solid #efeff5' : ''}">
        <div class="flex flex-ai-c">
          <!-- 网站标题及Logo -->
          <div :style="{width: state.siderWidth}" class="flex-shrink">
            <n-flex align="center" style="height: 60px;margin-right: 20px;gap: unset;">
              <div class="flex flex-center" style="width: 80px;text-align: center;height: 100%;"> <img :src="state.userInfo?.config?.logo || '/images/logo.jpeg'" style="width: 40px; height: 40px;border-radius: 10px;"></div>
              <n-ellipsis :tooltip="false" style="font-size: 16px;font-weight: bold;" :style="{maxWidth: store.device === 'pc' ? state.config.layout === 'column' ? '240px' : '156px' : '156px'}">
                {{ $t('app_name') }}
              </n-ellipsis>
            </n-flex>
          </div>
          
          <div>
            <!-- header布局开始 -->
            <div class="header-nav" style="position: relative;" v-if="state.config.layout == 'header' && store.device === 'pc'">
              <n-layout-sider style="width: 100%;max-width: 60vw;">
                <n-menu
                    :inverted="state.inverted"
                    :collapsed-width="state.siderCollapsedWidth"
                    :collapsed-icon-size="22"
                    mode="horizontal"
                    responsive
                    :options="[...state.parentMenus]"
                    :value="state.topPath"
                    @update:value="handleUpdateValue"
                />
              </n-layout-sider>
            </div>
            <!-- header布局结束 -->
            <!-- 路由面包屑 header布局不展示 -->
            <n-breadcrumb v-if="state.config.layout !== 'header' && store.device === 'pc'">
              <n-breadcrumb-item v-for="item in state.breadcrumb" :key="item.path" style="font-size: 14px">
                <i style="font-size: 14px" class="ifont" :class="['i-'+item.meta.icon]"></i> <span>{{ item.meta.title }}</span>
              </n-breadcrumb-item>
            </n-breadcrumb>
          </div>

          <div class="flex-shrink" style="padding-right: 10px;margin-left: auto;">
            <div class="flex flex-jc-sb flex-ai-c">
              <!-- 工具栏 -->
              <n-flex align="center">
                <template v-if="store.device === 'pc'">
                  <!-- 全屏 -->
                  <div class="vat-tools-line-box" :class="[state.config.mode ? 'dark' : 'light']"><i class="ifont i-full-screen pointer" @click="fullScreen"></i></div>
                  <!-- 消息通知 -->
                  <n-badge :value="userStore.user.userInfo.noread" :max="99" :offset="[-4,0]"><div class="vat-tools-line-box" :class="[state.config.mode ? 'dark' : 'light']"><i class="ifont i-notice pointer" @click="toNotice"></i></div></n-badge>
                  <!-- 设置 -->
                  <div class="vat-tools-line-box" :class="[state.config.mode ? 'dark' : 'light']"><i class="ifont i-setting pointer" @click="toSetting"></i></div>
                </template>
                <!-- 登录用户 -->
                <n-dropdown :options="options">
                  <div class="flex flex-ai-c">
                    <n-avatar
                        round
                        size="small"
                        :src="state.userInfo.avatar ? tools.pages.cdnUrl(state.userInfo.avatar) : '/src/assets/images/avatar.jpg'"
                    />
                    <span class="pointer" style="margin-left: 10px;">{{ state.userInfo.name }}</span>
                  </div>
                </n-dropdown>
              </n-flex>
            </div>
          </div>
        </div>
      </n-layout-header>
      <!-- column分栏布局开始 -->
      <n-flex class="vat-sider-column" :class="state.config.theme == 1 ? 'column-theme' :''" v-if="state.config.layout == 'column' && store.device === 'pc'">
        <n-layout-sider
            bordered
            collapse-mode="width"
            :collapsed-width="state.siderColumnCollapsedWidth"
            :collapsed="true"
            style="height:calc(100vh - 60px);margin-top: 60px;"
        >
          <n-menu
              :inverted="state.inverted"
              :collapsed-width="state.siderCollapsedWidth"
              :collapsed-icon-size="64"
              :options="state.parentMenus"
              :value="state.topPath"
              @update:value="handleUpdateValue"
          />
        </n-layout-sider>
      </n-flex>
      <n-layout-sider
          v-if="store.device === 'pc'"
          bordered
          collapse-mode="width"
          :collapsed-width="state.siderCollapsedWidth"
          :width="state.siderWidth"
          style="height:calc(100vh - 60px);margin-top: 60px;background: unset;"
          :class="state.config.theme == 2 ? 'column-theme' :''"
          show-trigger
          :inverted="state.inverted"
          :collapsed="state.collapsed"
          @collapse="state.collapsed = true"
          @expand="state.collapsed = false"
      >
        <n-menu
            :inverted="state.inverted"
            :collapsed="state.collapsed"
            :collapsed-width="state.siderCollapsedWidth"
            :collapsed-icon-size="22"
            :options="state.menus"
            :value="router.currentRoute.value.path"
        />
      </n-layout-sider>
      <!-- column分栏布局结束 -->
      <n-layout-content content-style="position: relative;">
        <Navbar v-if="store.device === 'pc'"></Navbar>
        <div v-else style="height: 60px;"></div>
        <div style="padding: 15px; height: calc(100vh - 95px); padding-bottom:0; overflow-y: auto;box-sizing: border-box;">
          <router-view v-slot="{ Component }" v-if="state.isRouterAlive">
            <keep-alive>
              <component :is="Component" :key="router.currentRoute.value.fullPath" v-if="router.currentRoute.value.meta.cached"/>
            </keep-alive>
            <component :is="Component" :key="router.currentRoute.value.fullPath" v-if="!router.currentRoute.value.meta.cached"/>
          </router-view>
        </div>
      </n-layout-content>

      <!-- 移动端菜单 -->
      <SideBar v-if="store.device === 'mobile' || store.device === 'ipad'"></SideBar>

      <!-- 设置抽屉弹框 -->
      <n-drawer v-model:show="state.visible.setting" :width="300" placement="right">
        <n-drawer-content title="设置">
          <n-form
              ref="formRef"
              :model="state.config"
              label-placement="top"
              label-width="auto"
              require-mark-placement="right-hanging"
              size="medium"
          >
            <n-form-item label="布局" path="layout">
              <n-radio-group v-model:value="state.config.layout" name="layout">
                <n-space>
                  <n-radio value="common">通用</n-radio>
                  <n-radio value="column">分栏</n-radio>
                  <n-radio value="header">混合</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="黑夜模式" path="mode">
              <!-- 黑夜模式 -->
              <n-switch v-model:value="state.config.mode" size="small" :rail-style="railStyle">
                <template #checked-icon>
                  <i class="ifont i-moon-fill"></i>
                </template>
                <template #unchecked-icon>
                  <i class="ifont i-sun"></i>
                </template>
              </n-switch>
            </n-form-item>
            <n-form-item label="主题" path="theme">
              <n-radio-group v-model:value="state.config.theme" name="theme">
                <n-space>
                  <n-radio :value="0">默认</n-radio>
                  <n-radio :value="1">浅蓝</n-radio>
                  <n-radio :value="2">蓝肤</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="语言" path="lang">
              <n-radio-group v-model:value="state.config.lang" name="lang">
                <n-space>
                  <n-radio value="zh">中文</n-radio>
                  <n-radio value="en">英文</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="水印" path="watermark">
              <n-radio-group v-model:value="state.config.watermark" name="watermark">
                <n-space>
                  <n-radio :value="1">开启</n-radio>
                  <n-radio :value="0">关闭</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-form>
          <n-button type="primary" block secondary strong @click="toSaveSetting">
            保存
          </n-button>
        </n-drawer-content>
      </n-drawer>

      <n-drawer v-model:show="state.visible.notice" :width="500" placement="right">
        <n-drawer-content title="消息通知" closable>
          <Notice></Notice>
        </n-drawer-content>
      </n-drawer>
      <!--- 水印 --->
      <n-watermark v-show="state.config.watermark" :content="state.userInfo.name" cross fullscreen :font-size="16" :line-height="16" 
        :width="384"
        :height="384"
        :x-offset="12"
        :y-offset="60"
        :rotate="-15"
      />
    </n-layout>
    </template>
    <template v-else>
      <div style="height: 100vh; width: 100%; overflow: auto; padding: 15px; box-sizing: border-box;">
        <router-view v-slot="{ Component }" v-if="state.isRouterAlive">
          <keep-alive>
            <component :is="Component" :key="router.currentRoute.value.fullPath" v-if="router.currentRoute.value.meta.cached"/>
          </keep-alive>
          <component :is="Component" :key="router.currentRoute.value.fullPath" v-if="!router.currentRoute.value.meta.cached"/>
        </router-view>
      </div>
    </template>
</template>

<script setup>
import { inject, reactive, watch, computed} from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
const tools = inject('tools')
import { useStore } from '@/store'
import { useSettingStore } from '@/store/setting'
import { usePermissionStore } from '@/store/permission'
import { useUserStore } from '@/store/user'
import Navbar from './components/Navbar.vue'
import Notice from './components/Notice.vue'
import SideBar from './components/SideBar.vue'

import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const route = useRoute()
const store = useStore()
const userStore = useUserStore()

// 计算是否需要隐藏layout
const hideLayout = computed(() => {
  // 检查路由参数中是否有layout=0
  return route.query.layout === '0'
})

const state = reactive({
    userInfo: userStore.user.userInfo,
    inverted: false,
    collapsed: false,
    isRouterAlive:true,
    siderWidth: 240,
    siderColumnCollapsedWidth: 80,
    siderCollapsedWidth: 64,
    parentMenus: [],
    menus: [],
    breadcrumb: [],
    topPath: '',         //顶级路由地址
    visible: {
      setting: false, //设置抽屉弹框
      notice: false, //消息通知
    },
    config: useSettingStore().getConfig
})

//定义个人信息下拉菜单展示
const options = [
  {
    label: tools.menuFormat.toLink('个人中心', '/usercenter'),
    key: 'profile',
    icon: tools.menuFormat.renderIcon('user')
  },
  // {
  //   label: tools.menuFormat.toLink('缓存刷新', '/cache/refresh'),
  //   key: 'cacheRefresh',
  //   icon: tools.menuFormat.renderIcon('refresh')
  // },
  {
    label: '退出登录',
    key: 'logout',
    icon: tools.menuFormat.renderIcon('quit'),
    props: {
      onClick: () => {
        console.log('退出登录')
        userStore.logout()
      }
    }
  }
]

window.addEventListener('resize', onLayoutResize);

function onLayoutResize(){
  let device = 'pc'

  if(document.body.clientWidth < 992){
    device = 'ipad'
  }
  if(document.body.clientWidth < 500){
    device = 'mobile'
  }
  store.setData('device', device)
}
onLayoutResize()
//获取菜单
const menu = usePermissionStore().getMenus
//初始化菜单
initMenu()

/**
 * 初始化菜单及当前路由选中
 */
function initMenu(){
  if(['column','header'].includes(state.config.layout)){
    //格式化菜单
    if(state.config.layout == 'column'){
      state.parentMenus = tools.menuFormat.filterParentAsyncRouterNaive2(menu)
    }else{
      state.parentMenus = tools.menuFormat.filterParentAsyncRouterNaive(menu)
    }

    //获取顶级菜单
    let topPath = state.topPath = router.currentRoute.value.matched[1].path
    let curRouteMenu = state.parentMenus.filter((item) => {
      return (item.key == topPath )
    })
    //获取子菜单
    if(curRouteMenu.length > 0){
      state.menus = tools.menuFormat.filterAsyncRouterNaive(tools.menuFormat.getChild(menu, curRouteMenu[0].id))
    }else{
      state.menus = tools.menuFormat.filterAsyncRouterNaive(tools.menuFormat.getChild(menu, state.parentMenus[0].id))
    }
  }else if(state.config.layout == 'common'){
    state.menus = tools.menuFormat.filterAsyncRouterNaive(menu)
  }
}

function menuChange(){
  if(['column','header'].includes(state.config.layout)) {
    let curRouteMenu = state.parentMenus.filter((item) => {
      return (item.key == state.topPath)
    })
    //获取子菜单
    if (curRouteMenu.length > 0) {
      state.menus = tools.menuFormat.filterAsyncRouterNaive(tools.menuFormat.getChild(menu, curRouteMenu[0].id))
    }
  }
}

/**
 * 顶级菜单点击变更成功回调函数
 * @param key
 * @param item
 */
function handleUpdateValue(key, item){
  //顶级菜单点击刷新子菜单
  state.menus = tools.menuFormat.filterAsyncRouterNaive(tools.menuFormat.getChild(menu, item.id))
}

/**
 * 设置
 */
function toSetting(){
  state.visible.setting = true
}

/**
 * 消息列表
 */
function toNotice(){
  state.visible.notice = true
}

/**
 * 保存设置
 */
function toSaveSetting(){
  tools.data.set('Vat-Setting', state.config)
  useSettingStore().setData(state.config)
  state.visible.setting = false
}

/**
 * 全屏
 */
function fullScreen(){
  tools.screen(document.documentElement)
}

/**
 * switch 样式
 * @param focused
 * @param checked
 */
function railStyle({focused, checked}){
  const style = {}
  style.background = '#f5f5f5'
  style.border = '1px solid #e7e7e7'
  if (checked) {
    style.background = '#000000'
    style.border = '1px solid #000000'
  } else {
    style.background = '#f5f5f5'
    style.border = '1px solid #e7e7e7'
  }
  return style
}

/**
 * 路由面包屑
 */
function getBreadcrumb(){
    state.breadcrumb = route.matched.filter((item) => {
      return item.meta && item.meta.title
    })
}

/**
 * 监控路由
 */
watch(() => route, (newRoute) => {
  getBreadcrumb()
  state.topPath = newRoute.matched[1].path
  menuChange()
}, { immediate: true, deep: true })

/**
 * 监控布局变化
 */
watch(() => state.config.layout, () => {
    initMenu()
}, { immediate: true, deep: true })

watch(() => state.config.lang, (lang) => {
  locale.value = lang
}, { immediate: true, deep: true })



</script>

<style lang="scss">
.n-layout-header{
  position: fixed;
  top: 0;
  left: 0;
  z-index:10;
  height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.vat-sider-column .n-menu .n-menu-item{
  height: 60px;
}
.vat-sider-column .n-menu-item-content__icon{
  width: 80px !important;
}
.header-nav .n-layout-sider.n-layout-sider--bordered .n-layout-sider__border{
  background: unset;
}

.vat-sider-column{
  &.column-theme .n-layout-sider.n-layout-sider--bordered .n-layout-sider__border{
    //background: rgba(255, 255, 255, 0.3);
  }
}

.menu-text{
  font-size: 12px;
  font-weight: bold;
  height: 30px;
  line-height: 30px;
}

.vat-tools-line-box{
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  & i{
    font-size: 12px;
  }
  &.light{
    background: #f2f3f5;
    &:hover{
      background: #e5e6eb !important;
    }
  }
  &.dark{
    &:hover{
      background: #afb1bb !important;
    }
  }
}

</style>