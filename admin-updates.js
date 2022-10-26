const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db'
    },
    useNullAsDefault: true
});

const app = express();

app.use(express.static("public"));
app.use(express.static("audios"));
app.set("view engine","ejs");


router.use(function timeLog(req,res,next){
    console.log('Time:', Date.now());
    next();
});


router.get('/admin/:id/songupdate',function(req,res){
        
    var adminId = req.params.id;
    knex('movie')
        .select('*')
        .then((row2)=>
            knex('genre')
                .select('*')
                .then((row3) =>
                    knex('artist')
                        .select('*')
                        .then((row4) =>
                            res.render('admin-panel/admin-add',{movie: row2,genre: row3,artist: row4,id: adminId})

                        )

                )
        )


});

router.post('/admin/:id/songupdate',function(req,res){
var id = req.params.id;
var form = new formidable.IncomingForm;
var uploadFolder = path.join(__dirname,'public','audios')
form.uploadDir = uploadFolder;
var imgFolder = path.join(__dirname,'public','images','song-images')
form.options.multiples = true;
console.log(form);
form.parse(req,function(err,fields,files){
    console.log(files);
    var file = files.musicFIle.size;

    var songName = fields.songName;
    var movieId = fields.movieName;
    var genreId = fields.genreName;
    var artistId = fields.artistName;

    knex.insert({
        song_name: songName,
        movie_id: movieId,
        genre_id: genreId,
        artist_id: artistId
    })
        .into('songs')
        .then();

    knex('songs').max('id', {as: 'id'})
        .then((item) => {
            var ext = path.extname(files.musicFIle.originalFilename);
            var fileName = item[0].id + ext;
            var file = files.musicFIle;

            console.log(fileName);
            var newName =  path.join(uploadFolder,fileName);

            fs.renameSync(file.filepath,newName,function(err){
                if(err){
                    console.log(err);
                }
            });

            var ext = path.extname(files.imageFile.originalFilename);
            var imagefileName = item[0].id + ext;
            var imgfile = files.imageFile
            var newImageName = path.join(imgFolder,imagefileName)

            fs.renameSync(imgfile.filepath,newImageName,function(err){
                if(err){
                    console.log(err);
                }
            })

            knex('songs')
                .where('id',item[0].id)
                .update('file_path',fileName)
                .update('image_path',imagefileName)
                .then()
        })    
        res.redirect(`/admin/${id}/index`)
});
});

router.get('/admin/:id/subscriptionsupdate',function(req,res){
    var adminId = req.params.id;

    knex('PremiumPlans')
    .join('PremiumAccounts','PremiumPlans.id','=','PremiumAccounts.plan')
    .select(knex.raw('PremiumPlans.id,PremiumPlans.name,PremiumPlans.validity,PremiumPlans.amount,count(PremiumAccounts.plan) as count'))
    .groupBy('PremiumAccounts.plan')
    .then((plans) => {
        res.render('admin-panel/subscriptions',{plans: plans, admin: adminId});

    })

});

router.get('/admin/:id/subscriptionsupdate/graphdata',function(req,res){
    var adminId = req.params.id;

    knex('PremiumPlans')
    .join('users','users.current_plan','=','PremiumPlans.id')
    .select(knex.raw('PremiumPlans.name, count(users.id) as count'))
    .groupBy('users.current_plan')
    .then((data) => {
        res.send({graphdata: data})
    })

});

router.post('/admin/:id/subscriptionsupdate',function(req,res){
    var adminId = req.params.id;

    var form = new formidable.IncomingForm;

    form.parse(req,function(err,fields,files){
        var len = Object.keys(fields).length;
        var keys = Object.keys(fields);
        var values = Object.values(fields);
        console.log(fields);
        console.log(keys);
        console.log(values);
        console.log(len);
        var a = keys[len-1]

        for(var i = parseInt(keys[0]); i<=a; i++){
            knex('PremiumPlans')
            .update('amount',fields[i])
            .where('id',i)
            .then()
        }

    res.redirect(`/admin/${adminId}/subscriptionsupdate`);

    });
});

router.get('/admin/:id/plan/update',function(req,res){
    var adminId = req.params.id;

});

router.get('/admin/:id/update/add/movie',function(req,res){
var requestId = req.params.id;
var adminId = req.params.admin;
res.render('add-element',{element:'Movie',id: requestId,path:'update',admin: adminId});
});

router.post('/admin/:id/update/add/movie',function(req,res){
var form = new formidable.IncomingForm;
var requestId = req.params.id;
form.parse(req,function(err,fields,files){
    let movieName = fields.element;

    knex.insert({
        name: movieName
    })
    .into('movie')
    .then(
        res.redirect(`/admin/${requestId}/update`)
    );
});
});

router.get('/admin/:id/update/add/genre',function(req,res){
requestId = req.params.id;
res.render('add-element',{element:'genre',id: requestId,path:'update'});
});

router.post('/admin/:id/update/add/genre',function(req,res){
var form = new formidable.IncomingForm;
var requestId = req.params.id;
form.parse(req,function(err,fields,files){
    let genreName = fields.element;

    knex.insert({
        name: genreName
    })
    .into('genre')
    .then(
        res.redirect(`/admin/${requestId}/update`)
    );
});
});

router.get('/admin/:id/update/add/artist',function(req,res){
requestId = req.params.id;
res.render('add-element',{element:'artist',id: requestId,path:'update'});
});

router.post('/admin/:id/update/add/artist',function(req,res){
var form = new formidable.IncomingForm;
var requestId = req.params.id;
form.parse(req,function(err,fields,files){
    let artistName = fields.element;

    knex.insert({
        name: artistName
    })
    .into('artist')
    .then(
        res.redirect(`/admin/${requestId}/update`)
    );
});
});

module.exports = router;