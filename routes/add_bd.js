//Carregando os módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

require("../models/HomePage")
const HomePage = mongoose.model('homepage')


router.get('/', (req,res) => {
    new HomePage({
        titulo: "Página de coleção de camisa",
        subtitulo: "Reunião das camisas da coleção",
        titulobtn: "Ver a lista",
        urlbtn: "#camisas",
        titulo_camisa: "Lista de Camisa",
        url_insta: "https://www.instagram.com/marciocamoju",
        url_face: "https://www.facebook.com/marciocamoju",
        url_linkedin: "https://www.linkedin.com/in/marcio-camollez-júnior-1b8b49159/",
        url_git: "https://github.com/marciocamollez"
    }).save().then(() => {
        res.send("Home Cadastrada com Sucesso")
    }).catch((erro) => {
        res.send("Erro ao cadastrar a Home")
    })

    
    

})

module.exports = router