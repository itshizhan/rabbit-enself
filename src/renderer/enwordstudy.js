'use strict';
import EnWordsDb from "./enwords";

export default class EnWordStudy{    
    constructor (){
        this.roots = [];//词根字典
        this.allWordRoots = [];//分析单词的词根
        this.allWordFreq = [];//词频
        this.dicWordFreq = [];//词频
        this.allWords = [];//词根下所有单词。key=词根，value是单词及其解释        
        this.db = new EnWordsDb();  
    }

    async init(cb){
        let wordMasters = await this.db.getTableAll("wordMaster");
        let wordSplit = await this.db.getTableAll("wordSplit");
        let wordBases = await this.db.getTableAll("wordbase");
        let wordFreqTmp = await this.db.getTableAll("wordFreq");
        
        wordBases.forEach(element => {
            if (element.ishide==0){
                let rootKey = `100-${element.id}`;
                this.roots[rootKey] = element;
            }
        });        
        let tmpindex = 0
        wordFreqTmp.forEach(eletmp => {
            tmpindex ++;
            let tmpWord = `key-${eletmp.word}` //需使用专门的key字符串，避免象"length"的单词造成字典工作异常           
            this.dicWordFreq[tmpWord] = eletmp.freq;
        });
       
        //console.log(Object.keys(this.dicWordFreq).length);
        let index = 0;
        wordMasters.forEach(wm => {            
            let sps = wordSplit.filter(x=>x.fromword==wm.word);//某一单词的所有拆分
            let mts = sps.filter(x=>x.isroot==1);//取词根
            //console.log(mts);
            let root = '';
            let rootKey = '';
            let meaning = '';
            let wordInRoot = [];//避免同一单词在同一字根中多次出现
            mts.forEach(mt => {            
                root = mt.word;
                rootKey = mt.locat;  
                //准备字根单词节点。只有字根表定义的才显示          
                if(!this.allWords[rootKey] && this.roots[rootKey]){
                    index ++;
                    this.allWords[rootKey] = [];  
                    let _rootWord = this.roots[rootKey].word
                    meaning = this.roots[rootKey].meaning
                    let fullMeaning = `${_rootWord} ${meaning}`
                    this.allWordRoots.push({index:index,rootKey:rootKey,word:_rootWord,meaning:meaning,full:fullMeaning});
                }   
                 
                //避免同一单词在同一字根中多次出现
                let isAppend = true;
                if(wordInRoot[rootKey]){
                    isAppend = false;
                }
                 //字根单词节点准备好了，且字根中没有该单词，才添加
                if(this.allWords[rootKey] && isAppend){
                    wm.full = `${wm.word} ${wm.meaning}`
                    wm.splitCnt = sps.length;
                    // //检查最后一位是否-e，是不的话，splitCnt减一
                    // if(sps[sps.length-1].word=="-e")
                    //     wm.splitCnt --;
                    wm.splitWords = sps;
                    this.allWords[rootKey].push(wm);                   
                    wordInRoot[rootKey] = true;
                }
            });            
        });  
        cb(this.allWordRoots);
    }

    getWordFreqVal(word,defaultVal){    
        let tmpWord = `key-${word}`   
        if(this.dicWordFreq[tmpWord])
            return this.dicWordFreq[tmpWord];
        else
            return defaultVal;
        // let arr = this.allWordFreq.filter(x=>x.word==word);
        // if(arr.length==0)
        //     return defaultVal;
        // else
        //     return arr[0].freq;
    }
    async buildTree(cb){
        let tree = []; 
        let childs = [];//先将子类根保存起来，添加所有非子类后再添加
        this.allWordRoots.forEach(root => {
            //console.log(root);
            let key = root.rootKey;
            let words = this.allWords[key];
            let rootLabel = root.full;
            //console.log(`key=${key},words.length=${words.length}`)
            this.setWordTree(words);
            let tops = words.filter(x=>x.isTopParent==true); 
            //检查是否存在父词根
            if(this.roots[key].parentid>0){
                let parentKey = `100-${this.roots[key].parentid}`
                childs[parentKey] = tops;//先保存到子节点，避免子节点的单词先于父节点时无显示问题
            }else{
                let node = {id:key,word:root.word,meaning:root.meaning, full:root.full,rootKey:key,children:tops};
                tree.push(node);     
            } 
        });   
        //添加子节点
        for(let parentKey in childs){
            console.log(parentKey);
            let tops = childs[parentKey]
            let find = tree.filter(x=>x.rootKey==parentKey);
            if(find && find.length>0){
                tops.forEach(one => {
                    find[0].children.push(one);//作为子节点添加到父树上
                });
            }else{
                console.log("未能找到父节点" + parentKey);
            }
        }  
        cb(tree);
    }

    setWordTree(wordList){
        let ateCnt = 0;//拆分长度。当ateCnt==wordList.length时，循环退出
        let keyLen = 1;
        let ateDict = [];//已处理
        while(wordList.length>ateCnt){
            let levels = wordList.filter(x=>x.splitCnt==keyLen);//取所有该拆分长度的单词
            levels.forEach(element => {                
                this.findParent(ateDict,element,(data)=>{                     
                    ateDict.push(data);//完成后都会将数据加到已处理库中,以后后面单词检查是否为自己的父根
                });  
                ateCnt ++;//每处理一个加1
            });            
            keyLen ++;           
        }
    }

    findParent(ateDict,elWord,cb){
        elWord.isTopParent = true;//默认视为找不到父类
        elWord.children=[];
        if(ateDict.length==0)//最被并不基类
        {
            cb(elWord);
            return;
        }
        // for(let i=0;i<ateDict.length;i++){            
        //     let bw= ateDict[ateDict.length - i -1];
        //     if(this.isParent(bw,elWord,0,0,true)){                
        //         elWord.isTopParent = false;
        //         bw.children.push(elWord);
        //         break;//从一堆单词中找到父类，从中退出
        //     }
        // }        
        //按拆分的数量，从多到少排序。就是尽量找到最长的作为其父类
        let sorted = ateDict.sort(this.descSortSplitLen);         
        for(let i=0;i<sorted.length;i++){            
            let bw= sorted[i];
            // if(elWord.word=="unconvincing")
            //     console.log(`check ..${bw.word} split.cnt=${bw.splitCnt}`);
            if(this.isParent(bw,elWord,0,0,true)){                
                elWord.isTopParent = false;
                bw.children.push(elWord);
                break;//从一堆单词中找到父类，从中退出
            }
        }
               
        cb(elWord); 
    }
    //按拆分的数量，从多到少排序
    descSortSplitLen(a,b){        
        let flag = 1;
        if(a.splitCnt>b.splitCnt)
            return -flag;
        if(a.splitCnt<b.splitCnt)
            return flag;
        if(a.word.length>b.word.length)
            return -flag
        if(a.word.length<b.word.length)
            return flag;
        else
            return 0;
    }

    isParent(parent,testWord,pos,testPos,machfirst){
        // if( parent.word=="convincing" && testWord.word=="unconvincing") //parent.word=="convincing" && 
        //     console.log(parent.word + " check for " + testWord.word + " testPos=" + testPos + " pos=" + pos + " machfirst=" + machfirst);        
        //testWord的长度会不一定比parent的长度长，
        if(pos>=parent.splitWords.length){//第一个位置未能匹配，到了末尾视为失败
            if(machfirst)
                return false;//parent检查完毕，但没有匹配一个拆分部分
            else
                return true;   //已匹配到了第一个位置的，到了末尾视为成功匹配  
        }
        if(testPos>=testWord.splitWords.length){
            let parentLen = parent.splitWords.length;
            if(pos==parentLen-1 && parent.splitWords[parentLen-1].word=="-e")
                return true;
            else
                return false;
        }

        let minLen = testWord.splitWords.length - parent.splitWords.length;
        if(machfirst){//首位检查,             
            if(testPos>=testWord.splitWords.length)
                return false;
            if(pos+minLen > testWord.splitWords.length)
                return false;            
            if(parent.splitWords[pos].word===testWord.splitWords[testPos].word)
                return this.isParent(parent,testWord,pos+1,testPos+1,false);
            else
                return this.isParent(parent,testWord,pos,testPos + 1,true);//还在找首个匹配的位置
        }else{            
            //判断是否最后一位，如果最后一样是-e结尾，不作判断，直接返回真
            if(pos==parent.splitWords.length-1 && (parent.splitWords[pos].word=="-e"))
                return true;
            if(parent.splitWords[pos].word===testWord.splitWords[testPos].word)
                return this.isParent(parent,testWord,pos+1,testPos+1,false);
            else
                return false;
        }
        
    }

    getTopWords(root,len){
        if(this.allWords[root]){            
            let arr= this.allWords[root].filter(x=>x.splitCnt<=len).sort(this.sortWord);            
            return arr;
        }else{
            return [];
        }
    }
    sortWord(a,b){
        if(a.word >b.word)
            return 1;
        else if(a.word<b.word)
            return -1;
        else
            return 0;
    }

    closeDb(){
        this.db.closeDb();
    }
}