import CryptoJS from 'crypto-js'
import {h, inject, render} from "vue";
import {
    createDiscreteApi,
    NIcon,
    NTag,
    NSwitch,
    NButton,
    NAvatar,
    NImage,
    NCarousel,
    NImageGroup,
    NPopover, NTooltip, NGradientText
} from "naive-ui";
import {RouterLink} from "vue-router";
import path from 'path-browserify'
import Request from '@/utils/axios'
import router from '@/router'
import { useUserStore } from '@/store/user'
import i18n from "@/language";
import VatLink from '@/components/VatLink.vue'
import VatJson from '@/components/VatJson.vue'

const { message, notification, dialog, loadingBar, modal } = createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar', 'modal']
)
const tools = {}

tools.notice = {
    message: message,
    dialog: dialog,
    notification: notification,
    loadingBar: loadingBar,
    modal: modal,
}

tools.data = {
    set(key: String, data, datetime = 0) {
        //加密
        if(import.meta.env.VITE_VAT_AES_KEY){
            data = tools.crypto.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_VAT_AES_KEY)
        }
        let cacheValue = {
            content: data,
            datetime: parseInt(datetime) === 0 ? 0 : new Date().getTime() + parseInt(datetime) * 1000
        }
        return localStorage.setItem(key, JSON.stringify(cacheValue))
    },
    get(key: String) {
        try {
            const value = JSON.parse(localStorage.getItem(key))
            if (value) {
                let nowTime = new Date().getTime()
                if (nowTime > value.datetime && value.datetime != 0) {
                    localStorage.removeItem(key)
                    return null;
                }
                //解密
                if(import.meta.env.VITE_VAT_AES_KEY){
                    value.content = JSON.parse(tools.crypto.AES.decrypt(value.content, import.meta.env.VITE_VAT_AES_KEY))
                }
                return value.content
            }
            return null
        } catch (err) {
            return null
        }
    },
    remove(key: String) {
        return localStorage.removeItem(key)
    },
    clear() {
        return localStorage.clear()
    }
}

tools.cookie = {
    set(name: String, value: String, config={}) {
        var cfg = {
            expires: null,
            path: null,
            domain: null,
            secure: false,
            httpOnly: false,
            ...config
        }
        var cookieStr = `${name}=${escape(value)}`
        if(cfg.expires){
            var exp = new Date()
            exp.setTime(exp.getTime() + parseInt(cfg.expires) * 1000)
            cookieStr += `;expires=${exp.toUTCString()}`
        }
        if(cfg.path){
            cookieStr += `;path=${cfg.path}`
        }
        if(cfg.domain){
            cookieStr += `;domain=${cfg.domain}`
        }
        document.cookie = cookieStr
    },
    get( name: String ){
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"))
        if(arr != null){
            return unescape(arr[2])
        }else{
            return null
        }
    },
    remove(name: String, config = {}){
        var cfg = {
            path: '/',
            domain: null,
            ...config
        }
        var exp = new Date()
        exp.setTime(exp.getTime() - 1)
        let cookieStr = `${name}=;expires=${exp.toUTCString()}`
        if(cfg.domain){
            cookieStr += `;domain=${cfg.domain}`
        }
        if(cfg.path){
            cookieStr += `;path=${cfg.path}`
        }
        console.log('cookieStr', cookieStr)
        document.cookie = cookieStr
    }
}

tools.crypto = {
    //MD5加密
    MD5(data){
        return CryptoJS.MD5(data).toString()
    },
    //BASE64加解密
    BASE64: {
        encrypt(data){
            return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
        },
        decrypt(cipher){
            return CryptoJS.enc.Base64.parse(cipher).toString(CryptoJS.enc.Utf8)
        }
    },
    //AES加解密
    AES: {
        encrypt(plaintext, key){
            key = CryptoJS.enc.Hex.parse(key)
            const iv = CryptoJS.lib.WordArray.random(16);
            const ciphertext = CryptoJS.AES.encrypt(
                plaintext,
                key,
                { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
            );
            return iv.concat(ciphertext.ciphertext).toString(CryptoJS.enc.Base64);
        },
        decrypt(ciphertext, key){
            key = CryptoJS.enc.Hex.parse(key)
            ciphertext = CryptoJS.enc.Base64.parse(ciphertext);
            const iv = ciphertext.clone();
            iv.sigBytes = 16;
            iv.clamp();
            ciphertext.words.splice(0, 4); // remove IV from ciphertext
            ciphertext.sigBytes -= 16;
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: ciphertext },
                key,
                { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
            );
            return decrypted.toString(CryptoJS.enc.Utf8);
        }
    }
}

/**
 * 全屏
 * @param element
 */
tools.screen = function (element) {
    var isFull = !!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    if(isFull){
        if(document.exitFullscreen) {
            document.exitFullscreen();
        }else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }else{
        if(element.requestFullscreen) {
            element.requestFullscreen();
        }else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    }
}

tools.pageTitle = (title: String) => {
    return i18n.global.t('app_name') + (title ? '-' + title : '')
}
//获取根路由
tools.basePath = (path: String) => {
    if (!path.startsWith('/')) {
        return ''; // 如果不是以斜杠开头，则返回空字符串或抛出错误
    }

    let firstSlashIndex = path.indexOf('/', 1);
    if (firstSlashIndex === -1) {
        // 如果没有找到第二个斜杠，则说明路径只有一级目录
        return path;
    }

    return path.substring(0, firstSlashIndex);
}

tools.menuFormat = {
    //获取顶级菜单
    parentMenu(menus: []){
        const parentMenus: [] = []
        menus.forEach(item => {
            delete item.children
            parentMenus.push(item)
        })
        return parentMenus
    },
    getChild(menus:[], parent_id){
        let childMenu:[] = []
        menus.forEach(item => {
            if(parent_id == item.id){
                childMenu = item.children
            }
        })
        return childMenu
    },
    //重构路由
    filterAsyncRouter(routerMap: []): [] {
        const accessedRouters:[] = []
        routerMap.forEach(item => {
            item.meta = item.meta?item.meta:{};
            //处理外部链接特殊路由
            if(item.meta.type=='iframe'){
                item.meta.url = item.path;
                item.path = `/i/${item.name}`;
            }

            item.label = this.toLink(item.title, item.path)
            // item.icon = this.renderIcon(item.icon)

            //MAP转路由对象
            let route = {
                path: item.path,
                name: item.name,
                meta: item.meta,
                redirect: item.redirect,
                component: this.loadComponent(item.component)
            }
            if(item.children.length > 0){
                route.children = this.filterAsyncRouter(item.children)
            }
            accessedRouters.push(route)
        })
        return accessedRouters
    },
    //naiveui 路由重构
    filterAsyncRouterNaive(routerMap: []): [] {
        const accessedRouters:[] = []
        routerMap.forEach(item => {
            //MAP转路由对象
            let route = {
                id: item.id,
                key: item.path,
                label: item.children.length > 0 ? item.title : this.toLink(item.title, item.path),
                icon: this.renderIcon(item.icon),
                icons: item.icon,
                redirect: item.redirect,
                // component: this.loadComponent(item.component)
            }
            if(item.children.length > 0){
                route.children = this.filterAsyncRouterNaive(item.children)
            }
            accessedRouters.push(route)
        })
        return accessedRouters
    },
    filterParentAsyncRouterNaive(routerMap: []): [] {
        const accessedRouters:[] = []
        routerMap.forEach(item => {
            //MAP转路由对象
            let route = {
                id: item.id,
                key: item.path,
                label: item.children.length > 0 ? item.title : this.toLink(item.title, item.path),
                icon: this.renderIcon(item.icon),
                icons: item.icon,
                redirect: item.redirect,
            }
            accessedRouters.push(route)
        })
        return accessedRouters
    },
    filterParentAsyncRouterNaive2(routerMap: []): [] {
        const accessedRouters:[] = []
        routerMap.forEach(item => {
            //MAP转路由对象
            let route = {
                id: item.id,
                key: item.path,
                icon: this.renderIconLabel(item.icon, item.title),
                icons: item.icon,
                redirect: item.redirect,
            }
            accessedRouters.push(route)
        })
        return accessedRouters
    },
    /**
     * 过滤固定路由标签
     * @param routes
     * @param basePath
     */
    filterAffixTags(routes: [], basePath = '/') {
        let tags = []
        routes.forEach(route => {
            if (route.meta && route.meta.affix) {
                const tagPath = path.resolve(basePath, route.path)
                tags.push({
                    fullPath: tagPath,
                    path: tagPath,
                    name: route.name,
                    meta: { ...route.meta }
                })
            }
            if (route.children) {
                const tempTags = this.filterAffixTags(route.children, route.path)
                if (tempTags.length >= 1) {
                    tags = [...tags, ...tempTags]
                }
            }
        })
        return tags
    },
    //加载组件
    loadComponent(component){
        if (component) {
            let modules = import.meta.glob('../views/**/*.vue')
            return modules[`../views/${component}.vue`]
        }
    },
    renderIconLabel(icon: string, label: ''){
        return () => h('div', {class: "flex flex-direction-c flex-jc-c flex-ai-c"},[
            h(NIcon,{class: 'menu-icon ifont i-' + icon}),
            h('div', { class: 'menu-text' }, label)
        ])
    },
    //加载icon
    renderIcon(icon: string, styles: String = '') {
        if(icon){
            return () => h(NIcon, {
                class: 'ifont i-' + icon,
                style: styles
            })
        }else{
            return () => {}
        }
    },
    //跳转链接
    toLink(label: string, url: string){
        return () => h(RouterLink, {
                to: {
                    path: url
                }
            },
            { default: () => label }
        )
    },
}

tools.pages = {
    colorList: ['#18a058','#4098FCFF','#f0a020','gray','#d03050'],
    mergeObjects(target: {}, source: {}) {
        for (let key in source) {
            // 确保属性在目标对象中存在
            if (key in target) {
                target[key] = source[key]; // 只覆盖目标对象中已有的属性
            }
        }
        return target;
    },
    //构建table展示列
    buildColumns2(fields: []){
        let columns: [] = []
        fields.forEach((v: {}) => {
            if(v.table_column){
                let ckey = v.alias || v.field
                columns.push({
                    title: v.comment,
                    key: v.config.dict ? ckey + '_desc' : ckey,
                    sorter: v.sorter || false,
                    order: v.order || false,
                    table_order: v.table_order,
                    table: v.table,
                    width: v.width,
                    fixed: 'left',
                    resizable: true
                })
            }
        })
        return columns
    },
    buildColumns(pageJson: {}){
        let fields = pageJson.fields
        let columns = {}
        fields.forEach((v: {}) => {
            if(v.table_column){
                let ckey = v.alias || v.field
                let res = {
                    title: v.comment,
                    key: v.config.dict ? ckey + '_desc' : ckey,
                    field: v.field,
                    ckey: ckey,
                    sorter: v.sorter || false,
                    order: v.order || false,
                    table_order: v.table_order,
                    table: v.table,
                    table_display: v.table_display,
                    width: v.width,
                    fixed: '',
                    resizable: true,
                    config: v.config
                }
                if(v.table_display){
                    res.render = (row, index) => {
                        return this.tableColumnDisplay(row, index, res, pageJson)
                    }
                }
                if(v?.fixed){
                    res.fixed = v.fixed
                }
                columns[ckey] = res
            }
        })
        return columns
    },
    buildForm(fields: [], filter_fields = []){
        let formList: [] = []
        fields.forEach((v: {}) => {
            if(v.form && !filter_fields.includes(v.field)){
                if(v.config.dict){
                    v.config.options = useUserStore().user.userInfo.dict[v.config.dict].options
                }
                
                formList.push({
                    label: v.comment,
                    field: v.field,
                    type: v.form_view,
                    placeholder: v?.placeholder ? v.placeholder : ['input', 'input-pair', 'input_number','password', 'textarea'].includes(v.form_view) ? '请输入' + v.comment : '请选择' + v.comment,
                    value: v.default,
                    config: v.config,
                    form_order: v.form_order
                })
            }
        })
        return this.sortColumns(formList, 'form_order')
    },
    /**
     * 生成必填验证规则
     * @param fields
     */
    buildRule(fields: []){
        let rules = {}
        fields.forEach((v: {}) => {
            if(v.form && v.form_required){
                let msg = ''
                let res = {required: true, trigger: ['input', 'blur']}
                if(['input', 'input-pair', 'input_number','password', 'textarea'].includes(v.form_view)){
                    res.message = '请输入' + v.comment
                    if(v.form_view == 'input_number'){
                        res.trigger = ['blur', 'change']
                        res.type = 'number'
                    }
                }else{
                    res.message = '请选择' + v.comment
                    res.trigger = ['blur', 'change']

                    const integerTypes = ['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint'];
                    if (integerTypes.some(type => v.type.startsWith(type))) {
                        res.type = 'number';
                    }

                    if(v.form_view == 'form_table'){
                        res.type = 'array'
                    }
                    if(v.config.props && v.config.props.multiple){
                        res.type = 'array'
                    }
                }
                rules[v.field] = res
            }
        })
        return rules
    },
    //排序
    sortColumns(fields: [], sortField = 'table_order'){
        fields.sort((a, b) => a[sortField] - b[sortField]);
        return fields
    },
    //构建搜索
    buildSearch(fields: [], filter_fields = {}){
        let query = router.currentRoute.value.query
        if(query.filter){
            filter_fields = JSON.parse(query.filter)
        }
        let search: [] = []
        fields.forEach((v: {}) => {
            if(v.search){
                if(v.config.dict){
                    v.config.options = useUserStore().user.userInfo.dict[v.config.dict].options
                }
                let placeholderText: any = ''
                if('input' == v.search_view){
                    placeholderText = '请输入' + v.comment
                }else if('input-pair' == v.search_view){
                    placeholderText = ['从','到']
                }else{
                    placeholderText = '请选择' + v.comment
                }
    
                search.push({
                    label: v.comment,
                    field: v.table_alias ?  v.table_alias +'.'+ v.field : v.field,
                    type: v.search_view,
                    placeholder: placeholderText,
                    default: filter_fields?.[v.field] || null,
                    config: v.config
                })
            }
        })
        return search
    },
    //设置搜索字段默认值
    searchFieldDefault(search, fieldValues) {
        return search.map(item => ({
            ...item, // 保留原有属性
            default: fieldValues[item.field] ?? item.default // 若 fieldValues 中有定义，则覆盖默认值
        }));
    },
    renderButton(label: string, attr = {}, callback: Function){
        return h(NButton, {...attr, size: 'tiny', onClick: () => {callback()}}, {default: () => label})
    },
    renderTextColor(list: any, value: any, label: any){
        let color = ''
        if(list instanceof Array){
            for(let i=0;i<list.length;i++){
                if(list[i] instanceof Object){
                    color = list[i][value]
                }else{
                    if(value == list[i]){
                        color = this.colorList[i]
                    }
                }
            }
        }else if(list instanceof Object){
            for(let i in list){
                if(value == i){
                    color = list[i]
                }
            }
        }
        return h('span', {style: 'color:' + color + ';font-weight: bold'}, {default:() => label})
    },
    renderTextCustom(value: any, field: {}){
        let color = ''
        if(field.config && field.config.map){
            for(let key in field.config.map){
                if(value == key){
                    color = field.config.map[key]
                    break;
                }
            }
        }
        //判断是否是#号开头，如果是#号开头，是颜色值，如果不是则当class使用
        let textStyle = {}
        if(!color || !color.startsWith('#')){
            textStyle = {class: color}
        }else{
            textStyle = {style: 'color:' + color + ';font-weight: bold'}
        }

        return  h('span', {...textStyle}, {default:() => value})
    },
    renderMapping(value: any, field: {}){
        let mode: any = ''
        if(field.config && field.config?.mapping){
            for(let key in field.config?.mapping){
                if(value == key){
                    mode = field.config?.mapping[key]
                    break;
                }
            }
        }
        let renderValue = value
        if(field.config?.dict){
            renderValue = useUserStore().user.userInfo.dict[field.config.dict].options.find((item: {value: any}) => item.value == value)?.label || value
        }

        let textType = field.config?.mapping_type || 'text'
        if(textType == 'text'){
            let textStyle: any = {}
             if(mode){
                if(mode instanceof Object){
                    textStyle = mode
                }else{
                    if(mode.startsWith('#')){
                        textStyle.style = 'color:' + mode + ';font-weight: bold'
                    }else{
                        textStyle.class = mode    
                    }
                }
            }
            return  h('span', {...textStyle}, {default:() => renderValue})
        }else if(textType == 'gradient-text'){
            let tagAttr = mode instanceof Object ? mode : {type: mode}
            return  h(NGradientText, {...field.config?.render_props,...tagAttr}, {default:() => renderValue})
        }else if(textType == 'tag'){
            let tagAttr = mode instanceof Object ? mode : {type: mode}
            return h(NTag,{ style: { marginRight: '6px' }, size:'small', round: true, bordered: false,...field.config?.render_props, ...tagAttr},
                {
                    default: () => renderValue
                }
            )     
        }
    },
    renderSwitch(row: {}, apiUrl: {} | string, field = 'status' , switchValue = {checked:0, unchecked: 1}){
        return h(NSwitch, {
            'size':'small',
            'checked-value': switchValue.checked,
            'unchecked-value': switchValue.unchecked,
            'value': row[field],
            'on-update:value': (checked) => {
                row[field] = checked
                Request.request( apiUrl, {ids: row.id, [field]: checked}).then((res: {}) => {
                    tools.notice.message.success(res.msg)
                }).catch((err: any) => {
                    console.log(err)
                })
            }
        })
    },
    renderTags(list:[], tagType='info'){
        return list.map((item) => {
            return h(
                NTag, {
                    style: {
                        marginRight: '6px'
                    },
                    size:'small',
                    round: true,
                    type: tagType,
                    bordered: false
                },
                {
                    default: () => item
                }
            )
        })
    },
    renderIcon(icon: string){
        return icon ? h('i', {class:'ifont i-' + icon}) : ''
    },
    renderTooltip(content: string, label: string){
        return h(NTooltip, {}, {trigger: () => { return h('div', {class: 'multiline-ellipsis pointer',innerHTML: content}) }, default: () => {
            return [
                h('div', {style: "max-width:600px; maxHeight: 70vh;",innerHTML: label}, {})
            ]
        }})
    },
    renderPopover(content: string, label: string){
        return h(NPopover, {}, {trigger: () => { return h('div', {class: 'multiline-ellipsis pointer',innerHTML: content}) }, default: () => {
            return [
                h('div', {style: "max-width:600px; maxHeight: 70vh;",innerHTML: label}, {})
            ]
        }})
    },
    renderLink(link: string, fieldConfig: any){
        console.log(fieldConfig)
         return h(VatLink, {href: link, ...fieldConfig.config.props})
    },
    renderJson(json: string, fieldConfig: any){
        return json ? h(VatJson, {data: typeof json === 'string' && json ? JSON.parse(json) : json, ...fieldConfig.config.props}) : ''
    },
    renderAvatar(avatar: string){
        return avatar ? h(NAvatar, {size: 'small', src: this.cdnUrl(avatar)}) : ''
    },
    renderImage(image: string){
        return image ? h(NImage, {width: '80px', height:'80px', src: this.cdnUrl(image)}) : ''
    },
    renderImages(images: any){
        let imageArr = typeof images === 'string' ? (images ? JSON.parse(images) : []) : (images ? images : [])
        let imageNodes = imageArr.map((item, index) =>
            h(NImage, {
                key: index,
                width: 120,
                src: this.cdnUrl(item),
            })
        );
        return h(NImageGroup, {showToolbarTooltip: true}, {default:() => {
            return h('div', {class:'flex', style: "width:120px;height:120px;overflow-y:hidden;"}, {default:() => imageNodes})
        }})
    },
    renderCarousel(images: any){
        let imgArr = typeof images === 'string' ? (images ? JSON.parse(images) : []) : (images ? images : [])
        let imgNodes = imgArr.map((item, index) =>
            h('img', {
                key: index,
                style: 'width: 100%; height: 120px; object-fit: cover;',
                src: this.cdnUrl(item),
            })
        );
        return h(NCarousel, {style: 'height: 120px;', showArrow: true}, {default: () => imgNodes})
    },
    renderFiles(file_url: string, file_name: string){
        return  h('div', {}, [h('i', {class:"ifont i-file", style:"margin-right:5px;"}), h('a', {href: this.cdnUrl(file_url)}, {default: () =>  file_name})])
    },
    renderButtonModal(innerHtml: string){
        return h(NButton, {size: 'tiny', type: 'primary', onClick: () => {
            tools.notice.modal.create({
                title: '详情',
                preset: 'card',
                style: {
                    width: '60%'
                },
                size: 'small',
                segmented: {content: true},
                content: () => { return h('div', { class: 'vat-detail-img', style:'max-height:70vh;overflow:hidden;overflow-y: scroll',innerHTML: innerHtml})}
            })
        }}, {default: () => {
            return '查看'
        }})
    },
    cdnUrl(url: string){
        // 检查URL是否以"http"或"//"(协议相对URL)开头
        if (/^https?:\/\//i.test(url) || /^\/\//i.test(url)) {
            return url;
        } else {
            // 假设这是相对路径，添加默认域名
            // 如果URL已经是以"/"开头，我们只需要添加域名
            const userStore = useUserStore()
            if (/^\//.test(url)) {

                return userStore.user.userInfo.config.cdn_url + url;
            } else {
                // 否则，添加"/"来确保路径正确
                return userStore.user.userInfo.config.cdn_url + '/' + url;
            }
        }
    },
    tableColumnDisplay(row, index, res, pageJson){
        switch(res.table_display){
            case 'mapping':
                return row[res.field] ? this.renderMapping(row[res.field], res) : ''
            case 'text':
                return this.renderTextColor([0,1,1,1,1], row[res.field], row[res.key])
            case 'text1':
                return this.renderTextColor([1,0,0,0,0], row[res.field], row[res.key])
            case 'switch':
                return this.renderSwitch(row, pageJson.api_list.lock, res.field, res.config.switchValue ? res.config.switchValue : {checked:0, unchecked: 1})
            case 'tags':
                return this.renderTags(row[res.key])
            case 'icon':
                return this.renderIcon(row[res.key])
            case 'tooltip':
                return this.renderTooltip(row[res.key], row[res.key])
            case 'popover':
                return this.renderPopover(row[res.key], row[res.key])
            case 'button_modal':
                return this.renderButtonModal(row[res.field])
            case 'avatar':
                return this.renderAvatar(row[res.field])
            case 'image':
                return this.renderImage(row[res.field])
            case 'images':
                return this.renderImages(row[res.field])
            case 'carousel':
                return this.renderCarousel(row[res.field])
            case 'link':
                return row[res.field] ? this.renderLink(row[res.field], res) : ''
            case 'json':
                return row[res.field] ? this.renderJson(row[res.field],res) : ''
        }
    }
}

tools.common = {
    split(str: String, delimiter: any) {
        return str.split(delimiter).map(item => item.trim()).filter(item => item !== '');
    },
    isNumeric(value: any) {
        return /^-?\d+(\.\d+)?(?:[eE][-+]?\d+)?$/.test(value);
    },
    toNumber(value: any) {
        const num = Number(value);
        return Number.isFinite(num) ? num : null
    }
}
export default tools