'use strict';
import EnWordsDb from "./enwords";

export default class EnWordStudy{    
    constructor (){
        this.roots = [];//词根及其一级单词
        this.db = new EnWordsDb();
    }

    async init(cb){
        let wordMasters = await this.db.getTableAll("wordMaster");
        let wordSplit = await this.db.getTableAll("wordSplit");
        
        wordMasters.forEach(wm => {
            let sps = wordSplit.filter(x=>x.fromword==wm.word);
            let mts = sps.filter(x=>x.isroot==1);
            //console.log(mts);
            let root = '';
            if(mts.length>0){
                root = mts[0].word;
                if(!this.roots[root])
                    this.roots[root] = [];                
                if(sps.length<=3){
                    this.roots[root].push(wm);
                }
            }            
        });
        console.log(this.roots);
        //console.log(this.roots.keys);
        cb(this.roots.keys);
    }

    getKeys(){
        return this.roots.Keys;
    }

    closeDb(){
        this.db.closeDb();
    }
}