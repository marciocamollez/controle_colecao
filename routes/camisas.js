const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs') //file streams. Consumo de memoria baixo



require("../models/CategoriaCamisa")
const CategoriaCamisa = mongoose.model('categoriacamisa')


require("../models/Camisa")
const Camisa = mongoose.model('camisa')


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


/* =================================================================== */

/* Acessar página camisas */
router.get('/lista-camisas', eAdmin, (req, res) => {
    const { page = 1 } = req.query
    Camisa.paginate({}, { page, limit: 10, populate: "categoriacamisa" }).then((camisa) => {
        res.render("camisas/lista-camisas", { camisa: camisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Camisas não encontradadas!")
        res.render("camisas/lista-camisas")
    })

})

/* Exemplo: Contagem total das camisas
Camisa.countDocuments({}, function( err, count){
    console.log( "Number of users:", count );
})*/

/* Exemplo: Cor verde das camisas
Camisa.countDocuments({cor: "Verde"}, function( err, count){
    console.log( "Number of users:", count );
})*/


/* Visualizar Camisa específica */
router.get('/visualizar-camisa/:id', eAdmin, (req, res) => {
    Camisa.findOne({ _id: req.params.id }).populate("categoriacamisa").then((camisa) => {
        res.render("camisas/visualizar-camisa", { camisa: camisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Camisa não encontrada!")
        res.render("camisas/lista-camisas")
    })
})

/* Cadastrar Camisa específica */
router.get('/cadastrar-camisa', eAdmin, (req, res) => {
    CategoriaCamisa.find().then((categoriacamisa) => {
        res.render("camisas/cadastrar-camisa", { categoriacamisa: categoriacamisa })
    }).catch((erro) => {
        req.flash("error_msg", "Error: O formulário cadastrar camisa não pode ser carregado!")
        res.redirect("/camisas/lista-camisas")
    })
})

/* Adicionar Camisa específica */

const storageCamisa = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/uploads")
    },
    filename: function(req, file, cb){
        var originalname = file.originalname;
        var extension = originalname.split(".");
        filename = Date.now() + '.' + extension[extension.length-1];
        cb(null, filename);
    }
    
})
const uploadCamisa = multer({ 
    storage: storageCamisa,
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            cb(null, true)
        }else{
            cb(null, false)
        }
    }
})


router.post('/add-camisa', eAdmin, uploadCamisa.single('file'), (req, res, next) => {

    


    var dados_camisa = req.body
    var errors = []
    if (!req.body.nome_do_time || typeof req.body.nome_do_time == undefined || req.body.nome_do_time == null) {
        errors.push({ error: "Necessário preencher o campo Nome do Time" })
    }
    if (!req.body.ano || typeof req.body.ano == undefined || req.body.ano == null) {
        errors.push({ error: "Necessário preencher o campo Ano" })
    }
    if (!req.body.cor || typeof req.body.cor == undefined || req.body.cor == null) {
        errors.push({ error: "Necessário preencher o campo Cor" })
    }
    if (!req.body.fornecedor || typeof req.body.fornecedor == undefined || req.body.fornecedor == null) {
        errors.push({ error: "Necessário preencher o campo Fornecedor" })
    }
    if (!req.body.patrocinador || typeof req.body.patrocinador == undefined || req.body.patrocinador == null) {
        errors.push({ error: "Necessário preencher o campo Patrocinador" })
    }
    if (!req.body.categoriacamisa || typeof req.body.categoriacamisa == undefined || req.body.categoriacamisa == null) {
        errors.push({ error: "Necessário preencher o campo Categoria Camisa" })
    }
    

    if (errors.length > 0) {
        CategoriaCamisa.find().then((categoriacamisa) => {
            res.render("camisas/cadastrar-camisa", { errors: errors, camisa: dados_camisa, categoriacamisa: categoriacamisa })
        })

    } else {
        const addCamisa = {
            nome_do_time: req.body.nome_do_time,
            ano: req.body.ano,
            cor: req.body.cor,
            fornecedor: req.body.fornecedor,
            patrocinador: req.body.patrocinador,
            filename: req.file.filename,
            path: req.file.path,
            categoriacamisa: req.body.categoriacamisa
            
        }
        new Camisa(addCamisa).save().then(() => {
            req.flash("success_msg", "Camisa cadastrada com sucesso!")
            res.redirect('/camisas/lista-camisas')
        }).catch((erro) => {
            errors.push({ error: "Error: Camisa não foi cadastrada com sucesso!" })
            CategoriaCamisa.find().then((categoriacamisa) => {
                res.render("camisas/cadastrar-camisa", { errors: errors, camisa: dados_camisa, categoriacamisa: categoriacamisa })
            })
        })
    }

})

/* Editar Camisa */
router.get('/editar-camisa/:id', eAdmin, (req, res) => {
    Camisa.findOne({ _id: req.params.id }).populate("categoriacamisa").then((camisa) => {
        CategoriaCamisa.find().then((categoriacamisa) => {
            res.render("camisas/editar-camisa", { camisa: camisa, categoriacamisa: categoriacamisa })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível carregar as categorias de Camisa!")
            res.redirect('/camisas/lista-camisas')
        })


    }).catch((erro) => {
        req.flash("error_msg", "Error: Não é possível carregar o formulário editar camisa!")
        res.redirect('/camisas/lista-camisas')
    })
})

/* Atualizar Camisa. Aqui tem que incluir o upload */
router.post('/update-camisa', uploadCamisa.single('file'), (req, res, next) => {
    Camisa.findOne({_id: req.body.id}).then((camisa) =>{
        camisa.nome_do_time = req.body.nome_do_time,
        camisa.ano = req.body.ano,
        camisa.cor = req.body.cor,
        camisa.fornecedor = req.body.fornecedor,
        camisa.patrocinador = req.body.patrocinador,
        camisa.filename = req.file.filename,
        camisa.path = req.file.path,
        camisa.categoriacamisa = req.body.categoriacamisa

        camisa.save().then(() => {
            req.flash("success_msg", "Camisa editado com sucesso!")
            res.redirect('/camisas/lista-camisas')
        }).catch((erro) => {
            req.flash("error_msg", "Error: Camisa não foi editado com sucesso!")
            res.redirect('/camisas/lista-camisas')
        })

    }).catch((erro) => {
        req.flash("error_msg", "Error: Camisa não encontrado!")
        res.redirect('/camisas/lista-camisas')
    })
})






/* Deletar Camisa */
router.get('/deletar-camisa/:id', eAdmin, (req, res) => {
    Camisa.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Camisa apagado com sucesso!")
        res.redirect('/camisas/lista-camisas')
    }).catch((erro) => {
        req.flash("error_msg", "Error: Camisa não foi apagado com sucesso!")
        res.redirect('/camisas/lista-camisas')
    })
})



//Exportar o módulo de rotas
module.exports = router