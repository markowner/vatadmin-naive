
import { defineStore } from "pinia";
import tools from '@/utils/tools'

export const usePermissionStore = defineStore("permission", {
    state: () => (
        {
            routes: [],
            menus: []
        }
    ),
    actions: {
        //设置用户信息
        setRoutes(routes: []) {
            this.routes = routes
        },
        setMenus(menus: []) {
            this.menus = menus
        },
        //路由扁平化
        flatAsyncRoutes(routes, breadcrumb=[]) {
            let res = []
            routes.forEach(route => {
                const tmp = {...route}
                if (tmp.children) {
                    let childrenBreadcrumb = [...breadcrumb]
                    childrenBreadcrumb.push(route)
                    let tmpRoute = { ...route }
                    tmpRoute.meta.breadcrumb = childrenBreadcrumb
                    delete tmpRoute.children
                    res.push(tmpRoute)
                    let childrenRoutes = this.flatAsyncRoutes(tmp.children, childrenBreadcrumb)
                    childrenRoutes.map(item => {
                        res.push(item)
                    })
                } else {
                    let tmpBreadcrumb = [...breadcrumb]
                    tmpBreadcrumb.push(tmp)
                    tmp.meta.breadcrumb = tmpBreadcrumb
                    res.push(tmp)
                }
            })
            return res
        },

        //过滤树
        treeFilter(tree, func) {
            return tree.map(node => ({ ...node })).filter(node => {
                node.children = node.children && this.treeFilter(node.children, func)
                return func(node) || (node.children && node.children.length)
            })
        },
        generateRoutes(menus: []) {
            return new Promise(resolve => {
                this.setMenus(menus)
                let accessedRoutes = tools.menuFormat.filterAsyncRouter(menus)
                this.setRoutes(accessedRoutes)
                resolve(accessedRoutes)
            })
        }
    },
    getters: {
        getRoutes: (state) => state.routes,
        getMenus: (state) => state.menus,
    }
});