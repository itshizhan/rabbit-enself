<script>
export default {    
    props:{
        label:{
            type:String           
        },
        field:{
            type:String
        },
        labelWidth:{
            type:String
        },
        options:{
            type:Array,
            defaut:function(){
                return [];
            }
        }
    },
    data:function(){
        return {
            currentColumns:[],
            currentData:''
        }
    },
    watch:{
        data:function(){
            this.makeData();
            var sortedColumn = this.currentColumns.filter((col)=>{
                return col._sortType !=='normal';
            });
            if(sortedColumn.length>0){                
                this.handleDataSort(sortedColumn[0]._index,sortedColumn[0]._sortType==='asc')
            }
        }
    },
    methods:{
        /*
        //<el-form-item label="活动名称" :label-width="formLabelWidth">
                //<el-input v-model="dialogEditObj.name" autocomplete="off"></el-input>
                <el-form-item label="活动区域" :label-width="formLabelWidth">
                <el-select v-model="dialogEditObj.region" placeholder="请选择活动区域">
                    <el-option label="区域一" value="shanghai"></el-option>
                    <el-option label="区域二" value="beijing"></el-option>
                </el-select>
                */
        renderText:function(h){
            console.log("renderText ..." + this.field);
            let input = h('el-input',{props:{vModel:'dialogEditObj["' + this.field +'"]',autocomplete:"off"}});
            return h('el-form-item',{props:{label:this.label,labelWidth:this.labelWidth}},[input]);
        },
        renderSelect:function(h){
            console.log("renderSelect ..." + this.label);
            return h('el-form-item',{props:{label:this.label,labelWidth:this.labelWidth}});                
        }
    },
    render:function(h){ 
        
        let _this = this;
        if(this.options &&this.options.length>0){
            return this.renderSelect(h);            
        }
        return this.renderText(h);
    }
}
</script>