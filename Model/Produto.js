const mongoose= require('mongoose')
const Schema = mongoose.Schema;


const Produto = new Schema({
    img:{
        type:String,
        required:true
        
    },
    title :{
        type: String,
        required:true
    },
    quantidade:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    }
})


 mongoose.model("Produto",Produto)