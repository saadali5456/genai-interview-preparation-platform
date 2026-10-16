const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next){
    console.log("AUTH MIDDLEWARE REACHED");

    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted){
        return res.status(401).json({
            message: "token is invalid"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        console.log("AUTH SUCCESS", decoded);
        next()
    }
    catch (err)
    {
        return res.status(401).json({
            message : "Invalid token."
        })
    }
   const decoded = jwt.verify(token, process.env.JWT_SECRET)

}
module.exports = { authUser }