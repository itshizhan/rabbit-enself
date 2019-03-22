import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/test',
            name: 'main',
            redirect: { name: 'music' },
            component: require('@/views/main').default,
            children: [
                {
                    path: 'music',
                    name: 'music',
                    component: () => import('../views/music/index.vue')
                }, {
                    path: 'playlist-detail',
                    name: 'playlist-detail',
                    component: () => import('../views/playlist/detail')
                }
            ]
        },
        {
            path: '/test',
            component: resolve => require(['../components/common/MainForm.vue'], resolve),
            meta: { title: '主窗体' }
        },
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/icon',
                    component: resolve => require(['../components/page/Icon.vue'], resolve),
                    meta: { title: '自定义图标' }
                },
                {
                    path: '/table',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve),
                    meta: { title: '基础表格' }
                },
                {
                    path: '/maintain/:entity',
                    component: resolve => require(['../components/page/Maintain.vue'], resolve),
                    meta: { title: '编辑...' }
                },
                {
                    path:'/enwords',
                    component: resolve => require(['../components/page/EnWords.vue'], resolve),
                    meta: { title: '词根分析' }
                },
                {
                    path:'/enwordsplit',
                    component: resolve => require(['../components/page/EnWordSplit.vue'], resolve),
                    meta: { title: '词根分析' }
                }
            ]
        },
        {
            path: '/maintaintest/:entity',
            name: 'maintain',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[                
                {
                    path: '/maintaintest/:entity',
                    component: resolve => require(['../components/page/Maintain.vue'], resolve),
                    meta: { title: '/maintain/:entity' }
                }
            ]
        },
        {
            path: '/maintain2',
            name: 'maintain2',    
            redirect: { name: 'mainform' },
            component: require('@/views/main').default,
            children: [
                {
                    path: 'mainform',
                    name: 'mainform',
                    component: () => import('../onhis/maintain')
                }
            ]                    
        },
        {
            path: '/login',
            component: resolve => require(['../onhis/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
