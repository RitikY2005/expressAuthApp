const express=require('express');
const mongoose=require('mongoose');


// connect mongodb
mongoose.connect("mongodb://127.0.0.1:27017/properAuthAppDatabase")
.then(()=>{console.log(`connected to mongodb database`)})
.catch(err=>{console.log(`error in connecting to mongod`,err)}); 

// define schema

const userSchema=mongoose.Schema({
	uname:String,
	uemail:String ,  
	upassword:String 
});

// define a model (which is actually collection in mongodb)

const userModel=mongoose.model('userInformation',userSchema);

// export this model 

module.exports=userModel;