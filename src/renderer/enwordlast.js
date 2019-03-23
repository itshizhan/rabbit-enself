'use strict';

export default class EnWordLast{    
    constructor (){
        this.words = [];
    }

    setLast(word,meaning,partword){
        this.words[word] = {word:word,meaning:meaning,partword:partword};
    }

    getLast(word,cb){
        if(this.words[word]){
            cb(this.words[word]);
        }
    }

}