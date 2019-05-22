<template>
    <div>
        <el-container>
        <el-header height="30" style="padding: 0px;">
      
       <div style="width:150px;float:left;"> 
            <el-input v-model="enWord" size="small" placeholder="请录入一个单词" @keyup.enter.native="research" ></el-input>
            
        </div>
        <div style="float:left;margin-left:20px;" >            
            <el-button @click="research('englishwords')">单词检索</el-button>
            <el-button @click="research('wordbase')">字根检索</el-button>
            <el-button @click="killAtLast">去掉居词尾</el-button>{{searchResult}}
            <el-button @click="showAllWord('wordbase')">所有字根</el-button>
            <el-button @click="showAllWord('wordSplit')">所有拆分</el-button>
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
    import EnWordsDb from "../../enwords";
    export default {         
        name:"单词分析",
        data(){
            return {
                enWord:'',
                searchResult:'',
                dialogFormVisible:false,
                dialogEditObj:{},
                activeIndex:'',
                tableData:[],
                columns:[
                    {field:'word',title:'单词',width:100},
                    {field:"pronunciation",title:'发音',width:150},
                    {field:"meaning",title:'意思',width:500,input:'textarea'},                                        
                ],
                wordDb:null
            }
        },
        created(){
            this.wordDb = new EnWordsDb();
            let _this = this;
            this.enName = this.$route.params.entity;
            console.log("form created.." + this.enName);            
        } ,
        beforeDestroy(){
            this.wordDb.closeDb();
        },
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
            showResuntCnt(){
                if(this.tableData &&this.tableData.length>0)
                    this.searchResult=`共有${this.tableData.length}条单词`;
                else
                    this.searchResult='';
            },
            research:function(dbname){
                let _this = this;
                if(!this.enWord){
                    this.$alert('请录入一个词根');
                    return;
                }
                let word = this.enWord;
                if(word.indexOf('-')==-1)
                    word = '-' + word + '-';
                this.wordDb.searchWords(dbname,word,(err,data)=>{
                    this.tableData = data;     
                    this.showResuntCnt();               
                });
            },
            showAllWord:function(dbname){
                this.wordDb.selectAll(dbname,(err,data)=>{
                    if(err){
                        this.$alert(err);
                    }
                    this.tableData = data;     
                    this.showResuntCnt();               
                });
            },

            killAtLast:function(){
                let index = 0;
                let find = this.enWord.replace(/-/g,'');//将所有-清空
                while(index<this.tableData.length){
                    let word = this.tableData[index]['word'];                    
                    if(word.endsWith(find)){                        
                        this.tableData.splice(index,1);
                    }
                    else{
                        index ++;
                    }
                }
                this.showResuntCnt();
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

