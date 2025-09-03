import { defineStore } from "pinia";
import tools from "../utils/tools.ts";
import { getToken, removeToken, setToken } from "@/utils/auth";
import Request from '@/utils/axios'
import router from '@/router'
import VatApi from '@/vat/vat_api.json'
export const useUserStore = defineStore("user", {
    state: () => (
        {
            user: {
                id:'',
                name: '',
                roles: [],
                platforms: [],
                token: getToken() || '',
                avatar: '',
                noread: 0,
                config: {},
                dict: {}
            }
        }
    ),
    actions: {
        //设置用户信息
        login(user: Object) {
            this.user.token = user.access_token
            this.user.id = user.userInfo.id
            this.user.name = user.userInfo.name
            this.user.config = user.userInfo.config
            this.user.dict = user.userInfo.dict
            this.user.noread = user.userInfo.noread
            setToken(user.access_token)
            tools.data.set('Vat-User', user.userInfo)
            tools.cookie.set('Vat-Uid', user.userInfo.id)
        },
        //设置消息数量
        setNoticeCount(count: any, type:string = '+') {
            if (count !== '') {
                this.user.noread = count
            } else {
                if(type == '+'){
                    this.user.noread = this.user.noread + 1
                }else{
                    this.user.noread = this.user.noread >= 1 ? this.user.noread - 1 : 0
                }
            }
        },
        //获取用户信息
        userInfo(){
            return new Promise((resolve, reject) => {
                Request.request(VatApi.api_list.userInfo).then((res: {}) => {
                    this.user.dict = res.data.dict
                    this.user.config = res.data.config
                    this.user.noread = res.data.userInfo.noread
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
        getUser: (state) => state.user
    }
});