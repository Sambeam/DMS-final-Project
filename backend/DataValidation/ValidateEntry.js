import {ZodError} from "zod";

//to validate url params//
export const validateParams = (schema) => (res,req,next) =>{
    try{
        req.params = schema.parse(req.params);
        next();
    }catch (error){
        return res.status(400).json({errors: error.errors});
    }
};

export const validateQuery = (schema) => (res,req,next) =>{
    try{
        req.query = schema.parse(req.query);
        next();
    }catch(error){
        return res.status(400).json({errors: error.errors});
    }
};

export const validate = (schema) => (res,req,next)=>{
    try{
        req.body = schema.parse(req.body);
        next();
    }catch(error){
        res.status(400).json({errors: error.errors});
    }
};