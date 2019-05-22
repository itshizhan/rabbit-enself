'use strict';

export default class EnMerge{
    constructor (){
        this.keyDict = new Array();
        this.keyDict["able-ly"] = "ab";
        this.keyDict["ible-ly"] = "ib";
        this.keyDict["able-ity"] = "abil"
        this.keyDict["ible-ity"] = "ibil"
        this.keyDict["ible-ity"] = "ibil"
    }

    isMerge(tableData,last) {
        if(this.tableData.length==0){
            return
        }
        let lastSp = this.tableData[this.tableData.length-1];                    
        if(lastSp.wordbase=="able" || lastSp.wordbase=="ible" ){
            if(wordBase=="ly")
                lastSp.partWord = lastSp.wordbase.substring(0,1) + "b";
            else if(wordBase=="ity")
                lastSp.partWord = lastSp.wordbase.substring(0,1) + "bil";
        }  
        if(lastSp.wordbase=="ary" || lastSp.wordbase=="acy" || lastSp.wordbase=="ory"){
            if(wordBase.substring(0,1)=="i"){
                lastSp.partWord = lastSp.wordbase.substring(0,lastSp.wordbase.length-1)
            }else{
                if(wordBase=="ly"){
                    lastSp.partWord = lastSp.wordbase.substring(0,lastSp.wordbase.length-1) + "i"
                }
            }
        }          
    }
}