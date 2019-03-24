'use strict';

const sqlite3 = require('sqlite3').verbose();


export default class EnWordsDb{    
    constructor (corpId){
        const path = require('path');
        let corpPath = "../db/englishwords.db";
        const dbPath = path.join(__dirname, corpPath);
        console.log("path=" + dbPath);
        this.db = new sqlite3.Database(dbPath);
        this.db.serialize(()=>{
            const sql = `CREATE TABLE IF NOT EXISTS wordMaster
                (id integer primary key,word text,pronunciation text,meaning text,memo text,sample text)`;
            this.db.run(sql);
        });
        this.dictPieces = [];   
        this.dictRoot=[];     
        this.dictWords=[];
    }
    initRoot(cb){
        //读取所有父节
        this.db.all("select id,word,pronunciation,meaning ,100 as pos  from  wordbase union\
             select id, word,pronunciation,meaning, 1 as pos from wordParent order by pos asc",(err,data)=>{                    
            data.forEach(row => {
                let meaning = row.meaning;
                let wsp = row.word.split(',');                
                wsp.forEach(word => {
                    this.buildWordKey(word,(key)=>{                        
                        let locat = `${row.pos}-${row.id}`;                        
                        this.dictPieces[key] ={
                            word:key,
                            meaning: row.word + " " + meaning,
                            locat:locat
                        };
                        if(row.pos==100){
                            //字根
                            this.dictRoot[key]={
                                word:key,
                                meaning: row.word + " " + meaning,
                                locat:locat
                            };
                        }
                    });
                });                
            });
        });
        this.db.all("select id,word,pronunciation,meaning,memo from wordMaster",(err,data)=>{
            //保留最后两个值            
            data.forEach(row => {                
                this.dictWords[row.word] =row;                
            });               
            let last = this.getLastMaster(2,data);
            //console.log(last);
            cb(last);         
        });
    }
    getLastMaster(max,data){
        //计算开始位数
        let start = 0;
        if(data.length>=max)
            start = data.length - max;
        //console.log('start...' + start);
        let arr =[];
        for(let i=start;i<data.length;i++){            
            arr.push(data[i]);
        }
        return arr;
    }
    getWordMaster(word){
        if(this.dictWords[word]){
            return this.dictWords[word];
        }else{
            let tmp = {
                id:-1,
                word:word,
                pronunciation:'',
                meaning:'',
                memo:'',
                sample:''
            };
            this.dictWords[word] = tmp;
            return tmp;
        }
    }
    sortNumber(wa,wb){
        return wa.pos - wb.pos
    }
    //处理字根有括号的问题，但sqlite似乎值里不能有括号，所以基本不会有arr.leghtn>3的情况
    buildWordKey(word,cb){
        word = word.trim();
        let pattern = new RegExp('([a-z]*)\\(([a-z]*)\\)');//取括号前面及里面的字母
        let arr = word.split(pattern);   //bar(r)拆出来是"","bar","r",""     
        //let tmpWord = word;
        if(arr.length>3){
            //存在括号的，调用2次
            cb(arr[0] + arr[1] + arr[3]);//有些会3="-"
            cb(arr[0] + arr[1] + arr[2] + arr[3]);//有些会3="-"
        }else{
            cb(word);
        }
    }

    

    insertEntity(tableName,data,cb){
        let arr = Object.keys(data);
        //删除id字段，如果存在的话
        let idIndex = arr.indexOf('id');
        if(idIndex>=0)
            arr.splice(idIndex,1);

        let paras = new Array(arr.length);        
        let arrVal = new Array(arr.length);
        for(let i=0;i<arr.length;i++){
            arrVal[i]="?";
            paras[i] = data[arr[i]];//参数的值
            //console.log(paras[i]);
        }
        
        const sql = `insert into ${tableName}(${arr.join(',')}) values(${arrVal.join(',')})`;
        console.log(sql);
        this.db.serialize(()=>{
            this.db.run(sql,paras,(err)=>{
                if(err){
                    cb(err);
                }else{
                    const sqlId = 'select last_insert_rowid() newid';
                    this.db.all(sqlId,cb);
                }
            });
        });
    }
    updateEntity(tableName,data,cb){
        let arr = Object.keys(data);
        //删除id字段，如果存在的话
        let idIndex = arr.indexOf('id');
        if(idIndex>=0)
            arr.splice(idIndex,1);

        let paras = new Array(arr.length);        
        let arrVal = new Array(arr.length);
        for(let i=0;i<arr.length;i++){
            arrVal[i]= arr[i] +'=?';
            paras[i] = data[arr[i]];//参数的值
            //console.log(paras[i]);
        }
        
        const sql = `update ${tableName} set ${arrVal.join(',')} where id=${data.id}`;
        console.log(sql);
        this.db.run(sql,paras,cb);        
    }
    saveSplit(wordData,spData,cb){
        let fromword = wordData.word;
        //检查是否保存过wordMaster
        let wordMaster = this.getWordMaster(fromword);
        if(wordMaster.id==-1){
            this.insertEntity("wordMaster",wordMaster,(err,data)=>{
                if(data){
                    //console.log(data[0].newid);
                    wordMaster.id = data[0].newid;
                }
            });
        }else{
            this.updateEntity("wordMaster",wordMaster,(err,data)=>{
                if(err){
                    console.log(err);
                }
            });
        }
        //清空原字
        this.db.run(`DELETE FROM wordSplit WHERE fromword = ?`, fromword, (err,dldata)=>{
            if(err){
                cb(err,null);
                return;
            }
            spData.forEach(row => {
                /*
                let sql = `insert into wordsplit(word,wordbase,meaning,fromword,isroot) values('${row.word}','${row.wordbase}','${row.meaning}','${fromword}',${row.isroot})`;
                console.log(sql);
                this.db.run(sql,(err,data)=>{
                    if(err){
                        console.log(err);
                        cb(err,null);
                    }    
                });
                */
                row.fromword = fromword;
                this.insertEntity("wordSplit",row,(err,data)=>{
                    if(err){
                        console.log(err);
                        cb(err,null);
                    }
                });
            });
            console.log("saveSplit完成");
            cb(null,spData);
        });
        
    }
    isRoot(word){
        if(this.dictRoot[word])
            return true;
        else
            return false;
    }
    getWord(word,cb){
        //let find = word.replace(/-/g,'%');//将所有-换为%
        //console.log(find);
        this.db.get("select word,pronunciation,meaning from englishwords where word = ?",[word], cb);
    }
    searchWords(dbname,word,cb){
        let find = word.replace(/-/g,'%');//将所有-换为%
        console.log(find);
        //this.db.all("select word,pronunciation,meaning from englishwords where word like ?",[find], cb);
        let sql = `select word,pronunciation,meaning from ${dbname} where word like ?`;
        console.log(sql);
        this.db.all(sql,[find], cb);
    }
    matchBase(word,cb){        
        let mc = this.dictPieces[word];
        if(mc){
            cb('',mc); //找到
        }else{
            cb('',{word:word,meaning:''});//没找到，返回空的意思
        }        
    }

    selectAll(tableName,cb){
        this.db.all("select * from " +tableName, cb);
    }

    closeDb(){
        this.db.close();
    }
}

//module.exports = EnWordsDb;