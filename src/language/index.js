import { createI18n } from 'vue-i18n';
import zh from "./i18n/zh"
import en from "./i18n/en"
// 中英文语言资源
const messages = {
    zh,en
}


const i18n = createI18n({
    locale: 'zh', // 默认语言
    fallbackLocale: 'en', // 后备语言
    messages, // 配置语言资源
});

export default i18n;
