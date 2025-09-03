<template>
  <n-card>
    <n-flex align="center" justify="space-between">
      <div class="flex flex-ai-c gap2">
        <n-avatar
          round
          size="large"
          :src="state.userInfo.avatar ? tools.pages.cdnUrl(state.userInfo.avatar) : '/src/assets/images/avatar.jpg'"
        />
        <div>
          <div class="font-w">
            <n-gradient-text type="primary" :size="15">
              {{ state.userInfo.name }}
            </n-gradient-text>
          </div>
          <div class="font-w text-gray">欢迎使用{{$t('app_name')}}</div>
        </div>
      </div>
      <i class="ifont i-date pointer" style="font-size: 20px;" @click="state.dateDialog = true"></i>
    </n-flex>
  </n-card>
  <div style="height: 10px;"></div>
  <n-card title="系统公告" size="small" :segmented="{content: true}">
    <n-data-table
      :columns="state.affiche.columns"
      :data="state.affiche.list"
      striped
      resizable
      :max-height="300"
      remote
      :pagination="{pageSize: 10, itemCount: state.affiche.total}"
      @update:page="pageChange"
    />
  </n-card>
  <VatModal title="日历" v-model="state.dateDialog" width="70%">
    <n-calendar
        v-model:value="state.date"
        #="{ year, month, date }"
        :is-date-disabled="state.isDateDisabled"
        style="padding:20px;"
    >
      {{ year }}-{{ month }}-{{ date }}
    </n-calendar>
  </VatModal>
</template>

<script setup>
import {inject, reactive} from "vue"
import { addDays, isYesterday } from 'date-fns'
import Request from '@/utils/axios'
import { NPopover } from "naive-ui";
import VatModal from "@/components/VatModal.vue";
const tools = inject('tools')
import pageJsonData from '@/vat/pages/vat_admin_notice.json'
//构建数据列
let column = tools.pages.buildColumns(pageJsonData)

delete column.name
delete column.updatetime
delete column.is_read
delete column.type

column.content.render = (row) => {
  return h(NPopover, {}, {trigger: () => { return h('div', {class: 'text-ellipsis pointer', style: "max-height:46px;overflow:hidden;",innerHTML: row.content}) }, default: () => {
    return [
        h('div', {style: "max-width:600px; ",innerHTML: row.content}, {})
    ]
  }})
}

const state = reactive({
  dateDialog: false,
  userInfo: tools.data.get('Vat-User'),
  date: ref(addDays(Date.now(), 1).valueOf()),
  isDateDisabled(timestamp) {
    if (isYesterday(timestamp)) {
      return true
    }
    return false
  },
  tableWidth: 1000,
  affiche:{
    query:{
      page: 1,
      type: 1,
      order: [],
      filter: ''
    },
    columns: tools.pages.sortColumns(Object.values(column)),
    total: 0,
    list: []
  }
})


function noticeListGet(){
  state.affiche.query.filter = JSON.stringify({type: state.affiche.query.type})
  Request.request(pageJsonData.api_list.listOwner, state.affiche.query).then(res => {
    state.affiche.total = res.data.total
    state.affiche.list = res.data.list
  }).catch((err) => {
    console.log(err)
  })
}

noticeListGet()

function pageChange(page){
  state.affiche.query.page = page
  noticeListGet()
}

</script>