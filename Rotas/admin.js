const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../Model/Produto')
const Produto = mongoose.model("Produto")
const {eAdmin} =require("../helpers/eAdmin")

//pagina principal do admin 
router.get('/compras',eAdmin, (req, res)=>{        
    res.render("admin/index")
})
//Salva um produto no banco de dados
router.post('/compras/add',eAdmin,(req,res)=>{
    
  const novoProduto ={
      img:req.body.img,
      title:req.body.title,
      quantidade:req.body.qtd,
      price: req.body.price
      
  }
  
    new Produto(novoProduto).save().then(()=>{
        
        console.log("Salvo")

    }).catch((erro)=>{
        console.log("Erro ao salvar "+ erro)
    }) 
    req.flash("success_msg", "Produto Salvo")
    res.redirect("/admin/compras")
})
//Edita um produto no banco 
router.get("/edit/:id",eAdmin, (req, res)=>{
    Produto.findOne({_id:req.params.id}).then((produto)=>{
    res.render("admin/editar", {produto:produto})
    }).catch((err)=>{
        req.flash("error_msg", "Não existe esse produto")
        res.redirect("/")
    })
})

//Salva sua ediçao do produto no banco de dados
router.post("/edita",eAdmin,(req,res)=>{
    Produto.findOne({_id: req.body.id }).then((produto)=>{
        produto.img = req.body.img
        produto.title =req.body.title
        produto.quantidade =req.body.qtd
        produto.price = req.body.price

        produto.save().then(()=>{
            req.flash("success_msg", "Produto editado")
            res.redirect("/admin/remove")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao editar o Produto"+ err)
        res.redirect("/")
    })
})

//abre a pag onde pode editar e remover
router.get("/remove", eAdmin,(req,res)=>{
    Produto.find().then((produto)=>{
        var produtoChunk = []
        var chunkSize = 3;
     
        
        for(var i=0; i<produto.length;i+=chunkSize ){
            produtoChunk.push(produto.slice(i, i+chunkSize));
        }
        res.render("admin/remover",{produto:produtoChunk})
    })
})

//remove um produto do banco de dados
router.post("/delet",(req,res)=>{
    Produto.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Produto deletado")
        res.redirect("/")
    })
})


module.exports = router
