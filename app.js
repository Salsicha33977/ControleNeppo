const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const admin = require('./Rotas/admin')
const path = require('path')
const mongoose = require("mongoose")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash')
const usuarios = require("./Rotas/usuarios")
const passport = require('passport')

const beb = require('./Rotas/beb')
require("./conf/auth")(passport)


//Configurações
    //sessao
    app.use(session({
        secret: "Salsicha3397 e top",
        resave:false,
        saveUninitialized:false,
        store:new MongoStore({ mongooseConnection: mongoose.connection}),
        cookie :{ maxAge:180 *60*1000}
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //Mid
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error= req.flash("error")
        res.locals.adc = req.flash("adc_msg")
        res.locals.user= req.user || null;
        res.locals.session = req.session;
    next()
    })
    //body Parser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())

    //handlebars
    app.engine('handlebars', handlebars({defaultLayout : 'main'}))
    app.set('view engine', 'handlebars')
    
    //public
    app.use(express.static(path.join(__dirname,"public")))

    //Mongo
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/PedidosNeppo",{ useNewUrlParser: true }).then(()=>{
        console.log("Conectado com sucesso")
    }).catch((err)=>{
        console.log("Erro ao conectar"+err)
    })
//Rotas
    app.get('/',(req,res)=>{
        
        res.render("home")
    })
    app.use('/admin', admin)
    app.use("/usuarios",usuarios)
    app.use("/beb",beb)
//PORTA
const PORT = 80

app.listen(PORT,()=>{
    console.log("Servidor rodando")
})