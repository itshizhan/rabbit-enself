<template>
    <div>
        <el-container>
        <el-header height="30" style="padding: 0px;">
      
       <div style="width:300px;float:left;"> 
            <el-input v-model="enWord" size="mini" placeholder="请录入一个单词"  ></el-input>
            <el-input v-model="topWordLen" size="mini" placeholder="请录入核心词拆分长度"  ></el-input>
            <el-button @click="saveJson">保存文件</el-button>
        </div>
        <div style="float:left;margin-left:20px;" >                       
        </div>
      </el-header>
        <el-main style="padding: 0px;">
            <!-- 上表格 -->

<el-table ref="topTable" :data="wordData01" height="300" @row-dblclick="topDblClick">
     <el-table-column  prop="index" label="序号" width="80" >  
                </el-table-column>
    <el-table-column  prop="word" label="单词" width="200" >  
                </el-table-column>
                <el-table-column  prop="meaning" label="意思" width="600" >  
                </el-table-column>
                
</el-table>

<!-- 拉动线 -->

<div class="lineDiv" style="background-color:#DCDCDC;height:5px" ref="lineDiv"></div>

<!-- 下表格 -->

<el-table ref="dTable" :data="wordData02"  height="350">
    <el-table-column  prop="word" label="单词" width="200" >  
    </el-table-column>
    <el-table-column  prop="meaning" label="意思" width="600" >  
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">                        
            <el-button @click="removeFromWords(scope.$index)" type="text" size="small">删除</el-button>
        </template>
    </el-table-column>
</el-table>
        </el-main>
    </el-container>  
          
    </div>
</template>
<script>   
    var fs = require('fs'); // 引入fs模块
    import EnWordStudy from "../../enwordstudy";
    export default {         
        data(){
            return {      
                enWord:'',         
                topWordLen:'2',
                dialogFormVisible:false,
                dialogEditObj:{},               
                wordData01:[],
                wordData02:[],
                wordEx:{roots:[],words:[]},//用于导出的字典对象
                curRoot:{},
                columns:[
                    {field:'word',title:'单词',width:100},
                    {field:"pronunciation",title:'发音',width:150},
                    {field:"meaning",title:'意思',width:500,input:'textarea'},                                        
                ],
                db:null
            }
        },
        created(){
            this.db = new EnWordStudy();
            this.db.init((data)=>{
                this.wordData01 = data;
            });                         
        } ,
        beforeDestroy(){
            this.db.closeDb();
        },
        methods:{
            topDblClick(row, column, event){
                //console.log(row);
                this.curRoot = row;
                let len = parseInt(this.topWordLen);
                this.wordData02 = this.db.getTopWords(this.curRoot.word,len);
            },
            removeFromWords(rowindex){
                this.wordData02.splice(rowindex,1);
            },            
            saveJson() {
                this.wordEx.roots[this.curRoot.word]=this.curRoot;                
                this.wordEx.words[this.curRoot.word] = this.wordData02;
                let db = {roots:[],words:[]};//数组对象,json不支持字典，转为数据转录
                for(let key in this.wordEx.roots) {
                    let root ={rootkey:key,word:this.wordEx.roots[key]}
                    let item = {rootkey:key,topWoods:this.wordEx.words[key]};
                    db.roots.push(root);
                    db.words.push(item);
                }

                //console.log(db);
                let str = JSON.stringify(db);
                let _this = this;
                //console.log(str);
                // 'flag': 'a'添加 ，w写入
                fs.writeFile('./words.json', str, { 'flag': 'w' }, function(err) {
                    if (err) {
                        throw err;
                    }else{
                        _this.$alert('写入words.json成功');
                    }
                });
            }
        },
        mounted() {
            //////////////////////////////////////////////////////////上下拖动
            var tableDiv = this.$refs.topTable.$el
            var dtable = this.$refs.dTable.$el
            var oDiv = this.$refs.lineDiv
            oDiv.onmousedown = function(ev){
                var theight = parseInt(tableDiv.offsetHeight)//parseInt为了不指向对象
                var dheight = parseInt(dtable.offsetHeight)
                oDiv.style.cursor = 's-resize'
                var ev = ev || event;
                //鼠标按下坐标
                var mouseDownX = ev.clientX;
                var mouseDownY = ev.clientY;
                // IE8 取消默认行为-设置全局捕获
                if(oDiv.setCapture){
                    oDiv.setCapture();
                }
                document.onmousemove = function(ev){
                    var ev = ev || event;
                    // 鼠标移动时的鼠标位置
                    var mouseMoveX = ev.clientX;
                    var mouseMoveY = ev.clientY;
                    tableDiv.style.height = theight+(mouseMoveY-mouseDownY)+"px"
                    dtable.style.height = dheight +(mouseDownY-mouseMoveY)+"px"
                }
            }
            document.onmouseup = function(){
                document.onmousemove = null;
                // 释放全局捕获
                if(oDiv.releaseCapture){
                    oDiv.releaseCapture();
                }
            }
            return false;
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
  .lineDiv:hover{
        cursor:s-resize;
    }

</style>

