import { defineStore } from "pinia";
import tools from "../utils/tools.ts";
export const useSettingStore = defineStore("setting", {
    state: () => (
        {
            config: Object.assign({
                layout: 'common', // common column header
                mode: false,      // 色调  false：浅色  true：深色
                theme: 0,         // 主题 0：默认， 1：浅蓝
                lang: 'zh',       // 语言 zh en
                watermark: 1      // 水印 0：关闭，1：开启
            }, tools.data.get('Vat-Setting') ? tools.data.get('Vat-Setting') : {})
        }
    ),
    actions: {
        //设置主题
        setData(data: {}){
            this.config = data
        }
    },
    getters: {
        getConfig: (state) => state.config
    }
});