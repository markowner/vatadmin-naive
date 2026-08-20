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
    NPopover, NTooltip, NGradientText,
    esAR,
    NAlert,
    NInputGroup, NInputGroupLabel, NInput
} from "naive-ui";
import {RouterLink} from "vue-router";
import path from 'path-browserify'
import Request from '@/utils/axios'
import router from '@/router'
import { useUserStore } from '@/store/user'
import { useStore } from '@/store'
import i18n from "@/language";
import VatLink from '@/components/VatLink.vue'
import VatJson from '@/components/VatJson.vue'
import VatForm from "@/components/VatForm.vue"

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
    set(key, data, datetime = 0) {
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
    get(key) {
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
    remove(key) {
        return localStorage.removeItem(key)
    },
    clear() {
        return localStorage.clear()
    }
}

tools.cookie = {
    set(name, value, config={}) {
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
    get( name ){
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"))
        if(arr != null){
            return unescape(arr[2])
        }else{
            return null
        }
    },
    remove(name, config = {}){
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

tools.pageTitle = (title) => {
    return i18n.global.t('app_name') + (title ? '-' + title : '')
}
//获取根路由
tools.basePath = (path) => {
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
    parentMenu(menus){
        const parentMenus = []
        menus.forEach(item => {
            delete item.children
            parentMenus.push(item)
        })
        return parentMenus
    },
    getChild(menus, parent_id){
        let childMenu = []
        menus.forEach(item => {
            if(parent_id == item.id){
                childMenu = item.children
            }
        })
        return childMenu
    },
    //重构路由
    filterAsyncRouter(routerMap){
        const accessedRouters = []
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
    filterAsyncRouterNaive(routerMap){
        const accessedRouters = []
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
    filterParentAsyncRouterNaive(routerMap){
        const accessedRouters = []
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
    filterParentAsyncRouterNaive2(routerMap){
        const accessedRouters = []
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
    filterAffixTags(routes, basePath = '/') {
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
    renderIconLabel(icon, label = ''){
        return () => h('div', {class: "flex flex-direction-c flex-jc-c flex-ai-c"},[
            h(NIcon,{class: 'menu-icon ifont i-' + icon}),
            h('div', { class: 'menu-text' }, label)
        ])
    },
    //加载icon
    renderIcon(icon, styles = '') {
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
    toLink(label, url){
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
    mergeObjects(target, source) {
        for (let key in source) {
            // 确保属性在目标对象中存在
            if (key in target) {
                target[key] = source[key]; // 只覆盖目标对象中已有的属性
            }
        }
        return target;
    },
    /**
     * 重置密码
     * @param ids
     */
    resetPassword(ids, apiUrl){
        // 定义一个响应式变量来存储输入框的值
        const passwordValue = ref({ password: '', password_confirm: ''})
        const dataJson = [
            {"label": "密码","field": "password","type": "password", "placeholder": "请输入新密码","value": null,"config": []},
            {"label": "确认密码","field": "password_confirm","type": "password", "placeholder": "请输入确认新密码","value": null,"config": []},
        ]
        // 创建一个对话框实例
        const resetPasswordForm = ref(null);
        tools.notice.dialog.create({
            title: '重置密码',
            content: () => h('div', { style: 'padding: 8px 0;'}, [
            h(VatForm, { 
                ref: (el) => resetPasswordForm.value = el, 
                list: dataJson, 
                rules: {
                    'password': [{required: true, message: '请输入新密码'}], 
                    'password_confirm': [
                        {required: true, message: '请输入确认新密码'},
                        {validator: (rule, value) => {
                            return !!passwordValue.value.password && passwordValue.value.password.startsWith(value) && passwordValue.value.password.length >= value.length;
                        }, message: '两次输入密码不一致',trigger: ['input']},
                        {validator: (rule, value) => {
                            return value === passwordValue.value.password
                        }, message: '两次输入密码不一致',trigger: ['blur', 'password-input']}
                    ]
                }, 
                modelValue: passwordValue.value,
                injectEl: { 
                    "before": [
                        {
                            "field" : "password",
                            "el": () => h(NAlert, {showIcon: false, type: 'warning', style: 'width: 100%;'} , {default: () => '密码必须同时包含大小写字母、数字和特殊字符'}),
                        }
                    ]
                }
             }),
            ]),
            positiveText: '确认',
            negativeText: '取消',
            onPositiveClick: () => {
            return new Promise((resolve, reject) => {
                resetPasswordForm.value?.validate((errors) => {
                    if (!errors) {
                        Request.post(apiUrl, {
                            ids: Array.isArray(ids) ? ids.join(',') : ids, 
                            password: passwordValue.value.password, 
                            password_confirm: passwordValue.value.password_confirm
                        }).then(res => {
                            tools.notice.message.success(res.msg)
                            resolve(res)
                        }).catch(err => {
                            console.log(err)
                        })
                    } else {
                        // 验证失败，返回false阻止关闭
                        reject(errors)
                    }
                    })
                })
            },
            onNegativeClick: () => {
            // 取消操作，对话框会自动关闭
            }
        })
    },
    /**
     * 操作列
     * @param row
     * @param index
     * @returns {*[]}
     */
    handleColumn(pageJsonData, row, index, editForm, vPage, callback = {}) {
        let columns = []
        if (pageJsonData.tools.edit.show && tools.data.get('Vat-Views').includes(pageJsonData.tools.edit.permission_key)) {
            columns.push(
                h(NButton,
                    {
                        size: 'tiny',
                        type: 'primary',
                        secondary: true,
                        onClick: () => {
                            if (typeof callback?.editCallback === "function") {
                                callback.editCallback('edit', {row, index})
                            }else{
                                editForm.value.type('edit').injectData(row).show()
                            }
                        }
                    },
                    {default: () => '编辑'}
                )
            )
        }
        if (pageJsonData.tools?.detail?.show && tools.data.get('Vat-Views').includes(pageJsonData.tools?.detail?.permission_key)) {
            columns.push(
                h(NButton,
                    {
                        size: 'tiny',
                        type: 'warning',
                        secondary: true,
                        onClick: () => {
                            if (typeof callback?.detailCallback === "function") {
                                callback.detailCallback('detail', {row, index})
                            }else{
                                editForm.value.type('detail').injectData(row).show()
                            }
                        }
                    },
                    {default: () => '详情'}
                )
            )
        }
        if (pageJsonData.tools.delete.show && tools.data.get('Vat-Views').includes(pageJsonData.tools.delete.permission_key)) {
            columns.push(
                h(NButton,
                    {
                        size: 'tiny',
                        type: 'error',
                        secondary: true,
                        onClick: () => {
                            if(typeof callback?.deleteCallback === "function"){
                                callback.deleteCallback('delete', {row, index})
                            }else{
                                tools.notice.dialog.warning({
                                    title: '警告',
                                    content: '你确定要删除此数据吗？',
                                    positiveText: '确定',
                                    negativeText: '取消',
                                    onPositiveClick: () => {
                                        Request.request(pageJsonData.api_list.delete, {ids: row.id}).then(res => {
                                            tools.notice.message.success(res.msg)
                                            vPage.value.refresh()
                                        }).catch(err => {
                                            console.log(err)
                                        })
                                    },
                                    onNegativeClick: () => {

                                    }
                                })
                            }
                        }
                    },
                    {default: () => '删除'}
                )
            )
        }
        //更多操作
        if (pageJsonData.setting?.rowHandle) {
            //过滤权限操作
            let rowHandle = pageJsonData.setting?.rowHandle.filter(item => tools.data.get('Vat-Views').includes(item?.permission_key))
            if(rowHandle.length > 0){
                columns.push(
                    h(NDropdown,
                        {
                            trigger: 'hover',
                            placement: 'bottom-start',
                            options: rowHandle,
                            onSelect: (key, option) => {
                                if (typeof callback?.rowHandleCallback === "function") {
                                    callback.rowHandleCallback('rowHandle', {key, option, row, index})
                                }
                            }
                        },
                        {default: () => h(NButton, {size: 'tiny'}, () => h('i', {class: 'ifont i-more'}))}
                    )
                )
            }
        }
        return columns
    },
    //构建table展示列
    buildColumns2(fields){  
        let columns = []
        fields.forEach((v) => {
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
    buildColumns(pageJson){
        let fields = pageJson.fields
        let columns = {}
        fields.forEach((v) => {
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
    buildForm(fields, filter_fields = []){
        let formList = []
        fields.forEach((v) => {
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
                    form_order: v.form_order,
                    show_in: v.show_in ?? '',
                    disabled_in: v.disabled_in ?? '',
                    visible_when: v.visible_when ?? {},
                })
            }
        })
        return this.sortColumns(formList, 'form_order')
    },
    /**
     * 生成必填验证规则
     * @param fields
     */
    buildRule(fields){
        let rules = {}
        fields.forEach((v) => {
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
                if(res.type == 'number'){
                    res.transform = (value) => {
                        if (typeof value === 'string') {
                            // 去除空格并转为数字，如果是无效数字则转为 NaN
                            return Number(value.trim())
                        }
                        return value
                    }
                    res.min = 1
                }
                rules[v.field] = res
            }
        })
        return rules
    },
    /**
     * 递归解析 visible_when 条件
     * 支持 value / neq / and / or 嵌套
     */
    parseVisibleCondition(cond, formData) {
        if (!cond || Object.keys(cond).length === 0) return true

        if (cond.or && Array.isArray(cond.or)) {
            return cond.or.some(item => this.parseVisibleCondition(item, formData))
        }
        if (cond.and && Array.isArray(cond.and)) {
            return cond.and.every(item => this.parseVisibleCondition(item, formData))
        }

        const { field, value, neq } = cond
        const fieldVal = formData[field]
        if (neq !== undefined) {
            return fieldVal !== neq
        }
        return fieldVal === value
    },

    /**
     * 统一判断字段是否展示
     * @param {object} item 字段配置
     * @param {string} mode add / edit / detail
     * @param {object} formData 表单数据
     * @returns {boolean}
     */
    isFieldVisible(item, mode, formData) {
        // show_in：空/all 全部显示，支持逗号分隔多模式
        const showInRaw = (item.show_in ?? '').trim()
        if (showInRaw && showInRaw !== 'all') {
            const showArr = showInRaw.split(',').map(s => s.trim())
            if (!showArr.includes(mode)) {
                return false
            }
        }
        // 联动条件
        if (!this.parseVisibleCondition(item.visible_when, formData)) {
            return false
        }
        return true
    },
    /**
     * 清空当前所有隐藏字段的值，避免脏数据提交
     * @param {Array} originFields buildForm原始字段数组
     * @param {string} mode 当前模式
     * @param {object} formData 表单data
     */
    cleanHiddenFieldValue(originFields, mode, formData) {
        originFields.forEach(item => {
            if (!this.isFieldVisible(item, mode, formData)) {
                formData[item.field] = undefined
            }
        })
    },
    
    /**
     * 生成带显隐/禁用标记的表单列表 + 动态裁剪校验规则
     * @param {Array} originFields buildForm结果
     * @param {Object} originRules buildRule结果
     * @param {Ref} modeRef toRef(state, 'type')
     * @param {Ref} dataRef toRef(state, 'data')
     * @returns {{formList:ComputedRef, rules:ComputedRef}}
     */
    buildDynamicForm(originFields, originRules, modeRef, dataRef) {
        // ✅ 关键：外层一次性缓存 pages 引用，computed 内不要再使用 this / tools.pages 链式调用
        const page = this

        const formList = computed(() => {
            const mode = modeRef.value
            const formData = dataRef.value

            return originFields.map(item => {
                const _visible = page.isFieldVisible(item, mode, formData)
                let _disabled = false

                const disabledInRaw = (item.disabled_in ?? '').trim()
                if (disabledInRaw) {
                    const disabledArr = disabledInRaw.split(',').map(s => s.trim())
                    if (disabledArr.includes(mode)) {
                        _disabled = true
                    }
                }

                return {
                    ...item,
                    _visible,
                    _disabled
                }
            })
        })

        const rules = computed(() => {
            const mode = modeRef.value
            const formData = dataRef.value
            const realRules = {}

            originFields.forEach(item => {
                const visible = page.isFieldVisible(item, mode, formData)
                if (visible && originRules[item.field]) {
                    realRules[item.field] = originRules[item.field]
                }
            })
            return realRules
        })

        return {
            formList,
            rules
        }
    },
    //排序
    sortColumns(fields, sortField = 'table_order'){
        fields.sort((a, b) => a[sortField] - b[sortField]);
        return fields
    },
    //构建搜索
    buildSearch(fields, filter_fields = {}){
        let query = router.currentRoute.value.query
        if(query.filter){
            filter_fields = JSON.parse(query.filter)
        }
        let search = []
        fields.forEach((v) => {
            if(v.search){
                if(v.config.dict){
                    v.config.options = useUserStore().user.userInfo.dict[v.config.dict].options
                }
                let placeholderText = ''
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
    renderButton(label, attr = {}, callback){
        return h(NButton, {...attr, size: 'tiny', onClick: () => {callback()}}, {default: () => label})
    },
    renderTextColor(list, value, label){
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
    renderTextCustom(value, field){
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
    renderMapping(value, field){
        let mode = ''
        if(field.config && field.config?.mapping){
            for(let key in field.config?.mapping){
                if(value == key){
                    mode = field.config?.mapping[key]
                    break;
                }
            }
        }
        let renderValue = value
        console.log('useStore().extra', useStore().extra)
        if(field.config?.dict){
            renderValue = useUserStore().user.userInfo.dict[field.config.dict].options.find((item) => item.value == value)?.label || value
        }else if(useStore().extra[field.field]){
            // 从 store extra 中查找选项标签 (格式: {key: value})
            renderValue = useStore().extra[field.field][value] || value
        }

        let textType = field.config?.mapping_type || 'text'
        if(textType == 'text'){
            let textStyle = {}
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
    renderSwitch(row, apiUrl, field = 'status' , switchValue = {checked:{value:0,label:'正常'}, unchecked:{value:1,label:'禁用'}}){
        return h(NSwitch, {
            'size':'small',
            'checked-value': switchValue.checked.value,
            'unchecked-value': switchValue.unchecked.value,
            'value': row[field],
            'on-update:value': (checked) => {
                if(apiUrl){
                    row[field] = checked
                    Request.request( apiUrl, {ids: row.id, [field]: checked}).then((res) => {
                        tools.notice.message.success(res.msg)
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            }
        },  {checked:() => h('span', {'style':'font-size: 10px'}, switchValue.checked.label), unchecked:() => h('span', {'style':'font-size: 10px'}, switchValue.unchecked.label)} )
    },
    renderTags(list, tagType='info'){
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
    renderIcon(icon){
        return icon ? h('i', {class:'ifont i-' + icon}) : ''
    },
    renderTooltip(content, label){
        return h(NTooltip, {}, {trigger: () => { return h('div', {class: 'multiline-ellipsis pointer',innerHTML: content}) }, default: () => {
            return [
                h('div', {style: "max-width:600px; maxHeight: 70vh;",innerHTML: label}, {})
            ]
        }})
    },
    renderPopover(content, label){
        return h(NPopover, {}, {trigger: () => { return h('div', {class: 'multiline-ellipsis pointer',innerHTML: content}) }, default: () => {
            return [
                h('div', {style: "max-width:600px; maxHeight: 70vh;",innerHTML: label}, {})
            ]
        }})
    },
    renderLink(link, fieldConfig){
        console.log(fieldConfig)
         return h(VatLink, {href: link, ...fieldConfig.config.props})
    },
    renderJson(json, fieldConfig){
        return json ? h(VatJson, {data: typeof json === 'string' && json ? JSON.parse(json) : json, ...fieldConfig.config.props}) : ''
    },
    renderAvatar(avatar){
        return avatar ? h(NAvatar, {size: 'small', src: this.cdnUrl(avatar)}) : ''
    },
    renderImage(image){
        return image ? h(NImage, {width: '80px', height:'80px', src: this.cdnUrl(image)}) : ''
    },
    renderImages(images){
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
    renderCarousel(images){
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
    renderStatusText(row, status, statusMap){       
        return [
            h('div', {style:'display: flex; align-items: center;gap: 2px;'}, [
                h(NButton, {
                    type: statusMap[status].theme,
                    size:'small',
                    round: true,
                    bordered: false,
                    style: {
                        width: '10px',
                        height: '10px',
                        padding: '0'
                    }
                }),
                h(NGradientText, {type: statusMap[status].theme, size: 13}, statusMap[status].label)
            ])
        ]
    },
    renderFiles(file_url, file_name){
        return  h('div', {}, [h('i', {class:"ifont i-file", style:"margin-right:5px;"}), h('a', {href: this.cdnUrl(file_url)}, {default: () =>  file_name})])
    },
    renderButtonModal(innerHtml){
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
    /**
     * 渲染 InputGroup 组件（使用 Naive UI NInputGroup）
     * @param {string|number} value - 中间显示的值
     * @param {object} config - 配置对象
     * @param {string} config.prefix - 前缀标签文字
     * @param {string} config.suffix - 后缀标签文字
     * @param {string} config.theme - 主题色: red/green/blue/orange/gray
     * @param {string} config.width - 中间值固定宽度，如 '100px'
     * @param {string} config.color - 自定义颜色，优先级高于 theme
     * @param {string} config.class - 中间值的自定义 class
     */
    renderInputGroup(value, config){
        const props = config || {}
        const themeColors = {red:'#e02020',green:'#18a058',blue:'#2080f0',orange:'#f0a020',gray:'#999'}
        const c = props.color || themeColors[props.theme] || themeColors.red
        const prefix = props.prefix || ''
        const suffix = props.suffix || ''
        const cls = props.class || ''
        const inputStyle = props.width ? 'width:' + props.width + ';' : ''
        const children = []
        if(prefix) children.push(h(NInputGroupLabel, {}, {default: () => prefix}))
        children.push(h(NInput, {value: String(value), readonly: true, class: cls, style: inputStyle + 'cursor:default;color:' + c + ';'}))
        if(suffix) children.push(h(NInputGroupLabel, {}, {default: () => suffix}))
        return h(NInputGroup, {}, {default: () => children})
    },
    renderMoney(value, config){
        const props = config?.props || {}
        const themes = {
            red:    {class: 'text-red font-w', color: '#e02020'},
            green:  {class: 'text-green font-w', color: '#18a058'},
            blue:   {class: 'text-blue font-w', color: '#2080f0'},
            orange: {class: 'text-orange font-w', color: '#f0a020'},
            gray:   {class: 'text-gray font-w', color: '#999'},
        }
        const theme = themes[props?.theme] || themes.red
        const cls = props?.styleClass || theme.class
        const prefix = props?.prefix || ''
        const suffix = props?.suffix || ''

        // group 模式：前缀标签 + 数值 + 后缀标签（仿 NInputGroup 样式）
        if(props?.mode === 'group'){
            const c = theme.color
            const base = 'display:inline-block;font-size:12px;line-height:22px;padding:0 2px;border:1px solid ' + c + ';vertical-align:middle;'
            const valueBorder = (prefix ? 'border-left:none;' : '') + (suffix ? 'border-right:none;' : '')
            const valueRadius = (prefix ? '' : 'border-radius:3px 0 0 3px;') + (suffix ? '' : 'border-radius:0 3px 3px 0;') + (!prefix && !suffix ? 'border-radius:3px;' : '')
            const valueWidth = props?.width ? 'width:' + props.width + ';text-align:right;' : ''
            const children = []
            if(prefix) children.push(h('span', {style: base + 'border-radius:3px 0 0 3px;background:' + c + '15;color:' + c + ';'}, prefix))
            children.push(h('span', {class: cls, style: base + valueBorder + valueRadius + valueWidth + 'background:#fff;'}, value))
            if(suffix) children.push(h('span', {style: base + 'border-radius:0 3px 3px 0;background:' + c + '15;color:' + c + ';'}, suffix))
            return h('span', {style: 'display:inline-flex;white-space:nowrap;'}, children)
        }

        // 默认模式
        const showIcon = props?.showIcon
        const icon = props?.icon || 'i-money3'
        const children = []
        if(showIcon) children.push(h('i', {class:'ifont ' + icon, style: 'margin-right: 2px;font-size: 12px'}))
        if(prefix) children.push(h('span', {}, prefix))
        children.push(h('span', {}, value))
        return h('div', {class: cls}, children)
    },
    cdnUrl(url){
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
                if(pageJson.tools?.switch_lock?.show){
                     return this.renderSwitch(row, pageJson.tools?.switch_lock?.show ? pageJson.api_list.lock : '',  res.field, res.config.switchValue ? res.config.switchValue : {checked:{value: 0, label: '正常'}, unchecked: {value: 1, label: '禁用'}})
                }else{
                    return this.renderStatusText(row, row[res.field], res.config.switchValue ? res.config.switchValue : {0:{theme: 'success', label: '正常'}, 1: {theme: 'error', label: '禁用'}})
                }
            case 'status_text':
                return this.renderStatusText(row,row[res.field], res.config.switchValue ? res.config.switchValue : {0:{theme: 'success', label: '正常'}, 1: {theme: 'error', label: '禁用'}})
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
            case 'money':
                return this.renderMoney(row[res.field], res.config)
        }
    }
}

tools.common = {
    split(str, delimiter) {        
        return str.split(delimiter).map(item => item.trim()).filter(item => item !== '');
    },
    isNumeric(value) {
        return /^-?\d+(\.\d+)?(?:[eE][-+]?\d+)?$/.test(value);
    },
    toNumber(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : null
    },
    // 格式化时间
    formatTime(time) { 
        if (!time && time !== 0) return '-'
        
        let date
        if (typeof time === 'number' || (typeof time === 'string' && /^\d+$/.test(time))) {
            const ts = Number(time)
            date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000)
        } else {
            date = new Date(time)
        }
        
        if (isNaN(date.getTime())) return String(time)
        
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    },
    // 复制内容到剪贴板
    copy(content) {
        if (!content) return
        navigator.clipboard.writeText(content).then(() => {
            tools.notice.message.success('已复制到剪贴板')
        }).catch((err) => {
            console.error('复制失败:', err)
            tools.notice.message.error('复制失败')
        })
    }
}
export default tools