<template>
    <div>
        <el-container>
        <el-header height="50" style="padding: 5px;">
       <div style="width:550px;float:left;"> 
            <div style="width:500px;float:left;"> 
                <h1 style="font-size:40px" @mouseup="getSelect2">{{enWord}}</h1> 
                <h3>{{wordMaster.pronunciation}} </h3>
                <h2>{{wordMaster.meaning}} </h2>
            </div>        
            <div style="float:left;">
                <h2>{{rootIndex}}</h2>
            </div>
       </div>
        <div style="width:400px;float:right;"> 
            <div style="width:250px margin-left:50px"> 
            <el-input v-model="inputStr" size="medium" @keydown.native="txtStrInputHandle" ref="txtInputStr"></el-input>
            </div>
            <div style="width:400px;margin-top:10px;">
                <el-button @click="newWordCheck">重新开始</el-button>           
                <el-button @click="downMeaning">查字典</el-button>               
                <el-button @click="editNewRoot">新字根</el-button>                               
                <el-button @click="saveWordSplit">保存拆分</el-button>                              
            </div>
        </div>
      </el-header>
        <el-main style="padding: 0px;">            
            <el-table :data="tableData">
                <el-table-column v-for="col in columns" :key="col.field" :prop="col.field" :label="col.title" :width="col.width" >
  
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="320">
                    <template slot-scope="scope">
                        <el-button @click="setPostion(scope.row,'前缀')" type="text" size="small">设为前缀</el-button>
                        <el-button @click="setPostion(scope.row,'字根')" type="text" size="small">设为字根</el-button>
                        <el-button @click="setPostion(scope.row,'后缀')" type="text" size="small">设为后缀</el-button>
                        <el-button @click="editPre(scope.row)" type="text" size="small">后缀/修改</el-button>
                        <el-button @click="removeFromSp(scope.$index)" type="text" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="width:500px;margin-top:20px;">
                <el-input v-model="wordMaster.memo" type="textarea" :autosize="{ minRows: 3, maxRows: 6}" placeholder="请录入单词助记" ref="nextInput" @keyup.enter.native="saveWordSplit" ></el-input>
               
            </div>
            
            <div style="width:900px;height:600px;margin-top:20px;">
               <el-table :data="wordData">
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
            </div>
            
            </el-main>
        </el-container>          
        <el-dialog v-dialogDrag title="编辑" :visible.sync="dialogFormVisible">  
            <el-form>
                <el-form-item>         
                <el-input v-model="newBase" size="small" placeholder="请录入新的单词" ref="firstInput" @keyup.enter.native="nextToMean" ></el-input>
               </el-form-item> <el-form-item>
               <el-input v-model="newMeaning" type="textarea" :autosize="{ minRows: 3, maxRows: 6}" placeholder="请录入新的意思" ref="nextInput" @keyup.enter.native="checkWord" ></el-input>
               </el-form-item> 
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="checkWord">确 定</el-button>
            </div>
            
        </el-dialog> 
        <el-dialog v-dialogDrag title="后缀调整" :model="dialogEditObj" :visible.sync="dialogPefixVisible" v-enterToNext>  
            <el-form>
                <el-form-item>         
                <el-input v-model="dialogEditObj.word" size="small" placeholder="请录入新的单词" ></el-input>
               </el-form-item>               
               <el-form-item>
               <el-input v-model="dialogEditObj.meaning" size="small" placeholder="请录入新的意思" ref="firstPreInput" ></el-input>
               <label @click="resetLastPreMeaning">{{lastPreMeaning}}</label>
               </el-form-item> 
               <el-form-item>
               <el-input v-model="dialogEditObj.partWord"  placeholder="组合到单词中的字符"  @keyup.enter.native="checkPreWord" ></el-input>
               </el-form-item>  
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogPefixVisible = false">取 消</el-button>
                <el-button type="primary" @click="checkPreWord">确 定</el-button>
                <el-button type="primary" @click="savePreWord">另存为后缀</el-button>
            </div>
            
        </el-dialog>   
    </div>
    
</template>
<script>   
    import {ipcRenderer} from "electron";
    import EnWordsDb from "../../enwords";   
    //var Mousetrap = require('mousetrap');
    import axios from 'axios';
    import { constants } from 'http2';
import { TextDecoder } from 'util';
    export default {         
        data(){
            return {
                enWord:'',
                enWordDemo:'',
                zhMeaning:'',
                pronun:'',
                newBase:'',
                newMeaning:'',
                lastPreMeaning:'',
                searchResult:'',
                dialogFormVisible:false,  
                dialogPefixVisible:false, 
                dialogEditObj:{},
                wordMaster:{memo:''},
                wordDb:null,
                tableData:[],
                wordData:[],
                rootIndex:-1,
                lastIndex:-1,
                inputStr:'',
                columns:[
                    {field:'word',title:'字样',width:100},                    
                    {field:"meaning",title:'意思',width:500,input:'textarea'},                                        
                ],
            }
        },
        created(){
            let _this = this;
            this.wordDb = new EnWordsDb();
            this.wordDb.initRoot((lastMaster)=>{
                _this.wordData = lastMaster;                
            });                        
        } ,
        beforeDestroy(){
            this.wordDb.closeDb();
        },
        watch:{
            enWord(val){
                let _this = this;
                if(!val){
                    _this.zhMeaning = '--';
                    return;
                }
                _this.wordMaster = _this.wordDb.getWordMaster(val);               
                if(_this.wordMaster.id==-1){
                    this.wordDb.getWord(val,(err,data)=>{
                        if(data){                        
                            _this.zhMeaning = data.meaning;  
                            _this.pronun = data.pronunciation;                            
                            _this.wordMaster.pronunciation = _this.pronun;
                            _this.wordMaster.meaning = this.zhMeaning;
                            //_this.enWordDemo = _this.wordBase.memo;
                        }else{
                            _this.zhMeaning ='--';
                        }      
                    });
                }                
            }
        },
        methods:{
            downMp3:function(word){     
                if(!word)
                    word = this.enWord;
                let fileName=`${word}.mp3`;//下载文件存放路径
                  
                //扩展，访问局域网内共享文件
                let downUrl=`https://sp0.baidu.com/-rM1hT4a2gU2pMbgoY3K/gettts?lan=uk&text=${word}&spd=2&source=alading`; 
                ipcRenderer.send('download',downUrl+"+"+fileName) 
            },
            downMeaning:function(){
                let _this = this;                
                let url = `http://127.0.0.1:5000/todo/api/v1.0/dict/${this.enWord}`;
                axios.get(url).then(response => {    
                    //console.log(response);
                    let content = response.data.replace(/[\r\n]/g, "");        
                    let obj = JSON.parse(content); 
                    _this.wordMaster.meaning = obj.meaning;  
                    _this.wordMaster.pronunciation = obj.pronunciation; 
                }).catch(function (error) {
                    console.log("error:");
                    console.log(error);
                });
                this.$nextTick(function(){
                    _this.$refs.txtInputStr.$el.querySelector('input').focus();
                });
            },
            resetEnWord:function(){
                let tmp = '';
                let findRoot = false;
                let misWord = '';//处理结尾带忽略字母的
                this.tableData.forEach(word => {                    
                    if(word.partWord){
                        tmp += word.partWord;
                        misWord = word.wordbase;
                    }else{
                        misWord = '';
                        tmp += word.wordbase;
                    }
                    if(word.isroot==1)
                        findRoot = true;
                });
                //如果最后一位还忽略字母，显示这个忽略的末位
                if(misWord.length>0){
                    //console.log(misWord);
                    //取最后的字母                    
                    tmp += misWord.substring(misWord.length-1);
                }
                //console.log('reset enword..' + findRoot);
                if(!findRoot)
                    this.rootIndex = -1;
                this.enWord = tmp;
            },            
            nextToMean:function(){
                this.$nextTick(function(){
                    this.$refs.nextInput.$el.querySelector('input').focus();
                });
            },
            editNewRoot:function(){
                this.dialogFormVisible=true;
                this.$nextTick(function(){
                    this.$refs.firstInput.$el.querySelector('input').focus();
                });
            },
            editPre:function(row){
                this.dialogEditObj=row;
                this.dialogPefixVisible=true;
                this.$nextTick(function(){
                    this.$refs.firstPreInput.$el.querySelector('input').focus();
                });
            },
            checkWord:function(){
                //保存root
                let data = {
                    word:this.newBase,
                    meaning:this.newMeaning,                    
                };

                this.wordDb.insertEntity("wordbase",data,(err,data)=>{
                    if(err){
                        this.$alert(err);
                    }else{
                        this.dialogFormVisible=false;  
                    }
                });                              
            },
            resetLastPreMeaning(){
                this.dialogEditObj.meaning = this.lastPreMeaning;
                let _this = this;
                this.$nextTick(function(){
                    _this.$refs.firstPreInput.$el.querySelector('input').focus();
                });
            },
            checkPreWord:function(){                
                this.lastPreMeaning = this.dialogEditObj.meaning;
                this.resetEnWord();
                this.dialogPefixVisible=false;  
            },
            savePreWord:function(){
                //保存root
                let data = {
                    word:this.dialogEditObj.word,
                    meaning:this.dialogEditObj.meaning,                    
                };

                this.wordDb.insertEntity("wordParent",data,(err,data)=>{
                    if(err){
                        this.$alert(err);
                    }else{
                        console.log("保存前后缀成功:" + this.dialogEditObj.word);
                    }
                });
            },
            setPostion:function(row,pos){
                let word = row.wordbase;
                let isRoot = (row.isroot==1);
                row.isroot=0;//先取消其字根标记
                switch(pos){
                    case "前缀":
                        word = word + "-"
                        break;
                    case "后缀":
                        word = "-" + word;
                        break;
                    case "字根":
                        this.rootIndex = this.enWord.indexOf(word);
                        row.isroot = 1;
                        break;
                }
                //console.log('set...isRoot=' + isRoot);
                row.word = word;
                this.wordDb.matchBase(word,(err,data)=>{                    
                    let meaning = '';
                    let locat = '';
                    if(data){
                        meaning = data.meaning;
                        locat = data.locat;
                    }
                    row.meaning=meaning;      
                    row.locat = locat;              
                });                
                if(isRoot)
                    this.resetEnWord();
            },
            removeFromSp:function(rowindex){                
                this.tableData.splice(rowindex,1);
                this.resetEnWord();
            },
            removeFromWords:function(rowindex){
                this.wordData.splice(rowindex,1);
            },
            showResuntCnt(){
                if(this.tableData &&this.tableData.length>0)
                    this.searchResult=`共有${this.tableData.length}条单词`;
                else
                    this.searchResult='';
            },
            getSelect2:function(){
            },
            getSelect:function(){
                let sel = window.getSelection();
                let txt = sel.toString().trim();
                if(!txt)
                    return;
                
                if(this.rootIndex>-1){
                    let pos = this.enWord.indexOf(txt);
                    if(pos<this.rootIndex)
                        txt = txt + "-"
                    else
                        txt = "-" + txt;
                }
                sel.collapseToStart();    
                this.appendSplitWord(txt);                
            },
            txtStrInputHandle(event){      
                //console.log(event);          
                switch(event.keyCode){
                    case 13://回车添加子拆分
                        this.appedChWord();
                        break;
                    case 79://'o' ctrl+o 为保存单词拆分
                        if(event.ctrlKey){
                            this.saveWordSplit();
                            event.stopPropagation();
                        }
                        break;
                    case 78://'n'  ctrl+n 为新增单词拆分，消除非保存的
                        if(event.ctrlKey){
                            this.newWordCheck();
                            event.stopPropagation();
                        }
                        break;
                    case 68://'d'  ctrl+d 为查字典
                        if(event.ctrlKey){
                            this.downMeaning();
                            event.stopPropagation();
                        }
                        break;
                }
            },
            appendSplitWord(txt){
                let wordBase = txt;
                let _this = this;
                let hasRoot = (this.rootIndex>-1);
                let isroot = 0;
                let partword = '';
                //检查是否有（），视为单词中省掉的字母                
                //let pattern = new RegExp('([a-z]*)\\(([a-z]*)\\)');//取括号前面及里面的字母
                let pattern = /^([\w\s]*)\((\w*)\)/g;//取括号前面及里面的字母
                let arr = txt.split(pattern);        
                if(arr.length>1){            
                    txt = arr[1] + arr[2];//未知何因，ur(e)会拆成"","ur","e",""
                    wordBase = txt;
                    partword = arr[1];                    
                }
                if(hasRoot){                    
                    txt = "-" + txt;
                }else{
                    console.log("isRoot..." + txt);
                    if(this.wordDb.isRoot(txt)){
                        isroot =1;
                        this.rootIndex = this.enWord.length;
                    }else{
                         if(txt.indexOf('-')>-1){
                             wordBase = txt.replace(/-/g,'');//清空所有“-”
                         }else{
                             txt = txt +'-';
                         }
                    }
                }
                
                //取意思
                this.wordDb.matchBase(txt,(err,data)=>{
                    let word = txt;
                    let meaning = '';
                    let locat ='-';                    
                    if(data){                        
                        word = data.word;
                        meaning = data.meaning;
                        locat=data.locat;                        
                    }
                    let row = {
                        word:word,
                        wordbase:wordBase,
                        meaning:meaning,
                        locat:locat,
                        isroot:isroot,
                        partWord:partword
                    };                    
                    _this.tableData.push(row);
                });          
                this.resetEnWord();      
            },
            appedChWord(){
                //this.enWord += this.inputStr;
                this.appendSplitWord(this.inputStr);
                this.inputStr = '';
                this.$nextTick(function(){
                     this.$refs.txtInputStr.$el.querySelector('input').focus();
                });
               
            },
            saveWordSplit:function(){
                let word ={
                    word:this.enWord,
                    pronun:this.pronun,
                    memo:this.enWordDemo
                };
                //console.log(this.tableData);
                this.wordDb.saveSplit(word,this.tableData,(err,data)=>{
                    if(err){
                        this.$alert(err);
                        return;
                    }else{
                        this.downMp3(this.enWord);
                        let row ={word:this.enWord,meaning:this.wordMaster.meaning};
                        this.wordData.push(row);
                    }
                    this.newWordCheck();   
                });                             
            },
            newWordCheck(){
                let _this = this;
                this.tableData =[];
                this.rootIndex = -1; 
                this.enWord=''; 
                this.wordMaster={memo:''}
                this.$nextTick(function(){
                     _this.$refs.txtInputStr.$el.querySelector('input').focus();
                });              
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

