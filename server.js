var express = require('express');
var engines = require('consolidate');
var sessions = require('express-session')
var bodyparser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

var session;

app.use(sessions({
	secret : 'fdf87wye1iehiw2ew8973g',
	resave : false,
	saveUninitialized:true
}))


app.engine('html',engines.nunjucks);
app.set('view engine','html');
app.set('views',__dirname + '/views');

app.get('/viewpls',function(req,res){
mongo.connect('mongodb://127.0.0.1:27017/polls',function(err,db){
    db.collection('polls').find().toArray(function(err,docs){
        if(err){
            console.log(err);
        }
        
            res.send(docs);
        })
    })
    
    db.close();
});
app.get('/',function(req,res){
mongo.connect('mongodb://127.0.0.1:27017/polls',function(err,db){
    db.collection('polls').find().toArray(function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{here:docs});
        }
        })
    db.close();
    })
    
});

app.get('/login',function(req,res){
    console.log('in Login '+ req.session.uni);
    if(req.session.uni){
        res.redirect('/');
    }
    
    else{
        res.render('login');
    }
})


app.get('/logout',function(req,res){
    req.session.destroy(function(err){
		res.redirect('/login');
	})
})

app.post('/auth',function(req,res){
    
    mongo.connect('mongodb://127.0.0.1:27017/users',function(err,db){
        var user = req.body.uname;
        var pass = req.body.pwd;
        db.collection('users').find({'users':user}).toArray(function(err,docs){
            if(err){
                console.log(err);
            }
            
            else{
                    if(docs.length == 0){
                        res.redirect('/login');
                    }    
                
                    else if(user == docs[0].users && pass ==docs[0].passs){
                        req.session.uni = user;
                        //console.log('Assignment '+req.session.uni);
                        res.redirect('/profile');
                    //console.log('success');
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

 app.get('/profile',function(req,res){
        if(req.session.uni){
            res.render('admin',{title: req.session.uni});
        }
        else{
            res.redirect('/login');
        }
});

app.get('/add',function(req,res){
    if(req.session.uni){
        res.render('poll');
    }
});

app.post('/add',function(req,res){
    var len;
    var opt = [];
   var poll = req.body.ques;
        var x = req.body.o1;
        console.log(x);
        opt.push(x);
    var x = req.body.o2;
    opt.push(x);
    var x = req.body.o3;
    opt.push(x);
    var x = req.body.o4;
    opt.push(x);
    
     mongo.connect('mongodb://127.0.0.1:27017/polls',function(err,db){
            if(err){
                console.log(err);
            }

            else{
                    len = Math.random()*1000;
                    len = Math.floor(len);
                     db.collection('polls').insertOne({'_id':len,'ques':poll,'opts':opt});
                    console.log('inserted',{'_id':len,'ques':poll,'opts':opt});
                    console.log('After insert');
                res.redirect('/');
                
            }
         db.close();
     });
});
    

    app.get('/poll/:no',function(req,res){
        var id = req.params.no;
        id = parseInt(id);
        //console.log('id',id);
        mongo.connect('mongodb://127.0.0.1:27017/polls',function(err,db){
            db.collection('polls').find({'_id':id}).toArray(function(err,docs){
               // console.log(docs);
                res.render('viewpoll',{here:docs});
            })
            db.close();
        })
    })

    app.post('/vote',function(req,res){
        var b = req.body.btn;
        var q = req.body.ques;
        console.log(b,q);
         mongo.connect('mongodb://127.0.0.1:27017/polls',function(err,db){
            // db.collection('polls').insertOne()
             db.close();
         });
    })
    
app.listen(1337,function(){
    console.log('Listening to 1337');
})