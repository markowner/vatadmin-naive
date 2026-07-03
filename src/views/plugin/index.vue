<template>
  <div class="page-container">

    <!-- 插件管理主模块 -->
    <div class="plugins-main-section">
      <n-card class="plugins-main-card" bordered>
        <!-- 搜索模块 -->
        <div class="search-wrapper">
          <n-form :show-label="false" class="flex flex-wrap gap">
            <n-form-item class="vat-form-item auto">
              <n-input v-model:value="state.query.name" placeholder="请输入插件名称" clearable>
              </n-input>
            </n-form-item>
            <n-form-item class="vat-form-item auto">
              <n-select v-model:value="state.query.tag_id" placeholder="插件分类" clearable :options="state.searchConfig?.tags" />
            </n-form-item>
             <n-form-item class="vat-form-item auto">
              <n-select v-model:value="state.query.price" placeholder="插件价格" clearable :options="state.searchConfig?.price" />
            </n-form-item>
            <n-form-item class="vat-form-item auto">
              <n-select v-model:value="state.query.installed" placeholder="安装状态" clearable
                :options="state.searchConfig?.install" />
            </n-form-item>
          </n-form>
          <n-flex align="center" justify="space-between" style="margin-bottom: 20px;">
            <n-space>
              <n-button type="primary" secondary size="medium" @click="handleSearch">
                <template #icon>
                  <n-icon :component="SearchOutline" />
                </template>
                搜索
              </n-button>
              <n-button type="tertiary" secondary size="medium" @click="handleReset">
                重置
              </n-button>
            </n-space>
            <n-button type="primary" size="small" secondary @click="state.showLogin = true"
              class="action-btn install">
              <template #icon>
                <n-icon :component="LogInOutline" size="16" />
              </template>
              登录插件系统
            </n-button>
          </n-flex>
        </div>
        <n-spin :show="state.loading">
          <!-- 插件列表 -->
          <div class="plugins-content" v-if="state.total > 0">
            <div class="plugin-grid">
              <div v-for="(plugin, index) in state.list" :key="plugin.slug" class="plugin-card"
                :class="'status-' + plugin.status">
                <!-- 插件内容 -->
                <div class="plugin-body">
                  <h3 class="plugin-name flex flex-jc-sb flex-ai-c">
                    <div class="flex flex-ai-c gap">
                      <div class="plugin-icon-wrapper">
                        {{ plugin.version }}
                        <!-- <n-icon :component="ExtensionPuzzleOutline" size="20" /> -->
                      </div>
                      <span>{{ plugin.name }}</span>
                    </div>
                    <div class="plugin-price flex flex-ai-c" :class="plugin.price > 0 ? 'no-free' : 'free'">{{
                      plugin.price > 0 ?
                      '¥' + `${plugin.price}` : '免费' }}</div>
                  </h3>

                  <p class="plugin-description">{{ plugin.description || '暂无描述' }}</p>
                </div>

                <!-- 插件信息 -->
                <div class="plugin-meta">
                  <div class="meta-item meta-author">
                    <n-icon :component="PersonOutline" size="16" />
                    <span>{{ plugin.member_name || '未知' }}</span>
                  </div>
                  <div class="meta-item meta-tags" v-if="plugin.tags">
                    <n-icon :component="PricetagOutline" size="16" />
                    <div class="tags-container">
                      <span v-for="(tag, index) in (plugin.tags || '').split(',').map(t => t.trim()).filter(t => t)"
                        :key="index" class="tag-item">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  <div class="meta-item meta-download">
                    <n-icon :component="DownloadOutline" size="16" />
                    <span>{{ plugin.install_total }}</span>
                  </div>
                </div>

                <!-- 插件操作 -->
                <div class="plugin-actions">
                  <n-button v-if="plugin.price > 0 && plugin.purchased === 0" color="#ec4899" size="small" :loading="state.loading" @click="buyPlugin(plugin.slug)"
                    class="action-btn buy">
                    <template #icon>
                      <n-icon :component="CartOutline" size="16" />
                    </template>
                    购买插件
                  </n-button>
                  <n-button v-if="plugin.price > 0 && plugin.purchased === 1 && plugin.installed === 0 || plugin.price == 0 && plugin.installed === 0" type="primary" size="small" secondary :loading="state.loading" @click="installPlugin(plugin.slug, plugin.name)"
                    class="action-btn install">
                    <template #icon>
                      <n-icon :component="DownloadOutline" size="16" />
                    </template>
                    安装插件
                  </n-button>
                  <n-button v-if="plugin.price > 0 && plugin.purchased === 1 && plugin.installed === 1 || plugin.price == 0 && plugin.installed === 1"  type="error" size="small" :loading="state.loading" @click="uninstallPlugin(plugin.slug)"
                    class="action-btn">
                    <template #icon>
                      <n-icon :component="TrashOutline" size="16" />
                    </template>
                    卸载插件
                  </n-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 无插件状态 -->
          <div v-else class="empty-wrapper">
            <n-result status="info" title="暂无插件" description="插件系统可以帮助您扩展系统功能">
              <template #icon>
                <n-icon :component="ExtensionPuzzleOutline" size="56" />
              </template>
            </n-result>
          </div>
        </n-spin>
      </n-card>
    </div>

    <!-- 分页 -->
    <div class="page-fixed" :class="[useSettingStore().getConfig.mode ? 'dark' : 'light']">
      <n-pagination v-model:current-page="state.query.page" :page-size="state.query.size" :total="state.total"
        show-size-changer :page-size-options="[10, 20, 30, 40]" @update:current-page="listChange"
        @update:page-size="listChange" />
    </div>
    <!-- 配置对话框 -->
    <n-modal v-model:show="showConfigModal" preset="card" title="插件配置" style="width: 600px; max-width: 90vw;"
      :close-on-esc="false" :close-on-click-outside="false">
      <n-form v-if="currentPlugin" label-placement="left" label-width="80">
        <n-form-item label="插件名称">
          <n-input v-model:value="currentPlugin.name" disabled />
        </n-form-item>
        <n-form-item label="插件标识">
          <n-input v-model:value="currentPlugin.slug" disabled />
        </n-form-item>
        <n-form-item label="插件配置">
          <n-input v-model:value="configJson" type="textarea" rows="8" placeholder="请输入JSON格式的配置"
            class="config-textarea" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showConfigModal = false">取消</n-button>
          <n-button type="primary" @click="updateConfig">保存配置</n-button>
        </n-space>
      </template>
    </n-modal>
    <n-modal
      v-model:show="state.showLogin"
      preset="card"
      title="登录插件系统"
      style="width: 400px; max-width: 90vw;"
      :close-on-esc="false"
      :close-on-click-outside="false"
      :segmented="{ content: true}"
    >
      <plugin-login appName="Vat插件系统" @login-success="pluginLoginSuccess"></plugin-login>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed, reactive } from 'vue'
import Request from '@/utils/axios'
import { useSettingStore } from '@/store/setting'
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
  TrashOutline,
  SearchOutline,
  PricetagOutline,
  CartOutline,
  LogInOutline
} from '@vicons/ionicons5'
import { config } from 'md-editor-v3'

import PluginLogin from '../components/Login.vue'

const tools = inject('tools')
const showConfigModal = ref(false)
const currentPlugin = ref(null)
const pluginConfig = ref({})
const configJson = ref('')

const pageJsonData = {
  api_list: {
    list: { url: '/app/vatadmin/basic/plugin/list', method: 'get' },
    install: { url: '/app/vatadmin/basic/plugin/install', method: 'post' },
    uninstall: { url: '/app/vatadmin/basic/plugin/uninstall', method: 'post' },
  }
}

const state = reactive({
  pageJson: {
    api: pageJsonData.api_list
  },
  query: {
    page: 1,
    size: 10,
    name: '',
    tag_id: null,
    price: null,
    installed: null,
  },
  loading: false,
  total: 0,
  list: [],
  searchConfig: {},
  showLogin: false
})

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
const getPlugins = async function () {
  state.loading = true
  try {
    const res = await Request.request(state.pageJson.api.list, state.query)
    state.list = res.data.list || []
    state.total = res.data.total || 0
    state.searchConfig = res.data.config
  } catch (error) {
    tools.notice.message.error('获取插件列表失败')
  } finally {
    state.loading = false
  }
}

// 刷新插件
const refreshPlugins = function () {
  getPlugins()
}

// 搜索
const handleSearch = function () {
  state.query.page = 1
  getPlugins()
}

// 分页变化
const listChange = function () {
  getPlugins()
}



// 重置
const handleReset = function () {
  state.query.name = ''
  state.query.tags = null
  state.query.installed = null
  state.query.price = null
}

// 安装插件
const installPlugin = async function (slug, name) {
  try {
    if(state.loading){
      return
    }
    state.loading = true
    const res = await Request.request(state.pageJson.api.install, { slug, name })
    state.loading = false
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '安装成功')
      getPlugins()
    } else {
      tools.notice.message.error(res.msg || '安装失败')
    }
  } catch (error) {
    console.log('error', error)
    state.loading = false
    if (error?.data?.code === 401) {
      state.showLogin = true
      tools.notice.message.error(error?.data?.msg || '请先登录插件系统')
    } else{
      tools.notice.message.error('安装失败')
    }
  }
}

// 卸载插件
const uninstallPlugin = async function (slug) {
  tools.notice.dialog.warning({
    title: '警告',
    content: '确定要卸载该插件吗？卸载后插件数据可能会丢失。',
    positiveText: '确定卸载',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        if(state.loading){
          return
        }
        state.loading = true
        const res = await Request.request(state.pageJson.api.uninstall, { slug })
        state.loading = false
        if (res.code === 200) {
          tools.notice.message.success(res.msg || '卸载成功')
          getPlugins()
        } else {
          tools.notice.message.error(res.msg || '卸载失败')
        }
      } catch (error) {
        state.loading = false
        tools.notice.message.error('卸载失败')
      }
    }
  })
}

// 购买插件
const buyPlugin = async function (slug) {
  try {
    const res = await Request.request(state.pageJson.api.buy, { slug })
    if (res.code === 200) {
      tools.notice.message.success(res.msg || '购买成功')
      getPlugins()
    } else {
      if (res.data?.code === 401) {
        state.showLogin = true
        tools.notice.message.error(res.msg || '请先登录插件系统')
      } else{
        tools.notice.message.error(res.msg || '购买失败')
      }
    }
  } catch (error) {
    tools.notice.message.error('购买失败')
  }
}



// 显示配置
const showConfig = async function (plugin) {
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
const updateConfig = async function () {
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

function pluginLoginSuccess(data){
  tools.notice.message.success('登录成功')
  state.showLogin = false
  getPlugins()
}
getPlugins()

</script>

<style scoped lang="scss">
.page-container {}

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

/* 插件主模块 */
.plugins-main-section {
  margin-bottom: 20px;
}

.plugins-main-card {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.88) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(102, 126, 234, 0.10),
    0 4px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.search-wrapper {}

.search-wrapper .n-form-item {
  margin-bottom: 0;
}

.search-wrapper .n-input,
.search-wrapper .n-select {
  transition: all 0.3s ease;
}

.search-wrapper .n-input:hover,
.search-wrapper .n-select:hover {
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.12);
}

.search-wrapper .n-input:focus-within,
.search-wrapper .n-select:focus-within {
  box-shadow: 0 5px 16px rgba(102, 126, 234, 0.20);
}

.search-wrapper .n-button {
  /* border-radius: 12px; */
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-wrapper .n-button:hover {
  transform: translateY(-1px);
}

.search-wrapper .search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  box-shadow: 0 6px 18px rgba(102, 126, 234, 0.30);
}

.search-wrapper .search-btn:hover {
  box-shadow: 0 8px 22px rgba(102, 126, 234, 0.40);
}

.plugins-content {
  // padding: 0 20px 20px;
}

.empty-wrapper {
  padding: 30px 20px;
}

/* 旧的空状态样式清理 */
.empty-section {
  display: none;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  align-items: stretch;
}

/* 插件卡片 */
.plugin-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plugin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.plugin-card:hover {
  /* transform: translateY(-6px) scale(1.01); */
  box-shadow:
    0 16px 40px rgba(102, 126, 234, 0.15),
    0 8px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.plugin-card:hover::before {
  opacity: 1;
}

/* 插件头部 */
.plugin-header {
  position: relative;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%);
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.plugin-icon-wrapper {
  min-width: 30px;
  height: 26px;
  border-radius: 6px;
  padding: 0 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow:
    0 8px 20px rgba(102, 126, 234, 0.3),
    0 3px 10px rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.5, 1);
  font-size: 12px;
}

/* 
.plugin-card:hover .plugin-icon-wrapper {
  transform: rotate(8deg) scale(1.08);
  box-shadow: 
    0 12px 28px rgba(102, 126, 234, 0.4),
    0 6px 14px rgba(102, 126, 234, 0.3);
} */


.plugin-status {
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%);
  color: white;
  margin-left: auto;
  box-shadow: 0 3px 10px rgba(140, 140, 140, 0.2);
  letter-spacing: 0.3px;
}

/* 插件内容 */
.plugin-body {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.plugin-name {
  margin: 0 0 15px 0;
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
  flex-shrink: 0;
}

.plugin-slug {
  margin: 0 0 10px 0;
  font-size: 11px;
  color: #8c8c8c;
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.08) 0%,
      rgba(118, 75, 162, 0.08) 100%);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
  font-weight: 500;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  align-self: flex-start;
}

.plugin-price {
  font-size: 12px;
  padding: 1% 15px;
  border-radius: 16px;

  &.free {
    color: green;
    background: rgba(39, 201, 63, 0.1);
    border: 1px solid green;
  }

  &.no-free {
    border: 1px solid #ec4899;
    background: rgba(236, 72, 153, 0.1);
    color: #ec4899;
  }
}



.plugin-description {
  margin: 0;
  font-size: 13px;
  color: #777777;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 42px;
}

/* 插件元信息 */
.plugin-meta {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 10px;
  background: linear-gradient(180deg,
      rgba(102, 126, 234, 0.03) 0%,
      rgba(255, 255, 255, 0.5) 100%);
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #434343;
  font-weight: 500;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 作者信息 */
.meta-author {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(64, 169, 255, 0.04) 100%);
  border-radius: 16px;
  font-size: 12px;
  align-self: flex-start;
}

.meta-author .n-icon {
  color: #1890ff;
}

/* 标签信息 */
.meta-tags {
  flex-wrap: wrap;
}

.meta-tags .n-icon {
  color: #52c41a;
  flex-shrink: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(149, 222, 100, 0.05) 100%);
  color: #389e0d;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid rgba(82, 196, 26, 0.2);
  transition: all 0.2s ease;
}

.tag-item:hover {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.15) 0%, rgba(149, 222, 100, 0.1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(82, 196, 26, 0.15);
}

/* 下载量信息 */
.meta-download {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.08) 0%, rgba(255, 214, 102, 0.04) 100%);
  border-radius: 10px;
  align-self: flex-start;
}

.meta-download .n-icon {
  color: #faad14;
}

/* 插件操作 */
.plugin-actions {
  padding: 14px 16px;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.8) 100%);
  flex-shrink: 0;
  margin-top: auto;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 10px;
  font-size: 12px;
  border: none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-btn.install {
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.action-btn.install:hover {
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.4);
}

/* Success 按钮 */
.action-btn[type="success"] {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.25);
}

.action-btn[type="success"]:hover {
  box-shadow: 0 8px 20px rgba(82, 196, 26, 0.35);
}

/* Warning 按钮 */
.action-btn[type="warning"] {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.25);
}

.action-btn[type="warning"]:hover {
  box-shadow: 0 8px 20px rgba(250, 173, 20, 0.35);
}

/* Info 按钮 */
.action-btn[type="info"] {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

.action-btn[type="info"]:hover {
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.35);
}

/* Error 按钮 */
.action-btn[type="error"] {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.25);
}

.action-btn[type="error"]:hover {
  box-shadow: 0 8px 20px rgba(255, 77, 79, 0.35);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.action-buttons .action-btn {
  // flex: 1;
  min-width: 70px;
}

/* 空状态 */
.empty-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 60px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
    align-items: center;
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

@media (min-width: 1000px){
  .vat-form-item.auto {width: calc((100% - 15px) / 4);}
}

@media (min-width: 600px) and (max-width:1000px){
  .vat-form-item.auto {width: calc((100% - 15px) / 2);}
}

@media (max-width: 600px){
  .vat-form-item.auto {width: 100%;}
}
</style>