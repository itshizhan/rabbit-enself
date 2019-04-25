<template>
    <div>
        <el-button @click="saveJson">保存选择到文件</el-button>
        <el-tree ref="tree" 
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
import { constants } from 'http2';
    export default {         
        data(){
            return {      
                dataTree:[],
                db:null,
                defaultProps: {
                    children: 'children',
                    label: 'full'
                }
            }
        },
        created(){
            // let aa = [{word:"hbc",index:0},{word:"bcddef",index:1},{word:"iij",index:2},{word:"a",index:3},{word:"v",index:4}];
            // //let bb = aa.sort((a,b)=>a.word>b.word);
            // let bb = aa.sort(this.sortedTree);
            // console.log(bb);
            this.db = new EnWordStudy();
            let _this = this;
            this.db.init((data)=>{
                this.db.buildTree((tree)=>{
                    let sortedTree= tree.sort(this.sortedTree);
                    this.dataTree = sortedTree;
                    this.$nextTick(function(){
                        this.selectExportNode();
                    });
                });                         
            });
            
        } ,
        
        beforeDestroy(){
            this.db.closeDb();
        },
        methods:{
            selectExportNode(){
                //let exp = this.$store.state.words.exportTree;
                let exp = localStorage.getItem('LAST_SELECTED_EXPORT_TREE');
                let arrKeys = exp.split(',')
                //console.log(this.$refs.tree);
                arrKeys.forEach(nd => {                    
                    this.$refs.tree.setChecked(nd,true,false);
                });                
            },
            sortedTree(a,b){
                //console.log(`${a.word}>${b.word}=${a.word>b.word}`);
                if(a.word>b.word)
                    return 1;
                if(a.word<b.word)
                    return -1;
                else
                    return 0;
            },
            saveJson(){
                //let nodes = this.$refs.tree.getCheckedNodes();
                // let nodes = this.$refs.tree.getCheckedKeys();
                // console.log(nodes);
                this.saveSelectedToJson();
            },         
            buildChilds(ndList){
                let childs = [];
                ndList.forEach(el => {
                    let parts = [];
                    el.splitWords.forEach(sp => {
                        parts.push({sw:sp.word,sm:sp.meaning});
                    });
                    //获取词频
                    let freq = this.db.getWordFreqVal(el.word,30000);
                    let obj = {w:el.word,p:el.pronunciation,e:el.meaning,ps:parts,o:el.memo,f:freq};
                    if(el.children){
                        obj.exs = this.buildChilds(el.children);
                    }
                    childs.push(obj);
                });
                return childs;
            },
            saveSelectedToJson() {       
                let _this = this;         
                let db = {roots:[],words:[]};//数组对象,json不支持字典，转为数据转录
                let nodes = this.$refs.tree.getCheckedNodes();
                let arrKeys = [];
                nodes.forEach(nd => {
                    if(nd.rootKey){
                        let key = nd.rootKey;
                        let root ={root:key,word:{word:nd.word,mean:nd.meaning}}
                        let childs = _this.buildChilds(nd.children);
                        let item = {root:key,words:childs};
                        db.roots.push(root);
                        db.words.push(item);
                        arrKeys.push(key);
                    }
                });    
                console.log(db.roots);
                //this.$store.dispatch('SET_EXPORT_TREE', db.roots)           
                localStorage.setItem('LAST_SELECTED_EXPORT_TREE',arrKeys.join(','));
                let str = JSON.stringify(db);
                
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

