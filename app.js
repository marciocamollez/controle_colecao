const express = require('express'); //Gerencia as rotas do projeto
const app = express(); //Define que os scripts vao começar sempre com "app."
const handlebars = require('express-handlebars') //Permite trazer tags do BD dentro do html
const bodyParser = require('body-parser') //Converte a requisição em JSON
const path = require("path") //Para que possa usar a URL curta dentro do projeto
const mongoose = require('mongoose') //Faz o meio campo do banco de dados ao JS
const session = require('express-session')  //Middleware que armazena os dados da sessão no servidor
const flash = require('connect-flash') //Faz com que apareça as mensagens de erro de forma dinamica
const passport = require('passport') //Faz a autenticação do Express
require("./config/auth")(passport)

const admin = require("./routes/admin") //Pagina do login
const camisas = require("./routes/camisas") //Pagina de camisas

//Sessão
app.use(session({
    secret: 'celkeonesession',
    resave: true,
    saveUninitialized: true
}))
//Passport
app.use(passport.initialize())
app.use(passport.session())
//Flash
app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})


//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Handlebars
app.engine('handlebars', handlebars({ defaultLayout: "main" }))
app.set("view engine", 'handlebars')


//Conexão com banco de dados
mongoose.connect('mongodb://localhost/camisas', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conexão com MongoDB realizado com sucesso...")
}).catch((erro) => {
    console.log("Erro: Conexão com MongoDB não foi realizado com sucesso: " + erro)
})



//Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")))


//Rotas
app.use('/admin', admin)
app.use('/camisas', camisas)

//Iniciar o servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log("Servidor iniciado!");
})