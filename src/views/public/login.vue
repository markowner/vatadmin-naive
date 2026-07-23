<template>
  <div class="login-bg">
    <!-- ==================== 左侧品牌展示区 ==================== -->
    <div class="login-brand">
      <!-- Layer 0: 背景图 -->
      <div class="brand-bg-image"></div>
      <!-- Layer 1: 亮色渐变遮罩 -->
      <div class="brand-overlay-main"></div>
      <!-- Layer 2: 对角光线 -->
      <div class="brand-overlay-diagonal"></div>
      <!-- Layer 3: 径向光球 左上 -->
      <div class="brand-glow brand-glow-tl"></div>
      <!-- Layer 4: 径向光球 右下 -->
      <div class="brand-glow brand-glow-br"></div>
      <!-- Layer 5: 中心光球 -->
      <div class="brand-glow brand-glow-center"></div>

      <!-- 旋转环 左上 -->
      <div class="brand-ring brand-ring-outer"></div>
      <!-- 反转环 右下 -->
      <div class="brand-ring brand-ring-inner"></div>
      <!-- 3D 翻滚方块 -->
      <div class="brand-cube"></div>
      <!-- 轨道粒子 -->
      <div class="brand-orbit-dot"></div>
      <!-- 脉冲环组 -->
      <div class="brand-pulse-ring brand-pulse-ring-1"></div>
      <div class="brand-pulse-ring brand-pulse-ring-2"></div>
      <!-- 3D 漂移面板 -->
      <div class="brand-glass-panel brand-glass-panel-lg"></div>
      <div class="brand-glass-panel brand-glass-panel-sm"></div>
      <!-- 3D 菱形线框 -->
      <div class="brand-diamond"></div>

      <!-- 发光粒子 -->
      <div class="brand-particle" v-for="(p, i) in particles" :key="i" :style="p"></div>

      <!-- 微光扫过 -->
      <div class="brand-shimmer"></div>

      <!-- 品牌内容 -->
      <div class="brand-content">
        <!-- 科技 Logo: 旋转环 -->
        <div class="tech-logo">
          <div class="tech-logo-ring tech-logo-ring-outer"></div>
          <div class="tech-logo-ring tech-logo-ring-inner"></div>
          <div class="tech-logo-core"></div>
        </div>
        <h1 class="brand-title">{{ $t('app_name') }}</h1>
        <div class="brand-divider"></div>
        <p class="brand-tagline">{{ $t('app_intro') }}</p>
      </div>

      <!-- 底部版权 -->
      <div class="brand-footer">
        © {{ $t('app_name') }} - {{ $t('app_version') }}
      </div>
    </div>

    <!-- ==================== 右侧登录表单区 ==================== -->
    <div class="login-main">
      <div class="login-form">
        <div class="login-header">
          <div class="logo">
            <!-- <div class="logo-icon">V</div> -->
            <img :alt="$t('app_name')" :src="state.configs?.logo || '/images/logo.jpeg'">
            <label>{{ $t('app_name') }}</label>
          </div>
          <p class="login-welcome">欢迎回来，请登录您的账号</p>
        </div>

        <n-tabs
          class="card-tabs"
          default-value="signin"
          size="large"
          animated
          pane-wrapper-style="margin: 0"
          pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
        >
          <n-tab-pane name="signin" tab="账号登录">
            <n-form :model="state.form" ref="loginForm" :rules="state.rules" @keyup.enter="toLogin">
              <n-form-item-row label="账号" path="username">
                <n-input v-model:value="state.form.username" placeholder="请输入账号">
                  <template #prefix>
                    <n-icon :size="16" color="#cbd5e1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></n-icon>
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row label="密码" path="password" autocomplete>
                <n-input
                  type="password"
                  v-model:value="state.form.password"
                  :input-props="{ autocomplete: '' }"
                  placeholder="请输入密码"
                  show-password-on="click"
                >
                  <template #prefix>
                    <n-icon :size="16" color="#cbd5e1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></n-icon>
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row label="验证" path="captcha" required>
                <n-button @click="toOpenCaptcha" class="captcha-btn" block>
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </template>
                  安全验证
                </n-button>
              </n-form-item-row>
            </n-form>

            <!-- 记住 / 忘记 -->
            <div class="login-extra">
              <!-- <n-checkbox v-model:checked="state.rememberMe" size="small">记住密码</n-checkbox>
              <a class="login-link" href="javascript:;">忘记密码?</a> -->
            </div>

            <n-button type="primary" block strong size="large" @click="toLogin" class="login-btn">
              登 录
            </n-button>

            <!-- <div class="login-bottom-text">
              还没有账号?
              <a class="login-link" href="javascript:;">立即注册</a>
            </div> -->
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <!-- 滑块验证 -->
    <slider-captcha
      v-model="state.captchaVisible"
      :options="state.captchaOptions"
      :loading="state.captchaLoading"
      @check="check"
      @close="close"
      @refresh="getSliderOptions"
      @error="getSliderOptions"
    >
      <template #title><span>安全验证</span></template>
      <template #successText><span style="font-size: 12px;">登录中</span></template>
      <template #errorText><span class="text-red" style="font-size: 12px;">是不是太难了换一个</span></template>
      <template #tips><span style="font-size: 12px;">拖动下方滑块完成拼图</span></template>
    </slider-captcha>
  </div>
</template>

<script setup>
import { reactive, ref, inject } from "vue"
import Request from '@/utils/axios'
import router from '@/router'
import { useUserStore } from '@/store/user'

const tools = inject('tools')
const api = inject('api')

const state = reactive({
  captchaX: 0,
  captchaVisible: false,
  captchaLoading: false,
  captchaOptions: {},
  rememberMe: false,
  form: {
    username: '',
    password: '',
    captcha: ''
  },
  rules: {
    username: {
      required: true,
      trigger: 'blur',
      message: '请输入账号'
    },
    password: {
      required: true,
      trigger: 'blur',
      message: '请输入密码'
    },
    captcha: {
      required: true,
      trigger: 'blur',
      message: '请先安全验证'
    }
  },
  loading: false,
  configs: {}
})

// 粒子数据
const particles = [
  { top: '18%', left: '28%', width: '5px', height: '5px', background: 'rgba(168,85,247,.7)', boxShadow: '0 0 12px rgba(168,85,247,.5)', animation: 'particle-float-1 7s ease-in-out infinite' },
  { top: '35%', right: '20%', width: '4px', height: '4px', background: 'rgba(96,165,250,.65)', boxShadow: '0 0 10px rgba(96,165,250,.4)', animation: 'particle-float-2 9s ease-in-out infinite' },
  { top: '55%', left: '22%', width: '3px', height: '3px', background: 'rgba(192,38,211,.55)', boxShadow: '0 0 8px rgba(192,38,211,.35)', animation: 'particle-float-3 11s ease-in-out infinite' },
  { top: '12%', right: '32%', width: '4px', height: '4px', background: 'rgba(255,255,255,.5)', boxShadow: '0 0 8px rgba(255,255,255,.3)', animation: 'particle-float-1 8s ease-in-out infinite 3s' },
  { bottom: '20%', right: '25%', width: '3px', height: '3px', background: 'rgba(168,85,247,.5)', boxShadow: '0 0 8px rgba(168,85,247,.3)', animation: 'particle-float-2 10s ease-in-out infinite 1s' },
  { bottom: '35%', left: '35%', width: '5px', height: '5px', background: 'rgba(96,165,250,.4)', boxShadow: '0 0 10px rgba(96,165,250,.25)', animation: 'particle-float-3 12s ease-in-out infinite 4s' },
  { top: '65%', right: '38%', width: '3px', height: '3px', background: 'rgba(255,255,255,.35)', boxShadow: '0 0 6px rgba(255,255,255,.2)', animation: 'particle-float-1 9s ease-in-out infinite 2s' }
]

const loginForm = ref(null)
const userStore = useUserStore()

function toLogin() {
  loginForm.value?.validate((valid) => {
    if (!valid) {
      Request.request(api.api_list.login, state.form).then(res => {
        userStore.login(res.data)
        tools.data.set('Vat-Menu', res.data.menus)
        tools.data.set('Vat-Views', res.data.views)
        router.push({ path: '/' })
      }).catch(err => {
        console.log(err)
      })
    } else {
      console.log(valid)
      return false
    }
  })
}

function getSliderOptions() {
  state.captchaLoading = true
  Request.request(api.api_list.captcha, state.form).then(res => {
    state.captchaX = res.data.secret
    state.captchaOptions = {
      sliderImg: res.data.img,
      sliderKey: res.data.key,
      sliderY: res.data.y
    }
    state.captchaLoading = false
  }).catch(err => {
    console.log(err)
  })
}

function toOpenCaptcha() {
  state.captchaVisible = true
  getSliderOptions()
}

function check(sliderKey, sliderX, done, error) {
  if (sliderX > state.captchaX - 8 && sliderX < state.captchaX + 8) {
    state.form.captcha = tools.crypto.BASE64.encrypt(JSON.stringify({ k: sliderKey, x: sliderX, t: 'slider' }))
    state.captchaVisible = false
    toLogin()
  } else {
    error()
  }
}

function close() {}

function configsGet() {
  Request.request(api.api_list.configs, {}).then(res => {
    state.configs = res.data
  }).catch(err => {
    console.log(err)
  })
}
configsGet()
</script>

<style scoped>
/* ==================== 整体布局 ==================== */
.login-bg {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f8f9fc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ==================== 左侧品牌区 (45%) ==================== */
.login-brand {
  width: 45%;
  min-width: 320px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #12082e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 背景图层 */
.brand-bg-image {
  position: absolute;
  inset: 0;
  background: url('/src/assets/images/left.jpg') center center / cover no-repeat;
  opacity: 0.85;
}
.brand-overlay-main {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(139,92,246,.25) 0%, rgba(99,102,241,.15) 30%, rgba(59,130,246,.1) 55%, rgba(15,23,42,.35) 100%);
}
.brand-overlay-diagonal {
  position: absolute;
  inset: 0;
  background: linear-gradient(125deg, transparent 20%, rgba(168,85,247,.12) 45%, rgba(96,165,250,.1) 55%, transparent 75%);
}

/* 径向光球 */
.brand-glow {
  position: absolute;
  border-radius: 50%;
}
.brand-glow-tl {
  width: 450px;
  height: 450px;
  top: -120px;
  left: -120px;
  background: radial-gradient(circle, rgba(168,85,247,.3) 0%, rgba(99,102,241,.12) 35%, transparent 60%);
}
.brand-glow-br {
  width: 320px;
  height: 320px;
  bottom: -80px;
  right: -80px;
  background: radial-gradient(circle, rgba(96,165,250,.25) 0%, transparent 55%);
}
.brand-glow-center {
  width: 250px;
  height: 250px;
  top: 35%;
  left: 25%;
  background: radial-gradient(circle, rgba(192,38,211,.12) 0%, transparent 50%);
}

/* 旋转环 */
.brand-ring {
  position: absolute;
  border-radius: 50%;
}
.brand-ring-outer {
  width: 240px;
  height: 240px;
  top: 6%;
  left: -50px;
  border: 2px solid rgba(168,85,247,.15);
  border-top-color: rgba(168,85,247,.35);
  border-right-color: rgba(99,102,241,.2);
  animation: spin-slow 40s linear infinite;
}
.brand-ring-inner {
  width: 180px;
  height: 180px;
  bottom: 12%;
  right: -35px;
  border: 1.5px solid rgba(96,165,250,.12);
  border-bottom-color: rgba(96,165,250,.3);
  border-left-color: rgba(168,85,247,.15);
  animation: spin-reverse 30s linear infinite;
}

/* 3D 翻滚方块 */
.brand-cube {
  position: absolute;
  top: 10%;
  right: 12%;
  width: 50px;
  height: 50px;
  border: 1.5px solid rgba(168,85,247,.2);
  border-radius: 10px;
  background: rgba(168,85,247,.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: tumble3d 20s linear infinite;
}

/* 轨道粒子 */
.brand-orbit-dot {
  position: absolute;
  top: 30%;
  left: 55%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(168,85,247,.6);
  box-shadow: 0 0 12px rgba(168,85,247,.4);
  animation: float-orbit 15s ease-in-out infinite;
}

/* 脉冲环 */
.brand-pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(99,102,241,.15);
  animation: pulse-ring 6s ease-in-out infinite;
}
.brand-pulse-ring-1 {
  width: 100px;
  height: 100px;
  top: 45%;
  left: 15%;
}
.brand-pulse-ring-2 {
  width: 70px;
  height: 70px;
  top: 50%;
  left: 18%;
  border-color: rgba(168,85,247,.1);
  animation-delay: 2s;
}

/* 3D 漂移面板 */
.brand-glass-panel {
  position: absolute;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,.06);
}
.brand-glass-panel-lg {
  top: 8%;
  right: 5%;
  width: 120px;
  height: 75px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(168,85,247,.08), rgba(96,165,250,.05));
  box-shadow: 0 8px 32px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.06);
  animation: drift-diagonal 18s ease-in-out infinite;
}
.brand-glass-panel-sm {
  bottom: 22%;
  left: 4%;
  width: 70px;
  height: 70px;
  border-radius: 14px;
  background: linear-gradient(225deg, rgba(96,165,250,.08), rgba(192,38,211,.04));
  box-shadow: 0 6px 24px rgba(0,0,0,.12);
  animation: drift-diagonal 22s ease-in-out infinite 5s;
}

/* 3D 菱形线框 */
.brand-diamond {
  position: absolute;
  top: 38%;
  right: 8%;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(168,85,247,.1);
  animation: tumble3d 25s linear infinite reverse;
}

/* 发光粒子 */
.brand-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

/* 微光扫过 */
.brand-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(168,85,247,.06), rgba(255,255,255,.08), rgba(168,85,247,.06), transparent);
  animation: shimmer-sweep 12s ease-in-out infinite;
  pointer-events: none;
}

/* ==================== 品牌内容 ==================== */
.brand-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 32px;
  animation: fadeInUp 0.6s ease-out forwards;
}

/* 科技 Logo */
.tech-logo {
  position: relative;
  width: 56px;
  height: 56px;
}
.tech-logo-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}
.tech-logo-ring-outer {
  inset: 0;
  border-top-color: #a855f7;
  border-right-color: #6366f1;
  animation: spin-slow 6s linear infinite;
}
.tech-logo-ring-inner {
  inset: 6px;
  border-width: 1.5px;
  border-bottom-color: #60a5fa;
  border-left-color: #a855f7;
  animation: spin-reverse 4s linear infinite;
}
.tech-logo-core {
  position: absolute;
  inset: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  box-shadow: 0 0 20px rgba(139,92,246,.5), 0 0 40px rgba(139,92,246,.2);
}

.brand-title {
  margin-top: 24px;
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 16px rgba(0,0,0,.3);
}
.brand-divider {
  margin-top: 20px;
  width: 40px;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, #a855f7, #60a5fa);
  box-shadow: 0 0 10px rgba(139,92,246,.35);
}
.brand-tagline {
  margin-top: 16px;
  font-size: 14px;
  color: rgba(255,255,255,.5);
  letter-spacing: 0.06em;
}

.brand-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
  font-size: 11px;
  color: rgba(255,255,255,.18);
  letter-spacing: 0.04em;
}

/* ==================== 右侧表单区 ==================== */
.login-main {
  flex: 1;
  display: flex;
  overflow: auto;
}
.login-form {
  width: 420px;
  max-width: calc(100vw - 80px);
  margin: auto;
  padding: 60px 0 40px;
}

/* Logo 行 */
.login-header {
  margin-bottom: 32px;
}
.login-header .logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
}
.login-header .logo img {width: 40px;height: 40px;vertical-align: bottom;margin-right: 10px;border-radius: 10px;}
.login-header .logo label {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.login-welcome {
  margin-top: 8px;
  font-size: 14px;
  color: #94a3b8;
  margin-left: 48px;
}

/* Tab 样式覆盖 */
.login-form :deep(.n-tabs .n-tabs-tab) {
  font-size: 14px;
}
.login-form :deep(.n-tabs .n-tabs-tab--active) {
  color: #1e293b;
  font-weight: 500;
}
.login-form :deep(.n-tabs .n-tabs-tab:not(.n-tabs-tab--active)) {
  color: #94a3b8;
}

/* 验证按钮 */
.captcha-btn {
  height: 36px !important;
  border-radius: 6px !important;
  border: 1px dashed #d1d5db !important;
  background: #fafbfc !important;
  color: #64748b !important;
}
.captcha-btn:hover {
  border-color: #8b5cf6 !important;
  color: #8b5cf6 !important;
  background: rgba(139,92,246,.04) !important;
}

/* 记住/忘记 */
.login-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
}
.login-link {
  font-size: 13px;
  color: #8b5cf6;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  height: 48px !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  letter-spacing: 0.1em !important;
  background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
  border: none !important;
  /* box-shadow: 0 4px 16px rgba(139,92,246,.3) !important; */
  transition: all 0.3s ease !important;
}
.login-btn:hover {
  filter: brightness(1.08) !important;
  /* box-shadow: 0 6px 24px rgba(139,92,246,.4) !important; */
}

/* 底部注册 */
.login-bottom-text {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}
.login-bottom-text .login-link {
  margin-left: 4px;
}

/* ==================== 动画关键帧 ==================== */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes tumble3d {
  0% { transform: perspective(600px) rotateX(0deg) rotateY(0deg); }
  25% { transform: perspective(600px) rotateX(90deg) rotateY(45deg); }
  50% { transform: perspective(600px) rotateX(180deg) rotateY(90deg); }
  75% { transform: perspective(600px) rotateX(270deg) rotateY(135deg); }
  100% { transform: perspective(600px) rotateX(360deg) rotateY(180deg); }
}
@keyframes float-orbit {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -20px) rotate(90deg); }
  50% { transform: translate(-10px, 25px) rotate(180deg); }
  75% { transform: translate(-25px, -15px) rotate(270deg); }
}
@keyframes pulse-ring {
  0% { transform: scale(.8); opacity: .6; }
  50% { transform: scale(1.15); opacity: .25; }
  100% { transform: scale(.8); opacity: .6; }
}
@keyframes drift-diagonal {
  0%, 100% { transform: translate(0, 0) perspective(500px) rotateY(0deg) rotateX(0deg); }
  33% { transform: translate(20px, -15px) perspective(500px) rotateY(-15deg) rotateX(5deg); }
  66% { transform: translate(-15px, 20px) perspective(500px) rotateY(10deg) rotateX(-8deg); }
}
@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes particle-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.1); }
}
@keyframes particle-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-25px, 20px) scale(0.95); }
}
@keyframes particle-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15px, 25px) scale(1.05); }
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .login-brand {
    display: none;
  }
}
@media (max-width: 640px) {
  .login-form {
    width: 100%;
    padding: 20px 32px 40px;
  }
}
</style>
