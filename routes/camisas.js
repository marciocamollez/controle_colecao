const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')


require("../models/CategoriaCamisa")
const CategoriaCamisa = mongoose.model('categoriacamisa')


/*require("../models/Camisa")
const Camisa = mongoose.model('camisa')*/


const passport = require('passport')
const { eAdmin } = require("../helpers/eAdmin")



/* Acessar categoria de camisas */
router.get('/categoria-camisas', eAdmin, (req, res) => {
    const { page = 1 } = req.query
    CategoriaCamisa.paginate({}, { page, limit: 2 }).then((categoriacamisa) => {
        res.render("camisas/categoria-camisas", { categoriacamisa: categoriacamisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de camisa não encontrado!")
        res.render("camisas/categoria-camisas")
    })
})

/* Visualizar a Categoria de Camisas */
router.get('/visualizar-categoria-camisa/:id', eAdmin, (req, res) => {
    CategoriaCamisa.findOne({ _id: req.params.id }).then((categoriacamisa) => {
        res.render("camisas/visualizar-categoria-camisa", { categoriacamisa: categoriacamisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de camisa não encontrado!")
        res.render("camisas/categoria-camisas")
    })
})

/* Cadastrar a Categoria de Camisas */
router.get('/cadastrar-categoria-camisa', eAdmin, (req, res) => {
    res.render("camisas/cadastrar-categoria-camisa")
})


/* Adicionar a Categoria de Camisa */
router.post('/add-categoria-camisa', eAdmin, (req, res) => {
    var dados_cat_pg = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome!" })
    }

    if (errors.length > 0) {
        res.render("camisas/cadastrar-categoria-camisa", { errors: errors, categoriacamisa: dados_cat_pg })
    } else {
        const addCatCamisa = {
            nome: req.body.nome
        }
        new CategoriaCamisa(addCatCamisa).save().then(() => {
            req.flash("success_msg", "Categoria de camisa cadastrada com sucesso!")
            res.redirect('/camisas/categoria-camisas')
        }).catch((erro) => {
            errors.push({ error: "Error: Categoria de camisas não foi cadastrada com sucesso!" })
            res.render("camisas/cadastrar-categoria-camisa", { errors: errors, categoriacamisa: dados_cat_pg })
        })
    }
})

/* Editar Categoria de Camisa */
router.get('/editar-categoria-camisa/:id', eAdmin, (req, res) => {
    CategoriaCamisa.findOne({ _id: req.params.id }).then((categoriacamisa) => {
        res.render("camisas/editar-categoria-camisa", { categoriacamisa: categoriacamisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de camisa não encontrado!")
        res.redirect("/camisas/categoria-camisas")
    })

})

/* Atualizar Categoria de Camisas */
router.post('/update-categoria-camisa', eAdmin, (req, res) => {
    var dados_cat_pg = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome!" })
    }

    if (errors.length > 0) {
        res.render("camisas/editar-categoria-camisa", { errors: errors, catpagamento: dados_cat_pg })
    } else {
        CategoriaCamisa.findOne({ _id: req.body._id }).then((categoriacamisa) => {
            categoriacamisa.nome = req.body.nome
            categoriacamisa.save().then(() => {
                req.flash("success_msg", "Categoria de camisa editada com sucesso!")
                res.redirect("/camisas/categoria-camisas")
            }).catch((erro) => {
                req.flash("error_msg", "Error: Categoria de camisa não foi editada com sucesso!")
                res.redirect("/camisas/categoria-camisas")
                errors.push({ error: "Error: Categoria de camisas não foi cadastrada com sucesso!" })
                res.render("camisas/editar-categoria-camisa", { errors: errors, categoriacamisa: dados_cat_pg })
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Categoria de camisa não encontrado!")
            res.redirect("/camisas/categoria-camisas")
        })
    }
})

/* Deletar Categoria de Camisa */
router.get('/deletar-categoria-camisa/:id', eAdmin, (req, res) => {
    CategoriaCamisa.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria de camisa apagada com sucesso!")
        res.redirect("/camisas/categoria-camisas")
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de camisa não foi apagado com sucesso!")
        res.redirect("/camisas/categoria-camisas")
    })
})




//Exportar o módulo de rotas
module.exports = router