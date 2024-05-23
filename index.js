const port=5000;
const express=require('express');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const multer=require('multer');
const authRouter=require('./routes/auth'); 

const app=express();
const formData=multer();

app.set('view engine','ejs'); // setting the themplate engine to ejs 

app.use(formData.array()); // to deal with form data 
app.use(bodyParser.urlencoded({extended:true})); // to parse url and json data from req body 
app.use(bodyParser.json());
app.use(cookieParser());  // to deal with cookies 

app.use(express.static('public')); // make public folder accessible as public 
app.use('/auth',authRouter); // all auth routes will be handled by authRoutet 

app.get('/',(req,res)=>{
	 res.redirect('/auth/signin');
})

app.get('*',(req,res)=>{
	 res.redirect('/notfound.html');
})


app.listen(port,()=>{
	 console.log(`properAuthApp server is up at ${port}`);
})
