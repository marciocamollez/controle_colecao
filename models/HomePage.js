const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const HomePage = new Schema({
    titulo: {
        type: String,
        required: true
    }, 
    subtitulo: {
        type: String,
        required: true
    }, 
    urlbtn: {
        type: String,
        required: true
    }, 
    titulobtn: {
        type: String,
        required: true
    }, 
    titulo_camisa: {
        type: String,
        required: true
    }, 
    url_insta: {
        type: String,
        required: true
    }, 
    url_face: {
        type: String,
        required: true
    },
    url_linkedin: {
        type: String,
        required: true
    },
    url_git: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        required: false
    }
})

HomePage.plugin(mongoosePaginate)

mongoose.model("homepage", HomePage)