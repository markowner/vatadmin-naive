<template>
  <div class="vat-task">
    <!-- 进行中的任务 -->
    <div v-if="state.tasks.length > 0" class="task-section">
      <div class="task-list">
        <div v-for="task in state.tasks" :key="task.id" class="task-item running">
          <div class="task-header">
            <div class="task-info">
              <span class="task-name">[{{ task.id }}]{{ task.title }}</span>
              <!-- <span class="task-type">{{ task.type }}</span> -->
            </div>
            <div v-if="task.status == 100">
              <n-button size="tiny" type="primary" strong @click="retryTask(task)">
                <i class="ifont i-copy"></i>重试任务
              </n-button>
            </div>
            <div v-if="task.status == 0">
              <n-button size="tiny" type="error" strong @click="cancelTask(task)">
                <i class="ifont i-close"></i>取消任务
              </n-button>
            </div>
          </div>
          <div class="task-namespace-exec-class" v-if="task.namespace">
            {{ task.namespace }} -> {{ task.exec_class }}
          </div>
          <div class="task-meta">
            <span class="task-status" :class="getTaskStatusClass(task.status)">
              {{ getStatusText(task.status) }}
            </span>
            <span class="task-time">{{ tools.common.formatTime(task.createtime) }}</span>
          </div>
          <div v-if="task.content" class="task-output">
            <div class="output-header">
              <span class="output-label">耗时：{{ task.end_time - task.start_time }} 秒，输出:</span>
              <button 
                v-if="task.content" 
                class="copy-btn" 
                @click="tools.common.copy(task.content)"
              >
                <div class="flex flex-ai-c"><i class="ifont i-copy"></i> 复制</div>
              </button>
            </div>
            <span v-if="state.expandedTasks.has(task.id) || !shouldTruncate(task.content)" class="output-content">
              {{ task.content }}
            </span>
            <span v-else class="output-content">
              {{ getTruncatedContent(task.content) }}
            </span>
            <button 
              v-if="shouldTruncate(task.content)" 
              class="expand-btn" 
              @click="toggleExpand(task.id)"
            >
              {{ state.expandedTasks.has(task.id) ? '收起' : '查看更多' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="state.tasks.length === 0" class="empty-state">
      <span class="empty-icon">📋</span>
      <span class="empty-text">暂无任务记录</span>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { NButton, NProgress } from 'naive-ui'
const tools = inject('tools')

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const state = reactive({
  tasks: props.tasks,
  expandedTasks: new Set() // 记录展开的任务
})

const emit = defineEmits(['cancel', 'clear', 'remove', 'view', 'retry'])

const runningTasks = computed(() => {
  return state.tasks.filter(t => [0,50].includes(t.status))
})

// 已完成的任务
const completedTasks = computed(() => {
  return props.tasks
    .filter(t => ['success', 'failed', 'cancelled'].includes(t.status))
    .sort((a, b) => (b.end_time || 0) - (a.end_time || 0))
})

// 获取进度条状态
const getProgressStatus = (task) => {
  if (task.status === 'failed') return 'exception'
  if (task.status === 'success') return 'success'
  return 'default'
}

// 获取任务状态类名
const getTaskStatusClass = (status) => {
  const map = {
    '-99': 'cancel',
    0: 'pending',
    50: 'running',
    100: 'success'
  }
  return map[status] || status
}



// 获取状态文本
const getStatusText = (status) => {
  const map = {
    '-99': '已取消',
    0: '待执行',
    50: '执行中',
    100: '已完成'
  }
  return map[status] || status
}

// 取消任务
const cancelTask = (taskId) => {
  emit('cancel', taskId)
}


// 复制为新任务
const retryTask = (task) => {
  emit('retry', task)
}

// 切换输出内容展开
const toggleExpand = (taskId) => {
  if (state.expandedTasks.has(taskId)) {
    state.expandedTasks.delete(taskId)
  } else {
    state.expandedTasks.add(taskId)
  }
}

// 判断输出内容是否需要截断
const shouldTruncate = (content, maxLength = 100) => {
  return content && content.length > maxLength
}

// 获取截断后的内容
const getTruncatedContent = (content, maxLength = 100) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}


watch(() => props.tasks, (newTasks) => {
  console.log('任务列表更新:', newTasks)
  state.tasks = newTasks
})

// onMounted(() => {
//   window.socketConnection.subscribe('Vat-Task-Async').on('message', (data) => {
//     console.log('收到任务消息:', data)
//   })
// })

</script>

<style scoped>
.vat-task {
  overflow-y: auto;
}

.task-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.section-title .icon {
  font-size: 16px;
}

.clear-btn {
  margin-left: auto;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 12px;
  border-radius: 8px;
  background: #f7f7f7;
  /* border: 1px solid #e8e8e8; */
}

.task-item.running {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.task-item.completed {
  opacity: 0.9;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
}

.task-type {
  font-size: 12px;
  color: #999;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-progress {
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.task-status {
  padding: 2px 8px;
  border-radius: 4px;
  /* font-weight: 500; */
}

.task-status.running {
  background: rgba(99, 102, 241, 0.1);
  color: #4098fc;
}

.task-status.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.task-status.cancel {
  background: #6360601a;
  color: #999999;
}

.task-status.pending {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.task-time {
  color: #999;
}

.task-error {
  margin-top: 8px;
  padding: 8px;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 4px;
  font-size: 12px;
  color: #ef4444;
}

.task-error .error-label {
  font-weight: 500;
}

.task-output {
  margin-top: 8px;
  padding: 8px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.output-label {
  font-weight: 500;
  color: #666;
}

.output-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.task-result {
  margin-top: 8px;
  padding: 8px;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-weight: 500;
  color: #666;
}

.copy-btn {
  background: transparent;
  border: none;
  color: #6366f1;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.copy-btn:hover {
  background: rgba(99, 102, 241, 0.1);
}

.result-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.expand-btn {
  background: transparent;
  border: none;
  color: #6366f1;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
}

.expand-btn:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}
.task-namespace-exec-class{
  font-size: 12px;
  color: #6366f1;
  margin-bottom: 8px;
}
</style>
