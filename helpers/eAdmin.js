module.exports={
    eAdmin : function(req , res, next){
        if(req.isAuthenticated() && req.user.eAdmin ==true){
            return next();
        }
        req.flash("error_msg", "Você não tem permissão para fazer isso")
        res.redirect("/")
    }
}