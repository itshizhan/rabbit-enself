<template>
    <div class="wrapper">
        <el-container >
            <el-header height="50px" style="padding:0px; -webkit-app-region: drag">
                <v-head></v-head>
            </el-header>
            <el-main style="padding:0px;">
                <v-sidebar></v-sidebar>
                <div class="content-box" :class="{'content-collapse':collapse}">
                    <el-tabs v-model="TabsValue" type="card" closable @tab-remove="removeTab"> 
                        <el-tab-pane v-for="(item, index) in tagsList" :key="item.name" :label="item.title" :name="item.name"> 
                            <component :is="item.content"></component>
                        </el-tab-pane> 
                    </el-tabs>                    
                </div>
            </el-main>
        </el-container>
        
    </div>
</template>

<script>
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    import vTags from './Tags.vue';
    import bus from './bus';
    
    export default {
        data(){
            return {
                tagsList: [],
                collapse: false,               
                TabsValue: '',                 
            }
        },
        components:{
            vHead, vSidebar, vTags
        },
        created(){
            bus.$on('collapse', msg => {
                this.collapse = msg;
            })

            // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
            bus.$on('tags', msg => {
                let arr = [];
                for(let i = 0, len = msg.length; i < len; i ++){
                    msg[i].name && arr.push(msg[i].name);
                }
                this.tagsList = arr;
            });
            this.$bus.$on("openform",(menu)=>{
                console.log("maintain.." + enName);
                this.addTab(menu);              
            });
            //将首页添加进去
            let home = {                
                name:'首页',
                component:resolve => require(['../page/Dashboard.vue'], resolve),
            };
            this.addTab(home);
            console.log(this.tagsList);
        },
        methods:{
            addTab(menu) {
                 var exist = false ;
                 for (var i = 0; i < this.tagsList.length; i++) { 
                     if (menu.name == this.tagsList[i].name) { 
                         exist = true ;
                         break;
                     }
                 } 
                 if (exist == true) { 
                     this.TabsValue = menu.name;
                     return;
                } 
                this.tagsList.push({ title: menu.name, name: menu.name, content: menu.component }) ;                
                this.TabsValue = menu.name ;
            },
            removeTab(tab){
                console.log('删除...');
            }
        }
    }
</script>
