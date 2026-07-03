import { defineStore } from "pinia";
import tools from "../utils/tools.ts";
import { getToken, removeToken, setToken } from "@/utils/auth";
import Request from '@/utils/axios'
import router from '@/router'
import VatApi from '@/vat/vat_api.json'
const PluginTokenKey = import.meta.env.VITE_VAT_PLUGIN_TOKEN_KEY
export const useUserStore = defineStore(",", {
    state: () => (
        {
            user: {
                id: tools.cookie.get('Vat-Uid') || '',
                token: getToken() || '',
                userInfo: tools.data.get('Vat-User') || {noread: 0}
            },
            plugin: {
                id: tools.cookie.get('Vat-Pid') || '',
                token: getToken(PluginTokenKey) || '',
                userInfo: tools.data.get('Vat-Plugin') || {noread: 0}
            }
        }
    ),
    actions: {
        //设置用户信息
        login(user: any) {
            this.user.token = user.access_token
            this.user.id = user.userInfo.id
            this.user.name = user.userInfo.name
            this.user.noread = user.userInfo.noread
            this.user.userInfo = user.userInfo
            this.user.userInfo.dict = user.dict
            this.user.userInfo.config = user.config
            setToken(user.access_token)
            tools.data.set('Vat-User', user.userInfo)
            tools.cookie.set('Vat-Uid', user.userInfo.id)
        },
        loginPlugin(user: any) {
            this.plugin.token = user.access_token
            this.plugin.id = user.userInfo.id
            this.plugin.name = user.userInfo.name
            this.plugin.noread = user.userInfo.noread
            this.plugin.userInfo = user.userInfo
            this.plugin.userInfo.dict = user.dict
            this.plugin.userInfo.config = user.config
            setToken(user.access_token, PluginTokenKey)
            tools.data.set('Vat-Plugin', user.userInfo)
            tools.cookie.set('Vat-Pid', user.userInfo.id)
        },
        //设置消息数量
        setNoticeCount(count: any, type:string = '+') {
            if (count !== '') {
                this.user.userInfo.noread = count
            } else {
                if(type == '+'){
                    this.user.userInfo.noread = this.user.userInfo.noread + 1
                }else{
                    this.user.userInfo.noread = this.user.userInfo.noread >= 1 ? this.user.userInfo.noread - 1 : 0
                }
            }
        },
        //获取用户信息
        userInfo(){
            return new Promise((resolve, reject) => {
                Request.request(VatApi.api_list.userInfo).then((res: {}) => {
                    this.user.userInfo.dict = res.data.dict
                    this.user.userInfo.config = res.data.config
                    this.user.userInfo.noread = res.data.userInfo.noread
                    tools.data.set('Vat-Menu', res.data.menus)
                    tools.data.set('Vat-Views', res.data.views)
                    resolve(res.data)
                }).catch((err: any) => {
                    reject(err)
                })
            })
        },
        //清空用户信息
        logout() {
            //清除token
            Request.request(VatApi.api_list.logout).then((res:any) => {
                removeToken()
                router.push('/login')
            }).catch((err: any) => {})
        }
    },
    getters: {
        getUser: (state) => state.user,
        getPlugin: (state) => state.plugin,
    }
});