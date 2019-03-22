<template>
    <div>
        <el-container>
        <el-header height="30" style="padding: 0px;">
        {{enName}}
        <div style="float:right">
            <el-button @click="newEntity">新增</el-button>
            <el-button @click="research">单词检索</el-button>
        </div>
      </el-header>
        <el-main style="padding: 0px;">
            <el-table :data="tableData">
                <el-table-column v-for="col in columns" :key="col.field" :prop="col.field" :label="col.title" :width="col.width" >
  
                </el-table-column>
                <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button @click="editRow(scope.row)" type="text" size="small">编辑</el-button>
        <el-button type="text" size="small">删除</el-button>
      </template>
    </el-table-column>
            </el-table>
            </el-main>
        </el-container>  
        <el-dialog v-dialogDrag title="编辑" :visible.sync="dialogFormVisible">
            <el-form :model="dialogEditObj" label-width="80px">                
                <el-form-item v-for="col in columns" :key="col.field" :label="col.title">
                    <!--选择方式-->
                <el-select v-model="dialogEditObj[col.field]" :placeholder="'请选择'+col.title" v-if="col.input=='select'">
                    <el-option v-for="opt in col.options" :label="opt" :value="opt"></el-option>                   
                </el-select>
                <!--是否-->
                <el-switch v-model="dialogEditObj[col.field]" v-if="col.input=='switch'"></el-switch>
                <!--最简单的文本框-->
                <el-input v-model="dialogEditObj[col.field]" autocomplete="off" size="small" v-else></el-input>
                </el-form-item>         
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEntity">确 定</el-button>
            </div>
        </el-dialog>        
    </div>
</template>
<script>
    import eEditFormItem from '../common/EditFormItem';
    import EnWordsDb from "../../enwords";
    export default { 
        components:{
            eEditFormItem,
        },
        data(){
            return {
                enName:'',
                dialogFormVisible:false,
                dialogEditObj:{name:'test',code:'001',isvaild:true},
                activeIndex:'',
                tableData:[],
                columns:[
                    {field:'code',title:'编码',width:200,input:''},
                    {field:"name",title:'名称',width:250,input:''},
                    {field:"isvaild",title:'有效',input:'switch'},                                        
                ]
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
            this.tableData.push(this.dialogEditObj);
        } ,
        methods:{
            newEntity:function(){
                this.dialogEditObj = {isNew:true};
                this.dialogFormVisible=true;
            },
            saveEntity:function(){
                if(this.dialogEditObj.isNew)
                    this.tableData.push(this.dialogEditObj);
                this.dialogFormVisible=false;
            },
            editRow:function(row){
                this.dialogEditObj = row;
                this.dialogEditObj.isNew = false;
                this.dialogFormVisible=true;
            },
            research:function(){
                let db = new EnWordsDb();
                db.selectAll("englishwords",(err,data)=>{
                    console.log(data);                    
                });
            }
        },
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
   height: 30px;   
  } 

</style>

