const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require("../models/Contato")
const Contato = mongoose.model('contato')

const passport = require('passport')
const { eAdmin } = require("../helpers/eAdmin")

/* Carregar a página contato do site */
router.get('/', (req,res) => {
    Contato.findOne({}).then((contato) => {
        res.render("contato/contato", {layout: "home-site.handlebars", contato: contato}) 
    }).catch((erro) => {
        res.send("Nenhuma informação encontrada entre em contato com o administrador!")
    })
})

/* Enviar a mensagem */
router.post('/add-contato', (req,res) => {

    //Primeiro pega todos os campos e verifica se estão vazios, nulos ou indefinidos
    //Caso esteja, apresenta mensagem de erro em cima do formulário
    var dados_contato = req.body
    var errors = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errors.push({error: "Necessário preencher o campo Nome"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({error: "Necessário preencher o campo E-mail"})
    }
    if(!req.body.assunto || typeof req.body.assunto == undefined || req.body.assunto == null){
        errors.push({error: "Necessário preencher o campo Assunto"})
    }
    if(!req.body.mensagem || typeof req.body.mensagem == undefined || req.body.mensagem == null){
        errors.push({error: "Necessário preencher o campo Mensagem"})
    }

    //Verifica quantos erros tem acima. Caso tenha algum, monta o layout da página novamente
    //e apresenta os erros que foram armazenados em um array na variável dados_sobre

    //Para testar todos os ifs, retirar o campo 'required' do html 5 no 'edit-sobre.handlebars'
    if(errors.length > 0){
        res.render("home/edit-home", { errors: errors, contato: dados_contato} )
    }

    //Caso não tenha erros, pega todos os dados digitados e altera no Banco
    else{
        const addContato = {
            nome: req.body.nome,
            email: req.body.email,
            assunto: req.body.assunto,
            mensagem: req.body.mensagem
        }
        new Contato(addContato).save().then(() => {
            req.flash("success_msg", "Mensagem enviada com sucesso")
            res.redirect('/contato')
        }).catch((erro) => {
            Contato.findOne({}).then((contato) => {
                errors.push({ error: "Falha ao enviar" })
                res.render("contato/contato", { errors: errors, contato: dados_contat })
            }).catch((erro) => {
                res.send("Nenhuma informação encontrada entre em contato com o administrador!")
            })
            
        })
    }

    
})

/* Listar contatos */
router.get("/list-contato", eAdmin, (req, res) => {
    const { page = 1 } = req.query
    Contato.paginate({}, { page, limit: 2 }).then((contato) => {
        res.render("contato/list-contato", { contatos: contato })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Nenhuma mensagem de contato encontrada!")
        res.redirect("/dashboard/")
    })
})

/* Visualizar contatos */
router.get("/vis-contato/:id", (req, res) => {
    Contato.findOne({ _id: req.params.id }).then((contato) => {
        res.render("contato/vis-contato", { contato: contato })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Nenhuma mensagem de contato encontrada!")
        res.redirect("/contato/list-contato")
    })
})


//Exportar o módulo de rotas
module.exports = router