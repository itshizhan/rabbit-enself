<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="no-drag collapse-btn" @click="collapseChage">
            <i class="el-icon-menu"></i>
        </div>
        <div class="logo">后台管理系统</div>
        <div class="no-drag header-right">
            <div class="header-user-con">
                
                <!-- 消息中心 -->
                <div class="btn-bell">
                    <el-tooltip effect="dark" :content="message?`有${message}条未读消息`:`消息中心`" placement="bottom">
                        <router-link to="/tabs">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div>
                <!-- 用户头像 -->                
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}} <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <a href="http://blog.gdfengshuo.com/about/" target="_blank">
                            <el-dropdown-item>关于作者</el-dropdown-item>
                        </a>
                        <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                            <el-dropdown-item>项目仓库</el-dropdown-item>
                        </a>
                        <el-dropdown-item divided  command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <!-- 全屏显示 -->
                <div  @click="minimize" class="no-drag btn-minscreen">
                    <el-tooltip effect="dark" content="最小化" placement="bottom">
                    <i class="btn el-icon-minus"></i>
                    </el-tooltip>
                </div>
                <div @click="windowmax" class="no-drag btn-screen" >
                    <i class="el-icon-rank"></i>
                </div>
            <div @click="clickClose" class="no-drag btn-screen hover-color">
                <i class="el-icon-close"></i>
            </div>
            </div>
        </div>
        <el-dialog :visible.sync="dialogClosingVisible" title="提示"  width="400px" :close-on-click-modal="false" @closed="cancelClose">
               <span style="margin:10px;">程序将在{{lastCloseSec}}后自动关闭</span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="cancelClose">取 消</el-button>
                    <el-button type="primary" @click="closeDirect" ref="btnToCloseDirect">马上关闭</el-button>
                </span>
        </el-dialog>
    </div>
</template>
<script>
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                fullscreen: false,
                name: 'linxin',
                message: 2,
                dialogClosingVisible:false,
                lastCloseSec:20,
                closeTimer:null
            }
        },
        computed:{
            username(){
                let username = localStorage.getItem('ms_username');
                return username ? username : this.name;
            }
        },
        methods:{
            // 用户名下拉菜单选择事件
            handleCommand(command) {
                if(command == 'loginout'){
                    localStorage.removeItem('ms_username')
                    this.$router.push('/login');
                }
            },
            // 侧边栏折叠
            collapseChage(){
                this.collapse = !this.collapse;
                bus.$emit('collapse', this.collapse);
            },
            autoClose(){                
                this.lastCloseSec --;
                if(this.lastCloseSec<=0){
                    this.closeDirect();
                }
            },
            clickClose(){
                this.lastCloseSec = 20;
                this.dialogClosingVisible = true;
                this.$nextTick(function () {                
                    //将焦点放在控件上，按回车就马上关闭。    
                    this.$refs.btnToCloseDirect.$el.focus();
                });
                this.closeTimer = setInterval(() => {this.autoClose();}, 1000);                
            },
            cancelClose(){
                clearInterval(this.closeTimer);
                this.dialogClosingVisible = false;
            },
            closeDirect() {           
                clearInterval(this.closeTimer);
                this.$electron.ipcRenderer.send('close');               
            },
            windowmax(){
                this.$electron.ipcRenderer.send('maximize')
            },
            minimize() {
                this.$electron.ipcRenderer.send('minimize')
            },
            back() {
                if (this.$route.name !== 'music') {
                    this.$router.go(-1)
                }
            },
            advance() {
                this.$router.go(1)
            },
            refresh() {
                this.$bus.$emit('page-refresh', this.$route.name)
            },
            // 全屏事件
            handleFullScreen(){
                let element = document.documentElement;
                if (this.fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {
                        // IE11
                        element.msRequestFullscreen();
                    }
                }
                this.fullscreen = !this.fullscreen;
            }
        },
        mounted(){
            if(document.body.clientWidth < 1500){
                this.collapseChage();
            }
        }
    }
</script>
<style scoped>
    .header {        
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 50px;
        font-size: 22px;
        color: #fff;
    }
    .no-drag{-webkit-app-region: no-drag; }
    .collapse-btn{
        float: left;
        padding: 0 21px;
        cursor: pointer;
        line-height: 70px;
    }
    .header .logo{
        float: left;
        width:250px;
        line-height: 70px;
    }
    .header-right{
        float: right;
        padding-right: 50px;
    }
    .header-user-con{
        display: flex;
        height: 70px;
        align-items: center;
    }
    .btn-fullscreen{
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-screen{        
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-minscreen{    
        margin-top: 10px;    
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-bell, .btn-fullscreen{
        position: relative;
        width: 30px;
        height: 30px;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
    }
    .btn-bell-badge{
        position: absolute;
        right: 0;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background: #f56c6c;
        color: #fff;
    }
    .btn-bell .el-icon-bell{
        color: #fff;
    }
    .user-name{
        margin-left: 10px;
    }
    .user-avator{
        margin-left: 20px;
    }
    .user-avator img{
        display: block;
        width:40px;
        height:40px;
        border-radius: 50%;
    }
    .el-dropdown-link{
        color: #fff;
        cursor: pointer;
    }
    .el-dropdown-menu__item{
        text-align: center;
    }
</style>
