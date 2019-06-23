const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../Model/Produto')
const Cart = require('../Model/Carrinho')
const Produto = mongoose.model("Produto")
const User = mongoose.model("usuarios")
const {eAdmin} =require("../helpers/eAdmin")
const CompraPP = require('../Model/CompraPP')
const CompraDNP = require('../Model/CompraDNP')
const CompraDp = require('../Model/CompraDP')
const CompraPPN = require('../Model/CompraPPN')




//renderiza a pag de produtos disponiveis
router.get("/pedido",(req,res)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{

    Produto.find().then((produto)=>{
        var produtoChunk = []
        var chunkSize = 3;
     
        
        for(var i=0; i<produto.length;i+=chunkSize ){
            produtoChunk.push(produto.slice(i, i+chunkSize));
        }
        res.render("beb/compra",{produto:produtoChunk})
    })
}
})
//adc um produto no carrinho
router.get('/carrinho/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Produto.findById(productId, function(err, produto) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(produto, produto.id);
        req.session.cart = cart;
       //console.log(req.session.cart);
       req.flash("adc_msg", "Adicionado") 
        res.redirect('/beb/pedido');
    });
});
//adc um produto no carrinho na pag do carrinho
router.get('/adc/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Produto.findById(productId, function(err, produto) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(produto, produto.id);
        req.session.cart = cart;
       console.log(req.session.cart);

        res.redirect('/beb/carrinho');
    });
});
//abre a pag do carrinho

router.get('/carrinho', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('beb/carrinho', {produto: null});
    } 
     var cart = new Cart(req.session.cart);
 
     res.render('beb/carrinho', {produto: cart.generateArray(), totalPrice: cart.totalPrice});
 });

 
 //reduz uma quantidade do carrinho
 router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/beb/carrinho');
    });
//remove o produto inteiro do carrinho
router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/beb/carrinho');
});
//salva o carrinho na forma de pagamento no picpay e reduz no estoque
router.get('/pagamentopp', (req, res)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    var cart = new Cart(req.session.cart);
    function formatDate(data) {
        var monthNames = [
          "Janeiro", "Fevereiro", "Março",
          "Abril", "Maio", "Junho", "Julho",
          "Agosto", "Setembro", "Outubro",
          "Novembro", "Dezembro"
        ];
      
        var day = data.getDate();
        var monthIndex = data.getMonth();
        var year = data.getFullYear();
      
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
      }
      console.log(formatDate(new Date())); 
      
     const comprappn = new CompraPPN({
         user:req.user.nome,
         cart:cart,
         data:formatDate(new Date)
     })
    
     console.log(comprappn)
     comprappn.save().then(()=>{
          //console.log(comprappn)
      })
    const comprapp = new CompraPP({
        user: req.user.nome,
        cart: cart,
        data:formatDate(new Date)
    })
    //console.log(comprapp)
    //Salva pedidos feito picpay
    comprapp.save().then(()=>{
      //  console.log(comprapp)
    })
    var items = req.session.cart.items;
    for (var key in items) {
    // var qt = items[key].qty
        //console.log(items[key].qty)
      //  console.log(items[key].item.quantidade)
       // console.log(items[key].item.quantidade -items[key].qty+ '\n');
        // ids.push(items[key].item._id)
        // up.push(items[key].item.quantidade -items[key].qty);      
    Produto.findOne({_id:items[key].item._id}).then((produto)=>{
        //   console.log(items[key].item._id
         produto.quantidade -= items[key].qty;
        produto.save().then(()=>{
            req.flash("success_msg", "Não esqueça de transeferir o dinheiro para @neppo.tecnologia pelo PicPay") 
            req.session.cart = null;
            res.redirect("/")
           }).catch((err)=>{
            req.flash("error_msg", "Erro    "+ err)
            res.redirect("/")
        })
     })
    
    }
}
})
      
  
//Mostra no ususario os pedidos q ele fez no historico
router.get('/historicopp', (req,res,next )=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    CompraPP.find({user:req.user.nome}).sort({data: "asc"}).then(( comprapp)=>{
        var cart;
        comprapp.forEach(function(comprapp) {
            cart = new Cart(comprapp.cart);
            comprapp.items = cart.generateArray();
        });
        res.render("beb/listapp", {comprapp :comprapp})
    })
}
})

//Salva no banco o carrinho de modo q va pagar em dinheiro 
router.get('/checkout', (req, res, next)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    var cart = new Cart(req.session.cart);
    function formatDate(data) {
        var monthNames = [
          "Janeiro", "Fevereiro", "Março",
          "Abril", "Maio", "Junho", "Julho",
          "Agosto", "Setembro", "Outubro",
          "Novembro", "Dezembro"
        ];
      
        var day = data.getDate();
        var monthIndex = data.getMonth();
        var year = data.getFullYear();
      
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
      }
      console.log(formatDate(new Date())); 
   const compraDp = new CompraDp({
    user: req.user.nome,
    cart: cart,
    data:formatDate(new Date)
   })
   compraDp.save().then(()=>{

   })
    const compraDNP = new CompraDNP({
      user: req.user.nome,
    cart: cart,
    data:formatDate(new Date)
    })
    //console.log(compraDNP)
    //Salva pedidos feito picpay
    compraDNP.save().then(()=>{
      //  console.log(comprapp)
    })
    var items = req.session.cart.items;
    for (var key in items) {
    // var qt = items[key].qty
        //console.log(items[key].qty)
      //  console.log(items[key].item.quantidade)
       // console.log(items[key].item.quantidade -items[key].qty+ '\n');
        // ids.push(items[key].item._id)
        // up.push(items[key].item.quantidade -items[key].qty);      
    Produto.findOne({_id:items[key].item._id}).then((produto)=>{
        //   console.log(items[key].item._id
         produto.quantidade -= items[key].qty;
        produto.save().then(()=>{
            req.flash("success_msg", "Não esqueça de entregar o dinheiro") 
            req.session.cart = null;
            res.redirect("/")
           }).catch((err)=>{
            req.flash("error_msg", "Erro    "+ err)
            res.redirect("/")
        })
     })
    
}
    }
})

//Mostra todos os pedidos no modo de pagamento em dinheiro pra quitar
router.get('/divida',eAdmin, (req, res, next)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    CompraDNP.find().sort({data:'desc'}).then((compraDnp)=>{
        var cart;
        compraDnp.forEach(function(compraDnp) {
            cart = new Cart(compraDnp.cart);
            compraDnp.items = cart.generateArray();
        });
        console.log(compraDnp)
      res.render("beb/listadnp",{compraDnp:compraDnp})
    //  console.log(compraDnp)
      
    })
}
})

//Quita quando o usuario paga pra admin no dinheiro sobre o carrinho eliminando o que esta no banco
 router.post("/quitar", (req, res, next)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    CompraDNP.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Quitado")
        res.redirect("/beb/divida")
    })
}
 })
//Quita quando o usuario paga no pipcay pra admin sobre o carrinho eliminando o que esta no banco
 router.post("/quitarpp", (req, res, next)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
    CompraPPN.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Quitado")
        res.redirect("/beb/dividapp")
    })
}
 })





//Mostr o historico de pedidos feito no modo picpay
router.get('/historicodd', (req,res, next)=>{
    if(req.user  == null){
        req.flash("error", "Você precisa estar logado")
        res.redirect("/")
    }else{
   CompraDp.find({user:req.user.nome}).sort({data:"asc"}).then((compradp)=>{
    var cart;
    compradp.forEach(function(compradp) {
        cart = new Cart(compradp.cart);
        compradp.items = cart.generateArray();
    });
       console.log(compradp)
       res.render("beb/listadd",{compraDp:compradp})
   })
      
}
})

//Renderiza a pag de dividas para serem quitadas
router.get('/dividapp',eAdmin, (req, res, next)=>{
    CompraPPN.find().sort({data:'desc'}).then((compraPPN)=>{
        var cart;
        compraPPN.forEach(function(compraPPN) {
            cart = new Cart(compraPPN.cart);
            compraPPN.items = cart.generateArray();

        });
   
      res.render("beb/listappn",{compraPPN:compraPPN})
    //  console.log(compraDnp)
      
    })
})

//req.session.cart = null;

router.get('/limpar',(req, res, next)=>{
    req.session.cart = null;
    res.redirect("/beb/carrinho")
})



/*
router.post("/pedidoadd",(req,res)=>{
var erros = []
if (!req.body) {
    return;
}
const { body } = req;

if(req.body.quantidade=="0"){
    erros.push({texto:"Selecione uma quatidade"})
}
if(req.user== null){
    erros.push({texto:"Precisa fazer o login"})
}

if(erros.length>0){
    req.flash("error_msg", "Precisa estar logado")
    res.redirect("/")

}else{
    console.log(body.pedido);
    Produto.findById(body.pedido).then((produto)=>{
        console.log(produto);
    const novoPedido={
        Nome:req.user,
        produto: body.pedido,
        quantidade: body.quantidade,
        total: body.quantidade * produto.preco  
    }


  console.log("Produto: ", produto, "Preço: ", produto.preco);
    
    new Pedido(novoPedido).save().then(()=>{
       
        req.flash("success_msg", "Pedido feito")
        res.redirect('/beb/pedido')
    })
})
}
})
/*
router.get("/lista", async (req,res)=>{
    const result = await Pedido.aggregate([  {
        '$lookup': {
            'from': 'usuarios', 
            'localField': 'Nome', 
            'foreignField': '_id', 
            'as': 'userName'
                 }
      },
      {
        '$lookup': {
            'from': 'produtos', 
            'localField': 'produto', 
            'foreignField': '_id', 
            'as': 'Produto'
                 }
      },  
      {
        '$unwind': '$userName'  
      },
      {
        '$unwind': '$Produto'  
      },  
      {
          '$addFields': {
              'Nome' : '$userName.nome',
              'Produto': '$Produto.bebida',
          }
      },
      {
          '$project': {
                '_id ' : 1,
                'Nome' : 1,
                'quantidade' : 1,
                'total' : 1,
                'Produto' : 1 ,
                'data': 1
          }
      }
    
    
    
    ]).exec( function (err, result) {
       
        
    
  // console.log(JSON.stringify(result, null, 2));
   res.render("beb/lista", { pedido: result });
    })
  

})*/

module.exports = router