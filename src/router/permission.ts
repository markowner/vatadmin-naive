import router from './index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import tools from '@/utils/tools'
import Request from '@/utils/axios'
import { usePermissionStore } from '@/store/permission'
import { useUserStore } from '@/store/user'
import api from '@/vat/vat_api.json'
var isGetRoute: Boolean = false

router.beforeEach(async (to, from, next) => {
    //开始进度条
    NProgress.start()
    //设置页面标题
    document.title = tools.pageTitle(to.meta.title)
    //检测是否已登录
    const isLogin = getToken()
    if (isLogin) {
        if (to.path === '/login' || to.path === '/install') {
            next({ path: '/' })
            NProgress.done()
        } else {
            if(!isGetRoute){
                const userInfo = await useUserStore().userInfo()
                //获取菜单
                const menus: [] = userInfo.menus || []
                const accessRoutes = await usePermissionStore().generateRoutes(menus)
                //加入到路由
                accessRoutes.forEach( item => {
                    router.addRoute('layout', item)
                })
                isGetRoute = true
                next({...to, replace: true})
            }else{
                next()
            }
        }
    } else {
        //增加安装检测
        //增加安装检测
        const isInstalled = await checkInstallStatus()
        console.log(isInstalled)
        if(isInstalled == -1){
            tools.notice.message.error('检查安装状态失败, 请检查后端服务是否启动');
            console.log('检查安装状态失败, 请检查后端服务是否启动');
            return
        }

        if(!isInstalled){
            // 如果已经是安装页面，直接放行，避免无限重定向
            if(to.path === '/install'){
                next()
                NProgress.done()
            }else{
                next('/install')
                NProgress.done()
            }
        }else{
            // 允许访问不需要权限的页面（包括/login）
            if (!to.meta.is_permission && to.path !== '/login') {
                next('/login')
                NProgress.done()
            } else {
                // 需要权限的页面重定向到登录
                next()
                NProgress.done()
            }
        }
    }
})

router.afterEach(() => {
    //进度条完成
    NProgress.done()
})

// 新增安装状态检查函数
async function checkInstallStatus() {
    try {
        const res = await Request.request(api.api_list.installCheck)
        return res.data.installed
    } catch (e) {
        return -1
    }
}