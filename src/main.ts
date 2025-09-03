import { createApp } from 'vue'
import { createPinia } from "pinia"
import NaiveUi from 'naive-ui'
import Captcha from '@kkokk/captcha'
import router from './router'
import i18n from './language'
import api from './vat/vat_api.json'
import tools from "./utils/tools"
import "./utils/socket"
//关闭async-validator全局控制台警告
window.ASYNC_VALIDATOR_NO_WARNING = 1
import "./router/permission"
import './style.css'
// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'
import App from './App.vue'
const app = createApp(App)

app.use(i18n); // 使用 i18n
app.use(NaiveUi)
app.use(Captcha)
app.use(createPinia())
app.use(router)
// 使用 provide 向子组件提供工具对象
app.provide('tools', tools);
app.provide('api', api);
app.mount('#app')
