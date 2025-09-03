<script setup lang="ts">
import {inject, reactive, ref} from 'vue'
import { darkTheme } from 'naive-ui'
import { dateZhCN, zhCN } from 'naive-ui'
import { NConfigProvider } from 'naive-ui'
const modeTheme = ref(darkTheme)
// const tools = inject('tools')
const state = reactive({
  locale: zhCN,
  dateLocale: dateZhCN,
})
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
hljs.registerLanguage('sql', sql)

import { useSettingStore } from '@/store/setting'

/**
 * js 文件下使用这个做类型提示
 * @type import('naive-ui').GlobalThemeOverrides
 */
const themeOverrides = {
  0: {},
  1:{
    common: {
      primaryColor: '#4098FCFF',
      primaryColorHover: '#4098FCFF'
    },
    Button: {
      textColor: '#4098FCFF'
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: '#4098FCFF'
        }
      }
    }
  },
  2: {
    common: {
      primaryColor: '#4098FCFF',
      primaryColorHover: '#4098FCFF'
    },
    Layout: {
      // textColor:'#fff',
      headerColor: '#E9EFFD',
      // headerBorderColor: '#fff',
      siderColor: '#E9EFFD',
      // siderBorderColor:''
    },
    Button: {
      textColor: '#4098FCFF'
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: '#4098FCFF'
        }
      }
    }
  }
}

</script>

<template>
  <n-config-provider :hljs="hljs" :locale="state.locale" :date-locale="state.dateLocale" :theme="useSettingStore().getConfig.mode ? modeTheme : null" :theme-overrides="useSettingStore().getConfig.mode ? {} : themeOverrides[useSettingStore().getConfig.theme]">
<!--    <n-global-style />-->
    <router-view />
  </n-config-provider>
</template>

<style scoped>
</style>
