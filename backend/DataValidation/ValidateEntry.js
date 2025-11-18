import {ZodError} from "zod";

//to validate url params//
export const validateParams = (schema) => (req,res,next) =>{
    try{
        req.params = schema.parse(req.params);
        next();
    }catch (error){
        return res.status(400).json({errors: error.errors});
    }
};

export const validateQuery = (schema) => (req,res,next) =>{
    try{
        req.query = schema.parse(req.query);
        next();
    }catch(error){
        return res.status(400).json({errors: error.errors});
    }
};

export const validate = (schema) => (req,res,next)=>{
    try{
        req.body = schema.parse(req.body);
        next();
    }catch(error){
        res.status(400).json({errors: error.errors});
    }
};