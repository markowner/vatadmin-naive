import { useUserStore } from '@/store/user'
import tools from "@/utils/tools"
// 建立连接
if(import.meta.env.VITE_APP_WS_URL && window?.Push != undefined){
    let connection = new Push({
        url: import.meta.env.VITE_APP_WS_URL,
        app_key: import.meta.env.VITE_APP_WS_APPKEY,
        auth: import.meta.env.VITE_APP_WS_AUTH
    });
    let uid = tools.cookie.get('Vat-Uid')
    if (uid) {
        // 浏览器监听DATA-U-uid频道的消息
        let user_channel = connection.subscribe('Vat-User-' + uid);
        // 当user-1频道有message事件的消息时
        user_channel.on('message', function(data: Object) {
            // data里是消息内容
            const userStore = useUserStore()
            userStore.setNoticeCount('');
            tools.notice.notification.warning({
                title: '消息通知',
                content: () => {
                    return h('div', {
                        'innerHTML': data.content
                    })
                },
                duration: 0,
                keepAliveOnHover: true
            })
        });

        let group_channel = connection.subscribe('Vat-Group');
        // 当user-1频道有message事件的消息时
        group_channel.on('message', function(data: Object) {
            // data里是消息内容
            const userStore = useUserStore()
            userStore.setNoticeCount('');
            tools.notice.notification.warning({
                title: '消息通知',
                content: () => {
                    return h('div', {
                        'innerHTML': data.content
                    })
                },
                duration: 0,
                keepAliveOnHover: true
            })
        });

        let affiche_channel = connection.subscribe('Vat-Affiche');
        // 当user-1频道有message事件的消息时
        affiche_channel.on('message', function(data: Object) {
            // data里是消息内容
            const userStore = useUserStore()
            userStore.setNoticeCount('');
            tools.notice.notification.warning({
                title: '公告通知',
                content: () => {
                    return h('div', {
                        'innerHTML': data.content
                    })
                },
                duration: 0,
                keepAliveOnHover: true
            })
        });
    }
}

