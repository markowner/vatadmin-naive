import axios, { AxiosError } from 'axios'
import router from '@/router'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import { createDiscreteApi, NButton } from 'naive-ui'

// 数据返回的接口
// 定义请求响应参数，不含data
interface Result {
    code: number;
    msg: string
}

// 请求响应参数，包含data
interface ResultData<T = any> extends Result {
    data?: T;
}
const URL: string = ''
enum RequestEnums {
    TIMEOUT           = 10000,
    TOKEN_FAILURE     = 401, // 登录失效
    INSTALL_NO        = 402, // 系统未安装
    FORBIDDEN         = 403, // 没有权限
    SUCCESS           = 200, // 请求成功
}
const config = {
    // 默认地址
    baseURL: URL as string,
    // 设置超时时间
    timeout: RequestEnums.TIMEOUT as number,
    // 跨域时候允许携带凭证
    withCredentials: true
}

let MessageBox_401_show: Boolean = false
interface RequestConfig {
    url: String,
    method: String
}

const { message, notification, dialog, loadingBar, modal } = createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar', 'modal']
)
class Request {
    // 定义成员变量并指定类型
    service: AxiosInstance;
    public constructor(config: AxiosRequestConfig) {
        // 实例化axios
        this.service = axios.create(config);

        /**
         * 请求拦截器
         * 客户端发送请求 -> [请求拦截器] -> 服务器
         * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
         */
        this.service.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                const token = getToken() || '';
                return {
                    ...config,
                    headers: {
                        'authorization': 'Bearer ' + token,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            },
            (error: AxiosError) => {
                // 请求报错
                Promise.reject(error)
            }
        )

        /**
         * 响应拦截器
         * 服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
         */
        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                const {data, config} = response; // 解构

                if (config && config.responseType === 'blob') { // 判断是不是下载请求
                    this.downloadFile(response)
                    return
                }else{
                    
                    if (data.code === RequestEnums.INSTALL_NO) {
                        // 登录信息失效，应跳转到登录页面，并清空本地的token
                        message.error(data.msg);
                        router.replace({path: '/install'})
                        return Promise.reject(data);
                    }
                    if (data.code === RequestEnums.TOKEN_FAILURE) {
                        // 登录信息失效，应跳转到登录页面，并清空本地的token
                        message.error(data.msg);
                        return Promise.reject(data);
                    }
                    if (data.code === RequestEnums.FORBIDDEN) {
                        // 没有权限，应跳转到403页面
                        message.error(data.msg);
                        return Promise.reject(data);
                    }
                    // 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
                    if (data.code !== RequestEnums.SUCCESS) {
                        message.error(data.msg); // 此处也可以使用组件提示报错信息
                        return Promise.reject(data)
                    }
                }
                return data;
            },
            (error: AxiosError) => {
                const {response} = error;
                if (response) {
                    this.handleCode(response)
                }
                if (!window.navigator.onLine) {
                    message.error('网络连接失败');
                }
                return Promise.reject(error)
            }
        )
    }
    handleCode(response):void {
        switch (response.status) {
            case 400:
            case 403:    
                message.error(response.data.msg);
                break;
            case 401:
                if(!MessageBox_401_show) {
                    MessageBox_401_show = true
                    dialog.warning({
                        title: '警告',
                        content: () => '当前用户已被登出或无权限访问当前资源，请尝试重新登录后再操作。',
                        positiveText: '重新登录',
                        onPositiveClick: () => {
                            message.success('重新登录')
                            MessageBox_401_show = false
                            removeToken()
                            router.replace({path: '/login'})
                        },
                        onClose: () => {
                            MessageBox_401_show = false
                        }
                    })
                }
                break;
            default:
                message.error('请求失败');
                // ElMessage.error('请求失败');
                break;
        }
    }

    // 常用方法封装
    get<T>(url: string, params?: object): Promise<ResultData<T>> {
        return this.service.get(import.meta.env.VITE_APP_PROXY_PREFIX + url, {params});
    }
    post<T>(url: string, params?: object, config?: object): Promise<ResultData<T>> {
        return this.service.post(import.meta.env.VITE_APP_PROXY_PREFIX + url, params, config);
    }
    put<T>(url: string, params?: object, config?: object): Promise<ResultData<T>> {
        return this.service.put(import.meta.env.VITE_APP_PROXY_PREFIX + url, params, config);
    }
    delete<T>(url: string, params?: object, config?: object): Promise<ResultData<T>> {
        return this.service.delete(import.meta.env.VITE_APP_PROXY_PREFIX + url, {params})
    }

    request<T>(urlObj?: RequestConfig | String | Object, params?: object, config?: object): Promise<ResultData<T>> {
        if(typeof urlObj !== 'string') {
            let url = import.meta.env.VITE_APP_PROXY_PREFIX + urlObj.url
            switch(urlObj.method){
                case 'get':
                    return this.service.get(url, Object.assign({},{'params': params}, config))
                case 'post':
                    return this.service.post(url, params, config);
                case 'put':
                    return this.service.put(url, params, config);
                case 'delete':
                    return this.service.delete(url, {params});
                default:
                    message.error('错误的请求');
                    break;
            }
        }else{
            return this.service.get(import.meta.env.VITE_APP_PROXY_PREFIX + urlObj, Object.assign({},{'params': params}, config))
        }
    }

    /**
     * 上传header
     */
    uploadHeaders(){
        const token = getToken() || '';
        return { 'authorization': 'Bearer ' + token }
    }

    /**
     * 上传图片
     */
    uploadAction() {
        return import.meta.env.VITE_APP_PROXY_PREFIX + '/app/vatadmin/basic/tools/upload'
    }

    downloadFile(response) {
        // 检查响应数据
        if (!(response.data instanceof Blob)) {
            throw new Error('文件内容无效')
        }

        // 解析文件名
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'default.csv';

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/i) || contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
            if (filenameMatch) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }

        // 创建 Blob 并触发下载
        const blob = new Blob([response.data], { type: response.headers['content-type']});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link); // 兼容 Firefox
        link.click();
        document.body.removeChild(link); // 清理
        window.URL.revokeObjectURL(link.href); // 释放内存
    }
}

// 导出一个实例对象
export default new Request(config);