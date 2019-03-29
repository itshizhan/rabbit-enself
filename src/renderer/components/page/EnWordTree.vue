<template>
    <div>
        <el-button @click="saveJson">保存选择到文件</el-button>
        <el-tree ref="tree" @node-click="checkClick"
  :data="dataTree"
  show-checkbox
  node-key="id"  
  :props="defaultProps">
</el-tree>
    </div>
</template>
<script>   
    var fs = require('fs'); // 引入fs模块
    import EnWordStudy from "../../enwordstudy";
    export default {         
        data(){
            return {      
                dataTree:[],
                db:null,
                defaultProps: {
                    children: 'children',
                    label: 'word'
                }
            }
        },
        created(){
            this.db = new EnWordStudy();
            let _this = this;
            this.db.init((data)=>{
                this.db.buildTree((tree)=>{
                    this.dataTree = tree;
                });                         
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
            checkClick(data){
                console.log(data);
            },         
            saveJson(){
                //let nodes = this.$refs.tree.getCheckedNodes();
                // let nodes = this.$refs.tree.getCheckedKeys();
                // console.log(nodes);
                this.saveSelectedToJson();
            },            
            saveSelectedToJson() {                
                let db = {roots:[],words:[]};//数组对象,json不支持字典，转为数据转录
                let nodes = this.$refs.tree.getCheckedNodes();
                nodes.forEach(nd => {
                    if(nd.rootKey){
                        let key = nd.rootKey;
                        let root ={rootkey:key,word:{word:key,meaning:nd.word}}
                        let item = {rootkey:key,topWoods:nd.children};
                        db.roots.push(root);
                        db.words.push(item);
                    }
                });               
                //console.log(db);
                let str = JSON.stringify(db);
                let _this = this;
                //console.log(str);
                // 'flag': 'a'添加 ，w写入
                fs.writeFile('./wordtree.json', str, { 'flag': 'w' }, function(err) {
                    if (err) {
                        throw err;
                    }else{
                        _this.$alert('写入words.json成功');
                    }
                });
            }
        },
        mounted() {            
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

