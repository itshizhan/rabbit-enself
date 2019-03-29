import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [        
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
                    path:'/enwords',
                    component: resolve => require(['../components/page/EnWords.vue'], resolve),
                    meta: { title: '词根分析' }
                },
                {
                    path:'/enwordsplit',
                    component: resolve => require(['../components/page/EnWordSplit.vue'], resolve),
                    meta: { title: '单词拆分' }
                },
                {
                    path:'/enwordstudy',
                    component: resolve => require(['../components/page/EnWordStudy.vue'], resolve),
                    meta: { title: '词根整理' }
                },
                {
                    path:'/enwordtree',
                    component: resolve => require(['../components/page/EnWordTree.vue'], resolve),
                    meta: { title: '词根整理' }
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
