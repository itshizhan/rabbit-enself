'use strict';

export default class EnWordLast{    
    constructor (){
        this.words = [];
    }

    setLast(key,word){
        this.words[key] = word;
    }

    getLast(word,cb){
        if(this.words[word]){
            cb({isFind:true,preWord:this.words[word]});            
        }else{
            cb({isFind:false,preWord:{}});
        }
    }

    clear(word){
        this.words[word] = null;
    }

}