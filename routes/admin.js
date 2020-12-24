const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

require("../models/Usuario")
const Usuario = mongoose.model('usuario')

require("../models/Camisa")
const Camisa = mongoose.model('camisa')

const passport = require('passport')
const { eAdmin } = require("../helpers/eAdmin")



/* Página inicial admin */


/*router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})*/

router.get('/',  eAdmin, (req,res) => {
    Camisa.countDocuments({}, function( err, count){
        res.render("admin/index")
        console.log( "Numero de Cadastros:", count );
    }).catch((erro) => {
        res.send("Nenhuma informação encontrada entre em contato com o administrador!")
    })    
    
})



/* Página do Login  */
router.get('/login', (req, res) => {
    res.render("admin/login")
})

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin/",
        failureRedirect: "/admin/login",
        failureFlash: true
    })(req, res, next)
})

/* Logout */
router.get('/logout', (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/admin/login")
})


/* Cadastrar o Usuário */
router.get('/cad-usuario', eAdmin, (req, res) => {
    res.render("admin/cad-usuario")
})
router.post('/add-usuario', eAdmin, (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                errors.push({ error: "Error: Este e-mail já está cadastrado!" })
                res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
            } else {
                const addUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(addUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            errors.push({ error: "Error: Não foi possível cadastrar, entre em contato com o administrador!" })
                            res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
                        } else {
                            addUsuario.senha = hash
                            addUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!")
                                res.redirect('/admin/usuarios')
                            }).catch((erro) => {
                                errors.push({ error: "Error: Usuário não foi cadastrado com sucesso!" })
                                res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
                            })
                        }
                    })
                })
            }
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível cadastrar, entre em contato com o administrador!")
            res.render("admin/usuarios")
        })
    }
})

/* Listar usuario */
router.get('/usuarios', eAdmin, (req, res) => {
    const { page = 1 } = req.query
    Usuario.paginate({}, { page, limit: 2 }).then((usuario) => {
        res.render("admin/usuarios", { usuarios: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

/* Visualizar detalhes do usuário */
router.get('/vis-usuario/:id', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        res.render('admin/vis-usuario', { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

/* Editar usuário */
router.get('/edit-usuario/:id', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        res.render("admin/edit-usuario", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.render("admin/usuarios")
    })
})

/* Atualizar dados do usuário */
router.post("/update-usuario", eAdmin, (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }

    if (errors.length > 0) {
        res.render("admin/edit-usuario", { errors: errors, usuario: dados_usuario })
    } else {
        Usuario.findOne({ _id: req.body._id }).then((usuario) => {
            usuario.nome = req.body.nome,
                usuario.email = req.body.email

            usuario.save().then(() => {
                req.flash("success_msg", "Usuário editado com sucesso!")
                res.redirect("/admin/usuarios")
            }).catch((erro) => {
                req.flash("error_msg", "Error: Usuário não foi editado com sucesso!")
                res.redirect("/admin/usuarios")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Usuário não encontrado!")
            res.redirect("/admin/usuarios")
        })
    }
})

/* Editar senha */
router.get('/edit-usuario-senha/:id', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        dados_usuario = {_id: req.params.id}
        res.render("admin/edit-usuario-senha", { dados_usuario: dados_usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

/* Atualizar senha */
router.post("/update-usuario-senha", eAdmin, (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("admin/edit-usuario-senha", { errors: errors, dados_usuario: dados_usuario })
    } else {
        Usuario.findOne({ _id: req.body._id }).then((usuario) => {
            usuario.senha = req.body.senha
            bcryptjs.genSalt(10, (erro, salt) => {
                bcryptjs.hash(usuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash("error_msg", "Error: Não foi possível editar a senha, entre em contato com o administrador!")
                        res.redirect("/admin/usuarios")
                    } else {
                        usuario.senha = hash
                        usuario.save().then(() => {
                            req.flash("success_msg", "Senha editada com sucesso!")
                            res.redirect("/admin/usuarios")
                        }).catch((erro) => {
                            req.flash("error_msg", "Error: Não foi possível editar a senha, entre em contato com o administrador!")
                            res.redirect("/admin/usuarios")
                        })
                    }
                })
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível editar a senha, entre em contato com o administrador!")
            res.redirect("/admin/usuarios")
        })
    }
})

/* Apagar Usuário */
router.get('/del-usuario/:id', eAdmin, (req, res) => {
    Usuario.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Usuário apagado com sucesso!")
        res.redirect("/admin/usuarios")
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não foi apagado com sucesso!")
        res.redirect("/admin/usuarios")
    })
})

/* Acessar perfil */
router.get('/perfil', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).then((usuario) => {
        res.render('admin/perfil', { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Perfil não encontrado!")
        res.redirect("/admin/login")
    })
})

/* Editar Perfil */
router.get('/edit-perfil', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).then((usuario) => {
        res.render("admin/edit-perfil", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Perfil não encontrado!")
        res.redirect("/admin/login")
    })
})

/* Atualizar Perfil */
router.post("/update-perfil", eAdmin, (req, res) => {
    var dados_perfil = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }

    if (errors.length > 0) {
        res.render("admin/edit-perfil", { errors: errors, usuario: dados_perfil })
    } else {
        Usuario.findOne({ _id: req.user._id }).then((usuario) => {
            usuario.nome = req.body.nome,
                usuario.email = req.body.email

            usuario.save().then(() => {
                req.flash("success_msg", "Perfil editado com sucesso!")
                res.redirect("/admin/perfil")
            }).catch((erro) => {
                req.flash("error_msg", "Error: Perfil não encontrado!")
                res.redirect("/admin")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/admin/login")
        })
    }
})

/* Editar senha do perfil */
router.get('/edit-senha-perfil', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).then((usuario) => {
        res.render("admin/edit-senha-perfil", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Perfil não encontrado!")
        res.redirect("/admin/login")
    })
})

/* Atualizar senha do Perfil */
router.post("/update-senha-perfil", eAdmin, (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("admin/edit-senha-perfil", { errors: errors, dados_usuario: dados_usuario })
    } else {
        Usuario.findOne({ _id: req.user._id }).then((usuario) => {
            usuario.senha = req.body.senha
            bcryptjs.genSalt(10, (erro, salt) => {
                bcryptjs.hash(usuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash("error_msg", "Error: Não foi possível editar a senha, entre em contato com o administrador!")
                        res.redirect("/admin/perfil")
                    } else {
                        usuario.senha = hash
                        usuario.save().then(() => {
                            req.flash("success_msg", "Senha editada com sucesso!")
                            res.redirect("/admin/perfil")
                        }).catch((erro) => {
                            req.flash("error_msg", "Error: Não foi possível editar a senha, entre em contato com o administrador!")
                            res.redirect("/admin/perfil")
                        })
                    }
                })
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/admin/login")
        })
    }

})


//Exportar o módulo de rotas
module.exports = router