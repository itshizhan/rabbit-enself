'use strict';
import EnWordsDb from "./enwords";

export default class EnWordStudy{    
    constructor (){
        this.roots = [];//词根
        this.allWords = [];//词根下所有单词。key=词根，value是单词及其解释        
        this.db = new EnWordsDb();    }

    async init(cb){
        let wordMasters = await this.db.getTableAll("wordMaster");
        let wordSplit = await this.db.getTableAll("wordSplit");
        
        let index = 0;
        wordMasters.forEach(wm => {            
            let sps = wordSplit.filter(x=>x.fromword==wm.word);//某一单词的所有拆分
            let mts = sps.filter(x=>x.isroot==1);//取词根
            //console.log(mts);
            let root = '';
            let rootKey = '';
            let meaning = '';
            mts.forEach(mt => {            
                root = mt.word;
                rootKey = mt.locat;
                meaning = mt.meaning;
                if(!this.allWords[rootKey]){
                    index ++;
                    this.allWords[rootKey] = [];  
                    this.roots.push({index:index,word:rootKey,meaning:meaning});
                }   
                wm.splitCnt = sps.length;
                wm.splitWords = sps;
                this.allWords[rootKey].push(wm);
            });            
        });       
        cb(this.roots);
    }

    async buildTree(cb){
        let tree = [];        
        this.roots.forEach(root => {
            //console.log(root);
            let key = root.word;
            let words = this.allWords[key];
            //console.log(words);
            if(words){               
                let rootLabel = root.meaning;
                //console.log(`key=${key},words.length=${words.length}`)
                this.setWordTree(words);
                let tops = words.filter(x=>x.isTopParent);
                let node = {word:rootLabel,children:tops};            
                tree.push(node);
            }
        });
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
                    data.label = data.word;
                    ateDict.push(data);//完成后都会将数据加到已处理库中,以后后面单词检查是否为自己的父根
                });  
                ateCnt ++;//每处理一个加1
            }); 
            keyLen ++;           
        }
    }

    findParent(ateDict,elWord,cb){
        ateDict.forEach(bw => {
            if(isParent(bw,elWord,0,0,true)){
                bw.children.push(elWord);
            }else{
                elWord.isTopParent = true;
                elWord.children=[];
            }
            cb(elWord);        
        });
    }

    isParent(parent,testWord,pos,testPos,machfirst){
        console.log(parent + " check for " + testWord + " testPos=" + testPos);
        //return false;
        //testWord的长度会比parent的长度长，
        let minLen = testWord.splitWords.length - parent.splitWords.length;
        if(machfirst){//首位检查
            if(pos+minLen > testWord.splitWords.length)
                return false;            
            if(parent.splitWords[pos].word==testWord.splitWords[testPos].word)
                return isParent(parent,testWord,pos+1,testPos+1,false);
            else
            return isParent(parent,testWord,pos,testPos + 1,true);//还在找首个匹配的位置
        }else{
            if(pos>=parent.splitWords.length)
                return true;
            if(parent.splitWords[pos].word==testWord.splitWords[testPos].word)
                return isParent(parent,testWord,pos+1,testPos+1,false);
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