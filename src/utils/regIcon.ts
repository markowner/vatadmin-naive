// registerIcons
import { createApp } from 'vue'
// import { create as registerIcons } from 'vite-plugin-icons/register'

const app = createApp({})

// 动态导入所有图标
const iconsContext = import.meta.glob('./@vicons/ionicons5/*.js', { eager: false })

Object.entries(iconsContext).forEach(([filePath, component]) => {
    const iconName = filePath.replace(/.*\/([^/]+)\.js/, '$1');
    app.component(iconName, component.default);
})
// 导出注册好的应用实例
export default app