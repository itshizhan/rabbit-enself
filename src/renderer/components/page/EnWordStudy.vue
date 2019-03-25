<template>
    <div>
        <el-container>
        <el-header height="30" style="padding: 0px;">
      
       <div style="width:150px;float:left;"> 
            <el-input v-model="enWord" size="small" placeholder="请录入一个单词"  ></el-input>
            
        </div>
        <div style="float:left;margin-left:20px;" >                       
        </div>
      </el-header>
        <el-main style="padding: 0px;">
            <!-- 上表格 -->

<el-table ref="topTable" :data="wordData01">
    <el-table-column  prop="word" label="单词" width="200" >  
                </el-table-column>
                <el-table-column  prop="meaning" label="意思" width="600" >  
                </el-table-column>
                
</el-table>

<!-- 拉动线 -->

<div class="lineDiv" style="background-color:#DCDCDC;height:5px" ref="lineDiv"></div>

<!-- 下表格 -->

<el-table ref="dTable" :data="wordData02">
    <el-table-column  prop="word" label="单词" width="200" >  
                </el-table-column>
                <el-table-column  prop="meaning" label="意思" width="600" >  
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                    
                </el-table-column>
</el-table>
        </el-main>
    </el-container>  
          
    </div>
</template>
<script>   
    import EnWordStudy from "../../enwordstudy";
    export default {         
        data(){
            return {
                enWord:'',
                searchResult:'',
                dialogFormVisible:false,
                dialogEditObj:{},
                activeIndex:'',
                wordData01:[],
                wordData02:[],
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
                this.wordData02 = data;
            });                         
        } ,
        beforeDestroy(){
            this.db.closeDb();
        },
        methods:{
            
            
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

