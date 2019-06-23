const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user:{
        type:Schema.Types.Object,
        ref:'Users'
    },
    cart:{
        type: Object,
        required:true    
    }, 
    data :{
        type:String,
    
    }
})

module.exports = mongoose.model("comprappn", schema)