import User from "../models/models.js";

export const createUser = async (req, res) =>{
    try{
        const user = await User.create(req.body);
        res.json(user);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

export const getUsers = async (req, res) =>{
    try{
        const users = await User.find();
        res.json(users);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};