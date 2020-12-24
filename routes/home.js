const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs') //file streams. Consumo de memoria baixo

const bcryptjs = require('bcryptjs')

require("../models/HomePage")
const HomePage = mongoose.model('homepage')

require("../models/Camisa")
const Camisa = mongoose.model('camisa')

require("../models/CategoriaCamisa")
const CategoriaCamisa = mongoose.model('categoriacamisa')

const passport = require('passport')
const { eAdmin } = require("../helpers/eAdmin")



/* Página inicial admin */
router.get('/', (req,res) => {
    HomePage.findOne({}).then((homepage) => {
        Camisa.find({}).then((camisa) => {
            res.render("home/home", {layout: "home-site.handlebars", homepage: homepage, camisa: camisa})
        }).catch((erro) => {
            res.send("Nenhuma informação encontrada entre em contato com o administrador!")
        })
    }).catch((erro) => {
        res.send("Nenhuma informação encontrada entre em contato com o administrador!")
    })
    
})



/* Form para editar a home */
router.get('/edit-home', eAdmin, (req,res) => {
    HomePage.findOne({}).then((homepage) => {
        res.render("home/edit-home", { homepage: homepage }) 
    }).catch((erro) => {
        req.flash("error_msg", "Erro: Não foi possível encontrar a página")
        res.redirect("/dashboard/")
    })
})

router.post('/update-home', eAdmin, (req,res) => {

    //Primeiro pega todos os campos e verifica se estão vazios, nulos ou indefinidos
    //Caso esteja, apresenta mensagem de erro em cima do formulário
    var dados_home_top = req.body
    var errors = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        errors.push({error: "Necessário preencher o campo título"})
    }
    if(!req.body.subtitulo || typeof req.body.subtitulo == undefined || req.body.subtitulo == null){
        errors.push({error: "Necessário preencher o campo subtítulo"})
    }
    if(!req.body.titulobtn || typeof req.body.titulobtn == undefined || req.body.titulobtn == null){
        errors.push({error: "Necessário preencher o campo título do Botão"})
    }
    if(!req.body.urlbtn || typeof req.body.urlbtn == undefined || req.body.urlbtn == null){
        errors.push({error: "Necessário preencher o Link do botão"})
    }
    if(!req.body.titulo_camisa || typeof req.body.titulo_camisa == undefined || req.body.titulo_camisa == null){
        errors.push({error: "Necessário preencher o Título da Camisa"})
    }
    if(!req.body.url_insta || typeof req.body.url_insta == undefined || req.body.url_insta == null){
        errors.push({error: "Necessário preencher a URL do Instagram"})
    }
    if(!req.body.url_face || typeof req.body.url_face == undefined || req.body.url_face == null){
        errors.push({error: "Necessário preencher a URL do Face"})
    }
    if(!req.body.url_linkedin || typeof req.body.url_linkedin == undefined || req.body.url_linkedin == null){
        errors.push({error: "Necessário preencher a URL do Linkedin"})
    }
    if(!req.body.url_git || typeof req.body.url_git == undefined || req.body.url_git == null){
        errors.push({error: "Necessário preencher a URL do Git Hub"})
    }

    //Verifica quantos erros tem acima. Caso tenha algum, monta o layout da página novamente
    //e apresenta os erros que foram armazenados em um array na variável dados_sobre

    //Para testar todos os ifs, retirar o campo 'required' do html 5 no 'edit-sobre.handlebars'
    if(errors.length > 0){
        res.render("home/edit-home", { errors: errors, homepage: dados_home_top} )
    }

    //Caso não tenha erros, pega todos os dados digitados e altera no Banco
    else{
        HomePage.findOne({ _id: req.body._id }).then((homepage) => {
            homepage.titulo = req.body.titulo,
            homepage.subtitulo = req.body.subtitulo,
            homepage.titulobtn = req.body.titulobtn,
            homepage.urlbtn = req.body.urlbtn,
            homepage.titulo_camisa = req.body.titulo_camisa,
            homepage.url_insta = req.body.url_insta,
            homepage.url_face = req.body.url_face,
            homepage.url_linkedin = req.body.url_linkedin,
            homepage.url_git = req.body.url_git

            homepage.save().then(() => {
                req.flash("success_msg", "Editado com sucesso!")
                res.redirect("/edit-home")
            }).catch((erro) => {
                req.flash("error_msg", "Erro: Não foi possível alterar")
                res.redirect("/dashboard/")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Erro: Nenhum registro encontrado")
            res.redirect("/dashboard/")
        })
    }

    
})

/* Trocar Banner */
router.get('/edit-home-img', (req, res) => {
    res.render("home/edit-home-img")
})

const storage = multer.diskStorage({
    destination: function(req, res, cb){
        cb(null, "public/images/")
    },
    filename: function(req, res, cb){
        cb (null, "home-top.jpg")
    }
})
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            cb(null, true)
        }else{
            cb(null, false)
        }
    }
})

router.post('/update-home-img', upload.single('file'), (req, res, next) => {
    const file = req.file
    if(!file){
        req.flash("error_msg", "Erro: Selecione extensão JPG")
        res.redirect("/edit-home-img/")
    }else{
        req.flash("success_msg", "Upload de imagem realizada com sucesso!")
        res.redirect("/edit-home-img/")
    }
})


//Exportar o módulo de rotas
module.exports = router