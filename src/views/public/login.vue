<template>
  <div class="login_bg">
       <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
      <div class="bg-shape bg-shape-4"></div>
    </div>
    <div class="login_adv">
      <div class="login_adv__title">
        <h2>{{ $t('app_name') }}</h2>
        <h3>{{ $t('app_intro') }}</h3>
        <pre style="font-size: 14px;line-height: 2;">{{ $t('app_intro_detail') }}</pre>
      </div>
      <div class="login_adv__mask"></div>
      <div class="login_adv__bottom">
        © {{ $t('app_name') }} - {{ $t('app_version') }}
      </div>
    </div>
    <div class="login-form">
      <div class="login-header">
        <div class="logo">
          <img :alt="$t('app_name')" :src="state.configs?.logo || '/images/logo.jpeg'">
          <label>{{ $t('app_name') }}</label>
        </div>
      </div>
      <n-tabs
          class="card-tabs"
          default-value="signin"
          size="large"
          animated
          pane-wrapper-style="margin: 0 -4px"
          pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      >
        <n-tab-pane name="signin" tab="账号登录">
          <n-form :model="state.form" ref="loginForm" :rules="state.rules" @keyup.enter="toLogin">
            <n-form-item-row label="账号" path="username">
              <n-input v-model:value="state.form.username" placeholder="请输入账号"/>
            </n-form-item-row>
            <n-form-item-row label="密码" path="password" autocomplete>
              <n-input type="password" v-model:value="state.form.password" :input-props="{autocomplete:''}"  placeholder="请输入密码"/>
            </n-form-item-row>
            <n-form-item-row label="验证" path="captcha" required>
              <n-button @click="toOpenCaptcha" class="w100">安全验证</n-button>
            </n-form-item-row>
          </n-form>
          <n-button type="primary" block secondary strong @click="toLogin">
            登录
          </n-button>
        </n-tab-pane>
      </n-tabs>
    </div>
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
  form:{
    username: '',
    password: '',
    captcha: ''
  },
  rules:{
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

const loginForm = ref(null)
const userStore = useUserStore()

/**
 * 账号密码登录
 */
function toLogin(){
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

/**
 * 请求验证数据
 */
function getSliderOptions(){
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

/**
 * 打开验证
 */
function toOpenCaptcha(){
  state.captchaVisible = true
  getSliderOptions()
}

function check(sliderKey, sliderX, done, error)
{
  // 这里应该是验证是否成功的接口
  if(sliderX > state.captchaX - 8 && sliderX < state.captchaX + 8) {
    state.form.captcha = tools.crypto.BASE64.encrypt(JSON.stringify({k: sliderKey, x: sliderX, t: 'slider'}))
    state.captchaVisible = false
    // 验证成功
    toLogin()
  } else {
    // 验证错误
    error()
  }
}

// 关闭触发
function close() {

}

/**
 * 账号密码登录
 */
function configsGet(){
  Request.request(api.api_list.configs, {}).then(res => {
    state.configs = res.data
  }).catch(err => {
    console.log(err)
  })
}
configsGet()
</script>

<style scoped>
.login_bg {width: 100%;height: 100vh;background: #fff;display: flex;}
.login_adv {
  width: 40%;
  /* background-color: #555; */
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  /* background-image: url('/src/assets/images/logo.jpeg'); */
  background:  linear-gradient(135deg, #667eea 0%, #764ba2 100%);;
}
.login_adv__title {color: #fff;padding: 40px;position: absolute;top:0px;left:0px;right: 0px;z-index: 2;}
.login_adv__title h2 {font-size: 40px;}
.login_adv__title h4 {font-size: 18px;margin-top: 10px;font-weight: normal;}
.login_adv__title p {font-size: 14px;margin-top:10px;line-height: 1.8;color: rgba(255,255,255,0.6);}
.login_adv__title div {margin-top: 10px;display: flex;align-items: center;}
.login_adv__title div span {margin-right: 15px;}
.login_adv__title div i {font-size: 40px;}
.login_adv__title div i.add {font-size: 20px;color: rgba(255,255,255,0.6);}
.login_adv__bottom {position: absolute;left:0px;right: 0px;bottom: 0px;color: #fff;padding: 40px;background-image:linear-gradient(transparent, #000);z-index: 3;}
.login_adv__mask {position: absolute;top:0px;left:0px;right: 0px;bottom: 0px;background: rgba(0,0,0,0.5);z-index: 1;}

.login_main {flex: 1;overflow: auto;display:flex;}
.login-form {width: 400px;margin: auto;padding:20px 0;}
.login-header {margin-bottom: 40px;}
.login-header .logo {display: flex;align-items: center;}
.login-header .logo img {width: 40px;height: 40px;vertical-align: bottom;margin-right: 10px;border-radius: 10px;}
.login-header .logo label {font-size: 26px;font-weight: bold;}
.login-oauth {display: flex;justify-content:space-around;}
.login-form .el-divider {margin-top:40px;}

.login-form {
  position: relative;
  z-index: 20;
}
.login-form:deep(.el-tabs) .el-tabs__header {margin-bottom: 25px;}
.login-form:deep(.el-tabs) .el-tabs__header .el-tabs__item {font-size: 14px;}

.login-form:deep(.login-forgot) {text-align: right;}
.login-form:deep(.login-forgot) a {color: var(--el-color-primary);}
.login-form:deep(.login-forgot) a:hover {color: var(--el-color-primary-light-3);}
.login-form:deep(.login-reg) {font-size: 14px;color: var(--el-text-color-primary);}
.login-form:deep(.login-reg) a {color: var(--el-color-primary);}
.login-form:deep(.login-reg) a:hover {color: var(--el-color-primary-light-3);}

.login_config {position: absolute;top:20px;right: 20px;}

.login-form:deep(.login-msg-yzm) {display: flex;width: 100%;}
.login-form:deep(.login-msg-yzm) .el-button {margin-left: 10px;--el-button-size:42px;}

.qrCodeLogin {text-align: center;position: relative;padding: 20px 0;}
.qrCodeLogin img.qrCode {background: #fff;padding:20px;border-radius:10px;}
.qrCodeLogin p.msg {margin-top: 15px;}
.qrCodeLogin .qrCodeLogin-result {position: absolute;top:0;left:0;right: 0;bottom: 0;text-align: center;background: var(--el-mask-color);}

@media (max-width: 1200px){
  .login-form {width: 340px;}
}
@media (max-width: 1000px){
  .login_main {display: block;}
  .login_main .login_config {position: static;padding:20px 20px 0 20px;text-align: right;}
  .login-form {width:100%;padding:20px 40px;}
  .login_adv {display: none;}
}
/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.bg-shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.bg-shape-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation-delay: 5s;
}

.bg-shape-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 20%;
  animation-delay: 10s;
}

.bg-shape-4 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  right: 20%;
  animation-delay: 15s;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(50px, -50px) rotate(90deg);
  }
  50% {
    transform: translate(100px, 0) rotate(180deg);
  }
  75% {
    transform: translate(50px, 50px) rotate(270deg);
  }
}
</style>