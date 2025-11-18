//this script is made to compare prehashed and hashed password value//

import bcrypt from "bcrypt";
import * as Models from "../models/models.js";
import{  err_500 } from "../controllers/ModelController.js";

export const loginAttempt = async (req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await Models.User.findOne({email});
        if (!user) {
            console.log("no user found");
            return res.status(400).json({ error: "User not found" });
        }
        const match = await bcrypt.compare(password,user.pswd_hash);
        if(!match) return res.status(401).json({error: "Wrong Password"});
        res.json(user);
    }catch(error){
        err_500(res,error);
    }
};