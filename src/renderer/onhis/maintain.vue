<template>
    <div>
        <el-header style="padding: 0px;">
        {{enName}}
      </el-header>
        <el-main style="padding: 0px;">
            <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="#545c64"
  text-color="#fff"
  active-text-color="#ffd04b"
  style="max-height:30px;">  
                <el-submenu index="1" >
                    <template slot="title">编辑</template>
                    <el-menu-item index="2-1">新增</el-menu-item>
                    <el-menu-item index="2-2">修改</el-menu-item>
                    <el-menu-item index="2-3">查看</el-menu-item>    
                </el-submenu>               
                <el-menu-item index="3">打印</el-menu-item>
            </el-menu>
            

            <el-table :data="tableData">
                <el-table-column prop="date" label="日期" width="140">
                </el-table-column>
                <el-table-column prop="name" label="姓名" width="120">
                </el-table-column>
                <el-table-column prop="address" label="地址">
                </el-table-column>
            </el-table>
            </el-main>
        </el-container>          
    </div>
</template>
<script>
    
    export default {       
        data(){
            return {
                enName:'',
                activeIndex:0
            }
        },
        created(){
            let _this = this;
            this.enName = this.$route.params.entity;
            console.log("form created.." + this.enName);
            this.$bus.$on("maintain",(enName)=>{
                console.log("maintain.." + enName);
                _this.enName = enName;                
            });
        } ,
        computed:{            
            queryName:function(){
                return this.$route.query.entity;
            }
        }     
    }
</script>
<style>

  /* 水平菜单顶层菜单样式 */
  /* >符号表示直接孩子，.el-menu--horizontal>.el-submenu .el-submenu_title表示的
  是类.el-menu--horizontal元素（这个是顶层菜单el-menu）下的第一层元素（sub-menu）下的标题，
  这个标题是放在<i>元素的slot属性中的，从而找到了<i>元素，修改它的样式就可以了 */
  .el-menu--horizontal>.el-submenu .el-submenu__title {
    height: 30px;
    line-height: 30px;
    border-bottom: 2px solid transparent;
  }
  /* 水平菜单子菜单的标题（注意，标题和菜单项不一样，标题是使用<i slot="title">表示的，需要单独处理），
  这里使用.el-submenu>.el-submenu_title定位到子菜单（不是菜单项） */
  .el-menu--horizontal .el-menu .el-submenu >.el-submenu__title {
    float: none;
    height: 23px;
    line-height: 23px;
  } 
   
  /* 水平菜单子菜单中的所有菜单项 */
  .el-menu--horizontal .el-menu .el-menu-item {
    float: none;
    height: 23px;
    line-height: 23px;
    width: auto;
  } 

.el-menu--horizontal>.el-menu-item {    
    line-height: 23px;
   height: 23px;
   border-bottom: 2px solid transparent;
  } 

</style>

