var express = require('express');
var engines = require('consolidate');
var sessions = require('express-session');
var bodyparser = require('body-parser');
var mongo = require('mongodb').MongoClient;

var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

// Javascript files
app.use('/js', express.static(__dirname+'/assets/js'));

// CSS files
app.use('/css', express.static(__dirname+'/assets/css'));

var urlpls = 'mongodb://Sahil624:Sahil1997@ds147480.mlab.com:47480/votingfccapp'
var session;

app.use(sessions({
	secret : 'fdf87wye1iehiw2ew8973g',
	resave : false,
	saveUninitialized:true
}))

var logged = 'Login/SignUp';

app.engine('html',engines.nunjucks);
app.set('view engine','html');
app.set('views',__dirname + '/views');

app.get('/viewpls',function(req,res){
    mongo.connect(urlpls,function(err,db){
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
mongo.connect(urlpls,function(err,db){
    db.collection('polls').find().toArray(function(err,docs){
        if(err){
            console.log(err);
        }
        else{                   
            res.render('index',{here:docs,status:logged});
        }
        })
    db.close();
    })
    
});

app.get('/login',function(req,res){
   // console.log('in Login '+ req.session.uni);
    if(req.session.uni){
        res.redirect('/profile');
    }
    
    else{
        res.render('login');
    }
})


app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        logged = 'Login/SignUp';
		res.redirect('/login');
	})
})

app.post('/auth',function(req,res){
    
    mongo.connect(urlpls,function(err,db){
        var user = req.body.uname;
        var pass = req.body.pwd;
        if(err){
            console.log(err);
        }
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
                        logged = req.session.uni;
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
        mongo.connect(urlpls,function(err,db){
   
        var user = req.body.uname;
        var pass = req.body.pwd;
        var obj = {'users':user,'passs':pass};
        db.collection('users').insertOne(obj);
        res.redirect('/login');
        db.close(); 
    });
});  

app.get('/view',function(req,res){
mongo.connect(urlpls,function(err,db){
    if(err){
        console.log(err);
    }
    db.collection('users').find().toArray(function(err,docs){
        if(err){
            console.log(err);
            db.close();
        }
            res.send(docs);
        db.close();
        })
    })
});

 app.get('/profile',function(req,res){
        if(req.session.uni){
            
            mongo.connect(urlpls,function(err,db){
                db.collection('polls').find({owner:req.session.uni}).toArray(function(err,docs){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render('admin',{title: req.session.uni,here:docs});
                        //res.render('index',{here:docs});
                    }
                    })
                db.close();
            })
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
        //console.log(x);
        opt.push(x);
    var x = req.body.o2;
    opt.push(x);
    var x = req.body.o3;
    opt.push(x);
    var x = req.body.o4;
    opt.push(x);
    
    var vt = [0,0,0,0];
    //mongodb://127.0.0.1:27017
     mongo.connect(urlpls,function(err,db){
            if(err){
                console.log(err);
            }

            else{
                    len = Math.random()*1000;
                    len = Math.floor(len);
                    var ans = [];
                     db.collection('polls').insertOne({'_id':len,'owner':req.session.uni,'ques':poll,'opts':opt,'votes':vt,'answers':ans});
                   // console.log('inserted',{'_id':len,'ques':poll,'opts':opt,'votes':vt});
                    //console.log('After insert');
                res.redirect('/');
                
            }
         db.close();
     });
});
    

    app.get('/poll/:no',function(req,res){
        var id = req.params.no;
        id = parseInt(id);
        //console.log('id',id);
        mongo.connect(urlpls,function(err,db){
            db.collection('polls').find({'_id':id}).toArray(function(err,docs){
                
                var arr = docs[0].answers;
                var result = {};
                
                 for(var i = 0; i < arr.length; ++i) {
                    if(!result[arr[i]])
                        result[arr[i]] = 0;
                    ++result[arr[i]];
                }
                
                var rese = Object.keys(result).map(function(e) {
                  return [String(e), result[e]];
                });

                
                for(var i=0;i<rese.length;i++){
                    rese[i][0] = String(rese[i][0]);
                }
                
               // console.log(rese);
                res.render('viewpoll',{here:docs,no:id,res:rese});
            })
            db.close();
        });
    });

    app.post('/vote/:no',function(req,res){
        var b = req.body.btn;
        var id = req.params.no;
        var data;
        id = parseInt(id);
        //console.log(b,id);
         mongo.connect(urlpls,function(err,db){
             db.collection('polls').find({'_id':id}).toArray(function(err,docs){
                 var pos = docs[0].opts.indexOf(b);
                 data = docs;
             })
             //pos--;
             //data.opts[pos]++;
             db.collection('polls').updateOne({'_id':id},{$push:{'answers':b}},function(err,result){
                 if(err){
                     console.log(err);
                 }
                 
                 else{
                    // console.log(result);
                     var url = '/poll/'+id;
                     res.redirect(url);
                 }
             });
             db.close();
         });
    });

    app.get('/delete/:no',function(req,res){
        if(req.session.uni){
            var a = req.params.no;
                 mongo.connect(urlpls,function(err,db){
                     db.collection('polls').removeOne({_id:a});
                     res.redirect('/profile');
                 });
        }
        
        else{
            res.redirect('/login');
        }
    })


app.listen(process.env.PORT || 1337,function(){
    console.log('Listening to 1337');
})