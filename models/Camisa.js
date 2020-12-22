const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const Camisa = new Schema({
    nome_do_time: {
        type: String,
        required: true
    }, 
    ano: {
        type: Number,
        required: true
    },
    cor: {
        type: String,
        required: true
    },
    fornecedor: {
        type: String,
        required: true
    },
    patrocinador: {
        type: String,
        required: true
    },
    categoriacamisa: {
        type: Schema.Types.ObjectId,
        ref: "categoriacamisa",
        required: true
    },
    filename: {
        type: String
    },
    path: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

Camisa.plugin(mongoosePaginate)

mongoose.model("camisa", Camisa)