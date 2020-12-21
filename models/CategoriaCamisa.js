const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const CategoriaCamisa = new Schema({
    nome: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

CategoriaCamisa.plugin(mongoosePaginate)

mongoose.model("categoriacamisa", CategoriaCamisa)