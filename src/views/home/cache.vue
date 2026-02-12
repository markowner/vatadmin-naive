<template>
  <div class="cache-page">
    <n-card title="缓存管理" size="small" :segmented="{content: true}">
      <div class="cache-buttons">
        <n-button type="primary" @click="clearAllCache" :loading="state.loading.all">
          <template #icon>
            <i class="ifont i-delete"></i>
          </template>
          全部清除
        </n-button>
      </div>
      
      <div class="cache-list">
        <n-card 
          v-for="(item, index) in state.cacheItems" 
          :key="index"
          size="small"
          :segmented="{content: true}"
          class="cache-item"
        >
          <template #header-extra>
            <n-button 
              type="warning" 
              size="small" 
              @click="clearCache(item.key)"
              :loading="state.loading[item.key]"
            >
              <template #icon>
                <i class="ifont i-delete"></i>
              </template>
              清除
            </n-button>
          </template>
       
            <n-h5 level="5">{{ item.name }}</n-h5>
            <n-p>{{ item.description }}</n-p>
            <n-p v-if="item.size" class="cache-size">
                大小: {{ item.size }}
            </n-p>
            <n-p v-else class="cache-size">
                大小: 未知
            </n-p>

        </n-card>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { inject, reactive, onMounted } from "vue"
import Request from '@/utils/axios'

const tools = inject('tools')

const state = reactive({
  loading: {
    all: false,
    'Vat-Config': false,
    'Vat-Dict': false,
    'Vat-Permission': false
  },
  cacheItems: [
    {
      key: 'Vat-Config',
      name: '系统设置缓存',
      description: '存储系统的各项设置',
    },
    {
      key: 'Vat-Dict',
      name: '字典缓存',
      description: '字典配置',
    },
    {
      key: 'Vat-Permission',
      name: '权限缓存',
      description: '存储用户的权限信息，用于权限验证',
    }
  ]
})

/**
 * 计算缓存大小
 */
function calculateCacheSize(key) {
  try {
    if (key === 'api-cache') {
      // 这里可以根据实际的API缓存实现来计算大小
      return '未知'
    } else {
      const data = tools.data.get(key)
      if (data) {
        const size = JSON.stringify(data).length
        return formatFileSize(size)
      }
      return '0 B'
    }
  } catch (e) {
    return '未知'
  }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 清除所有缓存
 */
function clearAllCache() {
  state.loading.all = true
  
  try {
    // 清除本地存储中的缓存
    state.cacheItems.forEach(item => {
      if (item.key !== 'api-cache') {
        tools.data.remove(item.key)
      }
    })
    
    // 清除API缓存
    clearApiCache()
    
    // 重新计算缓存大小
    setTimeout(() => {
      updateCacheSizes()
      state.loading.all = false
      tools.notice.message.success('全部缓存清除成功')
    }, 500)
  } catch (e) {
    state.loading.all = false
    tools.notice.message.error('清除缓存失败: ' + e.message)
  }
}

/**
 * 清除单个缓存
 */
function clearCache(key) {
  state.loading[key] = true
  
  try {
    if (key === 'api-cache') {
      clearApiCache()
    } else {
      tools.data.remove(key)
    }
    
    setTimeout(() => {
      updateCacheSizes()
      state.loading[key] = false
      tools.notice.message.success('缓存清除成功')
    }, 500)
  } catch (e) {
    state.loading[key] = false
    tools.notice.message.error('清除缓存失败: ' + e.message)
  }
}

/**
 * 清除API缓存
 */
function clearApiCache() {
  // 这里根据实际的API缓存实现来清除
  // 例如，如果使用axios的缓存拦截器，可以调用相应的清除方法
}

/**
 * 更新缓存大小
 */
function updateCacheSizes() {
  state.cacheItems.forEach(item => {
    item.size = calculateCacheSize(item.key)
  })
}

// 页面加载时计算缓存大小
onMounted(() => {
  updateCacheSizes()
})
</script>

<style scoped>
.cache-page {
  padding: 20px;
}

.cache-buttons {
  margin-bottom: 20px;
}

.cache-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.cache-item {
  transition: all 0.3s ease;
}

.cache-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cache-size {
  color: #999;
  font-size: 12px;
  margin-top: 10px;
}

@media screen and (max-width: 768px) {
  .cache-list {
    grid-template-columns: 1fr;
  }
}
</style>