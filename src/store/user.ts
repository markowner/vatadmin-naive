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
                id: tools.cookie.get('Vat-Uid') || '',
                token: getToken() || '',
                userInfo: tools.data.get('Vat-User') || {noread: 0}
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
            setToken(user.access_token)
            console.log(user.userInfo)
            tools.data.set('Vat-User', user.userInfo)
            tools.cookie.set('Vat-Uid', user.userInfo.id)
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
        getUser: (state) => state.user
    }
});