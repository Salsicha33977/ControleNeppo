const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../Model/Users')
const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs')
const passport = require('passport')


//Renderiza a pag de scriaçao de usuarios
router.get("/criar",(req,res)=>{
    res.render("usuarios/criar")
})
//Salva o usuario no banco
router.post("/criar",(req,res)=>{
    var erros=[]
    if(req.body.senha.length <6){
        erros.push({texto:"Senha muito curta"})
    }
    if(req.body.senha !=req.body.senha1){
        erros.push({texto:"As senhas são diferentes"})
    }
    if(erros.length >0){
res.render("usuarios/criar", {erros:erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error","Ja existe uma conta com esse email")
                res.redirect("/")
            }else{
            const novoUsuario= new Usuario({
                nome:req.body.nome,
                email:req.body.email,
                senha:req.body.senha
            })
                bcrypt.genSalt(10,(erro , salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt,(erro,  hash)=>{
                        if(erro){
                            req.flash("error_msg","Erro ao salvar o Usuario")
                            res.redirect("/")
                        }
                        novoUsuario.senha=hash


                        novoUsuario.save().then(()=>{
                            req.flash("success_msg", "Salvo com sucesso")
                            res.redirect("/usuarios/login")
                        }).catch((err)=>{
                            req.flash("error"," Erro so criar o perfil, chama o salsicha")
                            res.redirect("/")

                        })
                    })
                })

            }
        }).catch((err)=>{
            req.flash("error","Chama o salsicha pra consertar")
            res.redirect("/")
        })
    }
})

//Login
router.get("/login",(req,res)=>{
    res.render("usuarios/login")
})
//Autenticaçao do login
router.post("/login",(req,res,next)=>{
passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/usuarios/login",
    failureFlash:true

})
(req,res,next)



})


//sair do perfil
router.get("/logout",(req,res)=>{
    req.session.cart = null;
    req.logout()
    req.flash("success_msg","Bye Bye")
    res.redirect("/")
})








module.exports = router