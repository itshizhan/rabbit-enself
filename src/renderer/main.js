import Vue from 'vue'
import axios from './utils/http'
import ElementUI from 'element-ui';
//import './assets/styles/theme.scss';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import '../static/css/theme-green/index.css';       // 浅绿色主题
//import './assets/css/icon.css';
import './components/common/directives';
//Vue.use(ElementUI);
import App from './App'
import router from './router'
import store from './store'
import filters from './filters'
import './directives'

Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
});

//if (!process.env.IS_WEB)
Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI, {
    size: 'small'
});
// 定义全局点击函数
Vue.prototype.globalClick = function (callback) {
    document.getElementById('main').onclick = function () {
        callback();
    };
};
// 定义全局点击函数
Vue.prototype.playlistClick = function (callback) {
    document.getElementById('playlist').onclick = function () {
        callback();
    };
};

Vue.prototype.$bus = new Vue();

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('ms_username');
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permission) {
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        role === 'admin' ? next() : next('/403');
    } else {
        // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
        if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
            Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
                confirmButtonText: '确定'
            });
        } else {
            next();
        }
    }
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
