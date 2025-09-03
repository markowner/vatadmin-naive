<template>
  <div class="mobile-nav-button" @click="showMobileNav"><i class="ifont i-menu"></i></div>
  <n-drawer v-model:show="state.active" :width="240" placement="left" class="sidebar-mobile">
    <n-drawer-content>
      <n-layout-sider
          bordered
          collapse-mode="width"
          width="100%"
          :collapsed="false"
      >
        <n-menu
            :collapsed="false"
            :collapsed-icon-size="22"
            :options="state.menus"
            :value="router.currentRoute.value.path"
            @update:value="selectChange"
        />
      </n-layout-sider>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
import {inject, reactive} from "vue";
import router from '@/router'
import { usePermissionStore } from '@/store/permission'
const tools = inject('tools')

const state = reactive({
  active: false,
  menus: []
})

const menu: [] = usePermissionStore().getMenus
state.menus = tools.menuFormat.filterAsyncRouterNaive(menu)

function showMobileNav(){
  state.active = true
}

function selectChange(){
  state.active = false
}

</script>

<style lang="scss">
.mobile-nav-button {
  position: fixed;
  bottom:60px;
  left:10px;
  z-index: 100;
  width: 50px;
  height: 50px;
  background: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mobile-nav-button i {color: #fff;font-size: 20px;}

.sidebar-mobile.n-drawer .n-drawer-content .n-drawer-body-content-wrapper{
  padding: 5px !important;
}
</style>