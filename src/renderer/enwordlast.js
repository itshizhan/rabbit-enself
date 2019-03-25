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
            cb(this.words[word]);
            return true;
        }else{
            return false;
        }
    }

    clear(word){
        this.words[word] = null;
    }

}