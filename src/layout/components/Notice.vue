<template>
  <n-drawer v-model:show="state.visible" :default-width="500" placement="right" resizable>
    <n-drawer-content title="消息通知" closable :body-content-style="{ padding: '0 15px' }">
      <n-affix :trigger-top="51" position="absolute" style="width: 100%;z-index:1;">
        <n-tabs type="line" trigger="click" v-model:value="state.query.type" @update:value="tabChange">
          <n-tab name="0" tab="消息"></n-tab>
          <n-tab name="1" tab="公告"></n-tab>
        </n-tabs>
      </n-affix>
      <div style="height: 50px;"></div>
      <div class="vat-notice">
        <div class="vat-notice-item" v-for="(item, index) in state.list" :key="item.id" @click="toDetail(item, index)">
          <div class="vat-notice-item-inner" :class="{ 'is-unread': !item.is_read }">
            <div class="notice-icon" :class="item.is_read ? 'icon-read' : 'icon-unread'">
              <svg v-if="!item.is_read" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="notice-content">
              <div class="notice-header">
                <div class="title text-ellipsis" :class="item.is_read ? 'text-read' : ''">
                  {{item.title }}
                </div>
                <div class="header-right">
                  <div class="time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="#9ca3af" stroke-width="2"/>
                      <path d="M12 7V12L15 15" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ item.createtime }}
                  </div>
                  <div class="status-badge" v-if="!item.is_read">
                    新
                  </div>
                </div>
              </div>
              <div class="content multiline-ellipsis" :class="item.is_read ? 'text-read' : ''" v-html="item.content"></div>
            </div>
            <div class="notice-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="empty-state" v-if="state.list.length < 1">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="empty-text">暂无消息</div>
          <div class="empty-desc">暂未收到新消息</div>
        </div>
      </div>
      <template #footer>
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
      </template> 
      <VatModal title="消息通知" v-model="state.noticeDialog">
        <div v-html="state.curNotice.content"></div>
      </VatModal>
    </n-drawer-content>
  </n-drawer>
</template>
<script setup>
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
  curNotice: {},
  visible: false
})

// 打开任务中心
const open = () => {
  state.visible = true
}

// 关闭任务中心
const close = () => {
  state.visible = false
}



function listGet(){
  state.query.filter = JSON.stringify({type: state.query.type})
  Request.request(VatApi.api_list.listOwner, state.query).then(res => {
    state.total = res.data.total
    state.list = res.data.list
  }).catch((err) => {
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
    }).catch((err) => {
      console.log(err)
    })
  }
}

// 暴露方法给外部使用
defineExpose({
  open,
  close
})

</script>
<style lang="scss" scoped>
.text-read{
  color: #999;
}
:deep(.vat-notice){
  position: relative;
  padding: 6px 0;
  
  & .vat-notice-item{
    margin-bottom: 5px;
    cursor: pointer;
    
    & .vat-notice-item-inner{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
      border-radius: 12px;
      border: 1px solid rgba(229, 231, 235, 0.8);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        border-radius: 0 3px 3px 0;
        transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      &.is-unread {
        background: linear-gradient(135deg, #f8f9ff 0%, #f5f3ff 100%);
        border-color: rgba(99, 102, 241, 0.2);
        
        &::after {
          height: 60%;
        }
      }
    }
    
    &:hover .vat-notice-item-inner{
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
      transform: translateY(-1px) translateX(1px);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        height: 60%;
      }
      
      & .notice-arrow {
        transform: translateX(3px);
        opacity: 1;
      }
    }
    
    & .notice-icon{
      width: 32px;
      height: 32px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
      
      &.icon-unread {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
      }
      
      &.icon-read {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      }
    }
    
    & .notice-content{
      flex: 1;
      min-width: 0;
      
      & .notice-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        gap: 8px;
      }
      
      & .header-right{
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      
      & .status-badge {
        padding: 2px 8px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        font-size: 11px;
        font-weight: 700;
        border-radius: 100px;
        flex-shrink: 0;
        letter-spacing: 0.3px;
        line-height: 1.2;
      }
      
      & .title{
        font-size: 14px;
        font-weight: 700;
        color: #111827;
        line-height: 1.3;
        flex: 1;
        min-width: 0;
      }
      
      & .content{
        font-size: 12px;
        color: #4b5563;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        
        & > p{
          margin: 0 !important;
        }
      }
      
      & .time{
        font-size: 11px;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 3px;
        font-weight: 500;
        white-space: nowrap;
      }
    }
    
    & .notice-arrow {
      flex-shrink: 0;
      opacity: 0.5;
      transform: translateX(0);
      transition: all 0.3s ease;
    }
  }
  
  & .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    
    & .empty-icon {
      margin-bottom: 16px;
      opacity: 0.6;
    }
    
    & .empty-text {
      font-size: 16px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    & .empty-desc {
      font-size: 13px;
      color: #9ca3af;
    }
  }
}

.text-read {
  &.title {
    font-weight: 500;
    color: #6b7280;
  }
  &.content {
    color: #9ca3af;
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