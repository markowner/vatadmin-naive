<template>
  <div style="position:relative;width: 100%;height: 100%;">
    <n-tabs type="line" trigger="click" v-model:value="state.query.type" @update:value="tabChange">
      <n-tab name="0" tab="消息"></n-tab>
      <n-tab name="1" tab="公告"></n-tab>
    </n-tabs>
    <div class="vat-notice">
      <div class="vat-notice-item" v-for="(item, index) in state.list" :key="item.id" @click="toDetail(item, index)">
        <div class="flex flex-jc-sb">
          <div class="title text-ellipsis" :class="item.is_read ? 'text-read' : ''">{{item.title }}</div>
          <div class="time flex-shrink">{{ item.createtime }}</div>
        </div>
        <div class="content multiline-ellipsis" :class="item.is_read ? 'text-read' : ''" v-html="item.content"></div>
      </div>
      <n-empty v-if="state.list.length < 1" description="暂无消息" style="margin-top: 20px;"></n-empty>
      <div style="height: 60px;"></div>
    </div>
    <div class="vat-page-box" :class="[useSettingStore().getConfig.mode ? 'dark' : 'light']">
      <n-pagination
        v-model:page="state.query.page"
        :item-count="state.total"
        :page-slot="5"
        :display-order="['size-picker','pages']"
        show-size-picker
        @update:page="onPageChange"
      >
        <template #prefix="{ itemCount }">
          共 {{ itemCount }} 条
        </template>
      </n-pagination>
    </div>
  </div>
  <VatModal title="消息通知" v-model="state.noticeDialog">
    <div v-html="state.curNotice.content"></div>
  </VatModal>
</template>
<script lang="ts" setup>
import {inject, reactive} from "vue";
import Request from '@/utils/axios'
import VatModal from "@/components/VatModal.vue";
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import VatApi from '@/vat/pages/vat_admin_notice.json'
const tools = inject('tools')

const state = reactive({
  query:{
    page: 1,
    type: 0,
    order: [],
    filter: ''
  },
  total: 0,
  list: [],
  noticeDialog: false,
  curNotice: {}
})

function listGet(){
  state.query.filter = JSON.stringify({type: state.query.type})
  Request.request(VatApi.api_list.listOwner, state.query).then(res => {
    state.total = res.data.total
    state.list = res.data.list
  }).catch((err: any) => {
    console.log(err)
  })
}

listGet()

function onPageChange(){
  listGet()
}

function tabChange(){
  listGet()
}

function toDetail(item, index){
  state.curNotice = item
  state.noticeDialog = true
  if(!item.is_read){
    //设置已读
    Request.request(VatApi.api_list.readSet, {id: item.id}).then(res => {
      // tools.notice.message.success(res.msg)
      state.list[index].is_read_desc = '已读'
      state.list[index].is_read = 1
      useUserStore().setNoticeCount('', '-');
    }).catch((err: any) => {
      console.log(err)
    })
  }
}

</script>
<style lang="scss" scoped>
.text-read{
  color: #879090;
  opacity: 0.7;
}
::v-deep .vat-notice{
  position: relative;
  & .vat-notice-item{
    padding: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    cursor: pointer;
    &:hover{
      background: #f6f7fb;
      color: #879090;
    }
    & .title{
      font-size: 14px;
      font-weight: bold;
      color: #666666;
    }
    & .time{
      font-size: 12px;
      color: #fff;
      background: #959e98;
      padding: 0 8px;
      border-radius: 20px;
      margin-left: 5px;
    }
    & .content{
      font-size: 12px;
      margin-top: 5px;
      font-weight: 500;
      & > p{
        margin: 5px !important;
      }
    }
  }
}
.vat-page-box{
  position: fixed;
  bottom: 0px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  width: 100%;
  padding: 10px 0;
  &.dark{
    background: rgb(44, 44, 50);
  }
  &.light{
    background: #fff;
  }
}
</style>