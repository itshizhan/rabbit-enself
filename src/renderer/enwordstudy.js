'use strict';
import EnWordsDb from "./enwords";

export default class EnWordStudy{    
    constructor (){
        this.roots = [];//词根及其一级单词
        this.firstWords = [];
        this.db = new EnWordsDb();
    }

    async init(cb){
        let wordMasters = await this.db.getTableAll("wordMaster");
        let wordSplit = await this.db.getTableAll("wordSplit");
        
        let index = 0;
        wordMasters.forEach(wm => {            
            let sps = wordSplit.filter(x=>x.fromword==wm.word);
            let mts = sps.filter(x=>x.isroot==1);//取词根
            //console.log(mts);
            let root = '';
            let rootKey = '';
            let meaning = '';
            mts.forEach(mt => {            
                root = mt.word;
                rootKey = mt.locat;
                meaning = mt.meaning;
                if(!this.firstWords[rootKey]){
                    index ++;
                    this.firstWords[rootKey] = [];  
                    this.roots.push({index:index,word:rootKey,meaning:meaning});
                }              
                if(sps.length<=2){
                    this.firstWords[rootKey].push(wm);
                }else if(sps.length==3 && sps[2].word!=root){                   
                    if(sps[2].word.length<=2)//由三部分组成的字也可能是关键词，但结尾必须是“-单字母”，即长度为2
                        this.firstWords[rootKey].push(wm);
                }
            });            
        });       
        cb(this.roots);
    }

    getTopWords(root){
        if(this.firstWords[root]){
            let arr= this.firstWords[root].sort(this.sortWord);
            console.log(arr);
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