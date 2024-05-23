const express=require('express');
const authRouter=express.Router();
const userModel=require('../db/db');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const secret="this123randomsecret#@&68293827348627846....09029892";
const saltRounds=10;


//handling signin auth/signin route 

authRouter.get('/signin',(req,res)=>{
	 res.render('signin',{message: " "});
}).post('/signin',(req,res)=>{
    
    const userInfo=req.body;
    console.log(`user info received is - `,userInfo);
      // check if user has entered all fields
     if(!userInfo.uname || !userInfo.uemail || !userInfo.upassword) {
     	 return res.render('signin',{message:"Invalid credentials -> fill out all fields ."});
     }
      

    

     // check if user is already registered 
        // fetch his matching info from db
     userModel.findOne({uemail:userInfo.uemail},{uemail:true})
     .then(async (result)=>{
         
          // check if it is already present in the db 
       console.log('result from database in signin - ',result);   
      if(result){
      	return  res.render('signin',{message:"user already exits -> try logging in "});
      } else{
      	   // create a new user 
               // first hash his password 
                     const hashedPassword=await bcrypt.hash(userInfo.upassword,saltRounds); 
                     console.log(`hased password in signin - ${hashedPassword}`); 
            
            const newUser=new userModel({
          	uname:userInfo.uname,
          	uemail:userInfo.uemail,
          	upassword:hashedPassword
             });

            // save this new user in database 

            newUser.save().then(()=>{
            	 console.log(`new user saved in database`);
            }).catch(err=>{
            	 console.log(`error in saving new user `, err);
            });
            
            // create a jwt token and add it in cookie 
            const token = jwt.sign({uname:userInfo.uname,uemail:userInfo.uemail},secret ,{expiresIn:'1h'});
           res.cookie('token',token,{httpOnly:true,secure:true});
           res.cookie('uname',userInfo.uname);  
           return res.redirect('/auth/userpage');

      }
     });



});


authRouter.get('/login',(req,res)=>{
    res.render('login',{message:" "});
}).post('/login', (req,res)=>{
       // check if all fields are entered 
       const userInfo=req.body;

        if(!userInfo.uemail || !userInfo.upassword){
          return res.render('login',{message:" Invalid credentials-> Enter all fields"});
        }
     


      // check if user is registered 
        userModel.findOne({uemail:userInfo.uemail}).then(async (result)=>{
               // user is not found , don;t proceed
              if(!result){
                return res.render('login',{message:"User not found -> try signing in "});
              }

              // if user is present , verify his credentials 

                 

                 if(result.uemail==userInfo.uemail && await  bcrypt.compare(userInfo.upassword,result.upassword)){
                       console.log(`user is logged in -`,result);
                     const token = jwt.sign({uname:userInfo.uname,uemail:userInfo.uemail},secret ,{expiresIn:'1h'});
                     res.cookie('token',token,{httpOnly:true,secure:true});
                     res.cookie('uname',result.uname,{httpOnly:true,secure:true});  
                     return   res.redirect('/auth/userpage');
                 } else{
                   console.log('invalid credentials ');
                   return res.render('login',{message:"Invalid Credentials->Try again"});
                 }
        })

});


function checkUserAccesss(req,res,next){
    if(!req.cookies.token){
       const err=new Error('unauthorised access');
       next(err);
    }else{
       next();
    }

    

}

authRouter.get('/userpage',checkUserAccesss,(req,res)=>{
     // access granted to user 
     res.render('user',{name:req.cookies.uname});
});

//logout

authRouter.post('/logout',(req,res)=>{
    res.clearCookie('token');
    res.clearCookie('uname');
    res.render('login',{message:"You were logged out -> Login again"})
})


//error handling middleware

authRouter.use((err,req,res,next)=>{
    if(err){
       console.log(`error - unauthorised access `,err);
       return res.send('unauthorised');
    }
});


module.exports=authRouter;