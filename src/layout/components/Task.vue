<template>
  <n-drawer v-model:show="showDrawer" :default-width="500" placement="right" content-class="vat-task" resizable>
    <n-drawer-content title="任务中心" :body-content-style="{ padding: '0 10px' }">
     
      <n-affix :trigger-top="51" position="absolute" style="width: 100%;z-index:1;">
        <n-tabs type="segment" animated trigger="click" tab-class="tab-primary box-shadow" v-model:value="state.query.filter.status" @update:value="tabChange">
          <n-tab name="" tab="全部"></n-tab>
          <n-tab name="0" tab="待执行"></n-tab>
          <n-tab name="50" tab="进行中"></n-tab>
          <n-tab name="100" tab="已完成"></n-tab>
          <n-tab name="-99" tab="已取消"></n-tab>
        </n-tabs>
      </n-affix>
      <div style="height: 50px;"></div>
      <div class="task-list">
        <VatTask 
          :tasks="taskList" 
          @cancel="handleCancel"
          @clear="handleClear"
          @remove="handleRemove"
          @view="handleView"
          @retry="handleRetry"
        />
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
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, provide } from 'vue'
import { NDrawer, NDrawerContent } from 'naive-ui'
import VatTask from '@/components/VatTask.vue'
import Request from '@/utils/axios'
import { useSettingStore } from '@/store/setting'
import VatApi from '@/vat/pages/vat_task_async.json'
const tools = inject('tools')
const showDrawer = ref(false)
const taskList = ref([])
const containerRef = ref<HTMLElement | undefined>(undefined)

const state = {
  query: {
    page: 1,
    filter: {
      status: "50"
    }
  },
  total: 0,
  list: [],
  loading: false
}

// 打开任务中心
const open = () => {
  showDrawer.value = true
}

// 关闭任务中心
const close = () => {
  showDrawer.value = false
}

// 添加任务
const addTask = (task) => {
  taskList.value.unshift(task)
}

// 更新任务
const updateTask = (taskId, data) => {
  const index = taskList.value.findIndex(t => t.id === taskId)
  if (index !== -1) {
    taskList.value[index] = { ...taskList.value[index], ...data }
  }
}

// 清空已完成任务
const handleClear = () => {
  taskList.value = taskList.value.filter(t => ['pending', 'running'].includes(t.status))
}

// 删除任务
const handleRemove = (taskId) => {
  taskList.value = taskList.value.filter(t => t.id !== taskId)
}

// 切换标签页
function tabChange(){
  state.query.page = 1
  listGet()
}

// 分页改变
function onPageChange(){
  listGet()
}

async function listGet(){
  state.loading = true
  try {
    const res = await Request.request(VatApi.api_list.listOwner, {...state.query, filter: JSON.stringify(state.query.filter)})
    state.total = res.data.total
    taskList.value = res.data.list
    state.loading = false
  } catch (err) {
    console.log(err)
    state.loading = false
  }
}

listGet()

// 查看任务结果
const handleView = (task) => {
  console.log('查看任务结果:', task)
}


// 取消任务
const handleCancel = async (task) => {
  if(state.loading){
    return
  }
  state.loading = true
  try {
    tools.notice.dialog.warning({
      title: '警告',
      content: '你确定要取消此任务吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Request.request(VatApi.api_list.cancel, {id: task.id}).then(res => {
          tools.notice.message.success(res.msg)
          listGet()
        }).catch(err => {
          console.log(err)
        })
      },
      onNegativeClick: () => {
      
      }
    })
  } catch (err) {
    console.log(err)
  } finally {
    state.loading = false
  }
}

// 重试任务
async function handleRetry(task){
  if(state.loading){
    return
  }
  state.loading = true
  try {
    tools.notice.dialog.warning({
      title: '警告',
      content: '你确定要重试此任务吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Request.request(VatApi.api_list.retryNew, {id: task.id}).then(res => {
          tools.notice.message.success(res.msg)
          listGet()
        }).catch(err => {
          console.log(err)
        })
      },
      onNegativeClick: () => {
   
      }
    })
  } catch (err) {
    console.log(err)
  } finally {
    state.loading = false
  }
}

// 暴露方法给外部使用
defineExpose({
  open,
  close
})
</script>


<style lang="scss">
.n-tabs-tab--active.tab-primary{
  color: var(--n-bar-color) !important;
  background: #f6f7fb !important;
}
</style>