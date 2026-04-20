<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <!-- <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">插件管理</h1>
          <p class="page-desc">发现、安装和管理插件，扩展系统功能</p>
        </div>
        <div class="header-actions">
          <n-button 
            type="primary" 
            @click="refreshPlugins" 
            :loading="loading"
            class="refresh-btn"
          >
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            刷新插件
          </n-button>
        </div>
      </div>
    </div> -->

    <!-- 插件统计卡片 -->
    <div class="stats-section">
      <n-grid cols="4" :col-gap="20" :row-gap="20">
        <n-grid-item>
          <n-card hoverable bordered>
            <div class="stat-item">
              <n-icon :component="ExtensionPuzzleOutline" size="28" class="stat-icon" />
              <div class="stat-content">
                <div class="stat-value">{{ totalPlugins }}</div>
                <div class="stat-label">总插件数</div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card hoverable bordered>
            <div class="stat-item">
              <n-icon :component="CheckmarkCircleOutline" size="28" class="stat-icon success" />
              <div class="stat-content">
                <div class="stat-value">{{ enabledPlugins }}</div>
                <div class="stat-label">已启用</div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card hoverable bordered>
            <div class="stat-item">
              <n-icon :component="TimeOutline" size="28" class="stat-icon info" />
              <div class="stat-content">
                <div class="stat-value">{{ installedPlugins }}</div>
                <div class="stat-label">已安装</div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card hoverable bordered>
            <div class="stat-item">
              <n-icon :component="DownloadOutline" size="28" class="stat-icon warning" />
              <div class="stat-content">
                <div class="stat-value">{{ availablePlugins }}</div>
                <div class="stat-label">可安装</div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 插件列表 -->
    <div class="plugins-section" v-if="plugins.length > 0">
      <div class="section-header">
        <h2 class="section-title">插件列表</h2>
        <p class="section-desc">浏览和管理可用的插件</p>
      </div>
      
      <div class="plugin-grid">
        <div
          v-for="plugin in plugins"
          :key="plugin.slug"
          class="plugin-card"
          :class="'status-' + plugin.status"
        >
          <!-- 插件头部 -->
          <div class="plugin-header">
            <div class="plugin-icon-wrapper" :class="'status-' + plugin.status">
              <n-icon :component="ExtensionPuzzleOutline" size="40" />
            </div>
            <div class="plugin-status" :class="'status-' + plugin.status">
              {{ getStatusText(plugin.status) }}
            </div>
          </div>

          <!-- 插件内容 -->
          <div class="plugin-body">
            <h3 class="plugin-name">{{ plugin.name }}</h3>
            <p class="plugin-slug">{{ plugin.slug }}</p>
            <p class="plugin-description">{{ plugin.description || '暂无描述' }}</p>
          </div>

          <!-- 插件信息 -->
          <div class="plugin-meta">
            <div class="meta-item">
              <n-icon :component="CodeSlashOutline" size="14" />
              <span>{{ plugin.version || '1.0.0' }}</span>
            </div>
            <div class="meta-item">
              <n-icon :component="PersonOutline" size="14" />
              <span>{{ plugin.author || '未知' }}</span>
            </div>
            <div class="meta-item" v-if="plugin.member_name">
              <n-icon :component="StarOutline" size="14" />
              <span>{{ plugin.member_name }}</span>
            </div>
          </div>

          <!-- 插件操作 -->
          <div class="plugin-actions">
            <n-button
              v-if="plugin.status === 0"
              type="primary"
              block
              @click="installPlugin(plugin.slug)"
              class="action-btn install"
            >
              <template #icon>
                <n-icon :component="DownloadOutline" />
              </template>
              安装插件
            </n-button>
            <template v-else>
              <div class="action-buttons">
                <n-button
                  v-if="plugin.status === 1 || plugin.status === 3"
                  type="success"
                  size="small"
                  @click="enablePlugin(plugin.slug)"
                  class="action-btn"
                >
                  <template #icon>
                    <n-icon :component="PlayOutline" />
                  </template>
                  启用
                </n-button>
                <n-button
                  v-else-if="plugin.status === 2"
                  type="warning"
                  size="small"
                  @click="disablePlugin(plugin.slug)"
                  class="action-btn"
                >
                  <template #icon>
                    <n-icon :component="PauseOutline" />
                  </template>
                  禁用
                </n-button>
                <n-button
                  type="info"
                  size="small"
                  @click="showConfig(plugin)"
                  class="action-btn"
                >
                  <template #icon>
                    <n-icon :component="SettingsOutline" />
                  </template>
                  配置
                </n-button>
                <n-button
                  type="error"
                  size="small"
                  @click="uninstallPlugin(plugin.slug)"
                  class="action-btn"
                >
                  <template #icon>
                    <n-icon :component="TrashOutline" />
                  </template>
                  卸载
                </n-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-section">
      <n-result
        status="info"
        title="暂无插件"
        description="插件系统可以帮助您扩展系统功能"
      >
        <template #icon>
          <n-icon :component="ExtensionPuzzleOutline" size="64" />
        </template>
        <template #footer>
          <n-button type="primary" @click="refreshPlugins">
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            刷新插件
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- 配置对话框 -->
    <n-modal
      v-model:show="showConfigModal"
      preset="card"
      title="插件配置"
      style="width: 600px; max-width: 90vw;"
      :close-on-esc="false"
      :close-on-click-outside="false"
    >
      <n-form
        v-if="currentPlugin"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="插件名称">
          <n-input v-model:value="currentPlugin.name" disabled />
        </n-form-item>
        <n-form-item label="插件标识">
          <n-input v-model:value="currentPlugin.slug" disabled />
        </n-form-item>
        <n-form-item label="插件配置">
          <n-input
            v-model:value="configJson"
            type="textarea"
            rows="8"
            placeholder="请输入JSON格式的配置"
            class="config-textarea"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showConfigModal = false">取消</n-button>
          <n-button type="primary" @click="updateConfig">保存配置</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import Request from '@/utils/axios'
import {
  RefreshOutline,
  ExtensionPuzzleOutline,
  CheckmarkCircleOutline,
  TimeOutline,
  DownloadOutline,
  CodeSlashOutline,
  PersonOutline,
  StarOutline,
  PlayOutline,
  PauseOutline,
  SettingsOutline,
  TrashOutline
} from '@vicons/ionicons5'

const tools = inject('tools')
const plugins = ref([])
const loading = ref(false)
const showConfigModal = ref(false)
const currentPlugin = ref(null)
const pluginConfig = ref({})
const configJson = ref('')

const pageJsonData = {
  api_list: {
    list: { url: '/app/vatadmin/basic/plugin/list', method: 'get' },
    install: { url: '/app/vatadmin/basic/plugin/install', method: 'post' },
    enable: { url: '/app/vatadmin/basic/plugin/enable', method: 'post' },
    disable: { url: '/app/vatadmin/basic/plugin/disable', method: 'post' },
    uninstall: { url: '/app/vatadmin/basic/plugin/uninstall', method: 'post' },
    getConfig: { url: '/app/vatadmin/basic/plugin/getConfig', method: 'get' },
    updateConfig: { url: '/app/vatadmin/basic/plugin/updateConfig', method: 'post' }
  }
}

const state = {
  pageJson: {
    api: pageJsonData.api_list
  }
}

// 计算插件统计数据
const totalPlugins = computed(() => plugins.value.length)
const enabledPlugins = computed(() => plugins.value.filter(p => p.status === 2).length)
const installedPlugins = computed(() => plugins.value.filter(p => p.status !== 0).length)
const availablePlugins = computed(() => plugins.value.filter(p => p.status === 0).length)

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '未安装',
    1: '已安装',
    2: '已启用',
    3: '已禁用'
  }
  return statusMap[status] || '未知'
}

// 获取插件列表
const getPlugins = async function() {
  loading.value = true
  try {
    const res = await Request.request(state.pageJson.api.list)
    plugins.value = res.data.list || []
  } catch (error) {
    tools.notice.message.error('获取插件列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新插件
const refreshPlugins = function() {
  getPlugins()
}

// 安装插件
const installPlugin = async function(slug) {
  try {
    const res = await Request.request(state.pageJson.api.install, { slug })
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '安装成功')
      getPlugins()
    } else {
      tools.notice.message.error(res.msg || '安装失败')
    }
  } catch (error) {
    tools.notice.message.error('安装失败')
  }
}

// 启用插件
const enablePlugin = async function(slug) {
  try {
    const res = await Request.request(state.pageJson.api.enable, { slug })
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '启用成功')
      getPlugins()
    } else {
      tools.notice.message.error(res.msg || '启用失败')
    }
  } catch (error) {
    tools.notice.message.error('启用失败')
  }
}

// 禁用插件
const disablePlugin = async function(slug) {
  try {
    const res = await Request.request(state.pageJson.api.disable, { slug })
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '禁用成功')
      getPlugins()
    } else {
      tools.notice.message.error(res.msg || '禁用失败')
    }
  } catch (error) {
    tools.notice.message.error('禁用失败')
  }
}

// 卸载插件
const uninstallPlugin = async function(slug) {
  tools.notice.dialog.warning({
    title: '警告',
    content: '确定要卸载该插件吗？卸载后插件数据可能会丢失。',
    positiveText: '确定卸载',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await Request.request(state.pageJson.api.uninstall, { slug })
        if (res.code === 200) {
          tools.notice.message.success(res.msg || '卸载成功')
          getPlugins()
        } else {
          tools.notice.message.error(res.msg || '卸载失败')
        }
      } catch (error) {
        tools.notice.message.error('卸载失败')
      }
    }
  })
}

// 显示配置
const showConfig = async function(plugin) {
  currentPlugin.value = plugin
  try {
    const res = await Request.request(state.pageJson.api.getConfig, { slug: plugin.slug })
    if (res.code === 200) {
      pluginConfig.value = res.data || {}
      configJson.value = JSON.stringify(res.data || {}, null, 2)
      showConfigModal.value = true
    } else {
      tools.notice.message.error('获取配置失败')
    }
  } catch (error) {
    tools.notice.message.error('获取配置失败')
  }
}

// 更新配置
const updateConfig = async function() {
  if (!currentPlugin.value) return

  try {
    const config = JSON.parse(configJson.value)
    const res = await Request.request(state.pageJson.api.updateConfig, {
      slug: currentPlugin.value.slug,
      config
    })
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '配置更新成功')
      showConfigModal.value = false
    } else {
      tools.notice.message.error(res.msg || '配置更新失败')
    }
  } catch (error) {
    tools.notice.message.error('配置格式错误，请输入有效的JSON')
  }
}

// 页面加载时获取插件列表
onMounted(function() {
  getPlugins()
})
</script>

<style scoped>
.page-container {
  /* padding: 15px; */
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
  /* min-height: 100vh; */
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.page-desc {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  color: #1890ff;
  background: #e6f7ff;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.success {
  color: #52c41a;
  background: #f6ffed;
}

.stat-icon.info {
  color: #1890ff;
  background: #e6f7ff;
}

.stat-icon.warning {
  color: #faad14;
  background: #fffbe6;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

/* 插件列表 */
.plugins-section {
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* 插件卡片 */
.plugin-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plugin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.plugin-card.status-2 {
  border-color: #52c41a;
  box-shadow: 0 0 0 1px rgba(82, 196, 26, 0.2);
}

.plugin-card.status-3 {
  border-color: #faad14;
}

/* 插件头部 */
.plugin-header {
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  gap: 16px;
}

.plugin-card.status-2 .plugin-header {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
}

.plugin-card.status-3 .plugin-header {
  background: linear-gradient(135deg, #fffbe6 0%, #fff1c1 100%);
}

.plugin-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.plugin-icon-wrapper.status-2 {
  color: #52c41a;
}

.plugin-icon-wrapper.status-3 {
  color: #faad14;
}

.plugin-icon-wrapper.status-0 {
  color: #999;
}

.plugin-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #999;
  color: white;
  margin-left: auto;
}

.plugin-status.status-1 {
  background: #1890ff;
}

.plugin-status.status-2 {
  background: #52c41a;
}

.plugin-status.status-3 {
  background: #faad14;
}

/* 插件内容 */
.plugin-body {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.plugin-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.plugin-slug {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.plugin-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 插件元信息 */
.plugin-meta {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

/* 插件操作 */
.plugin-actions {
  padding: 20px 24px;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.install {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 空状态 */
.empty-section {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 配置对话框 */
.config-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .plugins-section {
    padding: 24px;
  }

  .plugin-grid {
    grid-template-columns: 1fr;
  }

  .plugin-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }

  .plugin-header {
    padding: 16px;
  }

  .plugin-body {
    padding: 16px;
  }

  .plugin-meta {
    padding: 12px 16px;
  }

  .plugin-actions {
    padding: 16px;
  }
}
</style>