const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
require("../models/Usuario")
const Usuario = mongoose.model('usuario')

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Cadastro com este e-mail não encontrado!" })
            }

            bcryptjs.compare(senha, usuario.senha, (erro, correta) => {
                if (correta) {
                    return done(null, usuario)
                } else {
                    return done(null, false, { message: "Dados de acesso incorretos!" })
                }
            })
        })
    }))

    //Salvar os dados do usuário na sessão
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (erro, usuario) => {
            done(erro, usuario)
        })
    })

}