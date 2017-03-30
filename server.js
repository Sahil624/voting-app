var express = require('express');
var engines = require('consolidate');
var session = require('express-session')
var bodyparser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret : 'secretkey',
    resave : true,
    saveUninitialized : true
}))

var session;

app.engine('html',engines.nunjucks);
app.set('view engine','html');
app.set('views',__dirname + '/views');

mongo.connect('mongodb://127.0.0.1:27017',function(err,db){
    if(err){
        console.log(err);
    }
    app.get('/',function(req,res){
        res.render('index',{here:'polls'});
    });
db.close();
});

app.get('/login',function(req,res){
    console.log(session.uid);
    if(session.uid){
        res.redirect('/');
    }
    
    else{
        res.render('login');
    }
})


app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        session.uid = '';
		res.redirect('/login');
	})
})

app.post('/auth',function(req,res){
    session = req.session;
    mongo.connect('mongodb://127.0.0.1:27017/users',function(err,db){
        var user = req.body.uname;
        var pass = req.body.pwd;
        db.collection('users').find({'users':user}).toArray(function(err,docs){
            if(err){
                console.log(err);
            }
            
            else{
                    if(user == docs[0].users && pass ==docs[0].passs){
                        res.redirect('/');
                        session.uid = user;
                    console.log('success');
                    }
                    else{
                        console.log('No user');
                    }
            }
        });
        db.close();
    })
});
    app.get('/register',function(req,res){
        res.render('register');
    });
    
    app.post('/register',function(req,res){
        mongo.connect('mongodb://127.0.0.1:27017/users',function(err,db){
   
        var user = req.body.uname;
        var pass = req.body.pwd;
        var obj = {'users':user,'passs':pass};
        db.collection('users').insertOne(obj);
        res.redirect('/login');
        db.close(); 
    });
});  

mongo.connect('mongodb://127.0.0.1:27017/users',function(err,db){
    db.collection('users').find().toArray(function(err,docs){
        if(err){
            console.log(err);
        }
        app.get('/view',function(req,res){
            res.send(docs);
        })
    })
    
    db.close();
});

app.get('/admin',function(req,res){
    if(session.uid){
        res.send('Admin');
    }
    
    else{
        res.redirect('/');
    }
})

 app.get('/profile',function(req,res){
        if(session.uid){
            res.render('admin',{title: session.uid});
        }
        else{
            res.redirect('/login');
        }
    })

app.listen(1337,function(){
    console.log('Listening to 1337');
})