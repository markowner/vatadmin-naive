
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            name: "layout",
            path: "/",
            component: () => import('@/layout/index.vue'),
            redirect: '/home',
            children: [
                {
                    path: "/usercenter",
                    name: "usercenter",
                    component: () => import("@/views/home/usercenter.vue"),
                    meta:{ title: "个人中心", is_permission: 0}
                }
            ]
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/public/login.vue"),
            meta:{ title: "登录", is_permission: 0}
        },
        {
            path: "/install",
            name: "install",
            component: () => import("@/views/public/install.vue"),
            meta:{ title: "在线安装", is_permission: 0}
        }
    ]
})

export default router
