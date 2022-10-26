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

router.get('/admin/:admin/elements',function(req,res){
    var adminId = req.params.admin;
    knex('movie')
        .select('*')
        .then((row1) => 
            knex('genre')
                .select('*')
                .then((row2) => 
                    knex('artist')
                        .select('*')
                        .then((row3) => 

                           res.render('admin-panel/elements',{movie: row1, genre: row2, artist: row3,admin: adminId})

                        )
                )
        )
});

router.get('/admin/:admin/elements/movie/:id/delete',function(req,res){
    var id = req.params.id;
    var adminId = req.params.admin;

    knex('movie')
        .where('id',id)
        .del()
        .then(
            res.redirect(`/admin/${adminId}/elements`)
        );
});

router.get('/admin/:admin/elements/genre/:id/delete',function(req,res){
    var id = req.params.id;
    var adminId = req.params.admin;


    knex('genre')
        .where('id',id)
        .del()
        .then(
            res.redirect(`/admin/${adminId}/elements`)
        );
});

router.get('/admin/:admin/elements/artist/:id/delete',function(req,res){
    var id = req.params.id;
    var adminId = req.params.admin;

    knex('artist')
        .where('id',id)
        .del()
        .then(
            res.redirect(`/admin/${adminId}/elements`)
        );
});

router.get('/admin/:admin/elements/movie/add',function(req,res){
    var adminId = req.params.admin;
    res.render('adding-new-elements',{element:'movie',admin: adminId})
});

router.post('/admin/:admin/elements/movie/add',function(req,res){
    var adminId = req.params.admin;
    var form = new formidable.IncomingForm;
    imageFolder = path.join(__dirname,'public','images','movies')
    form.uploadDir = imageFolder;
    
    form.parse(req,function(err,fields,files){
        var movieName = fields.element;

        knex.insert({
            name: movieName
        }).into('movie')
        .then()

        knex('movie').max('id', {as: 'id'})
        .then((item) => {
            var ext = path.extname(files.image.originalFilename);
            var fileName = item[0].id + ext;
            var file = files.image;

            console.log(fileName);
            var newName =  path.join(imageFolder,fileName);

            fs.renameSync(file.filepath,newName,function(err){
                if(err){
                    console.log(err);
                }
            });

            knex('movie')
                .where('id',item[0].id)
                .update('image_path',fileName)
                .then()
        })    
        res.redirect(`/admin/${adminId}/elements`)
});
});

router.get('/admin/:admin/elements/artist/add',function(req,res){
    var adminId = req.params.admin;

    res.render('adding-new-elements',{element:'artist',admin: adminId})
});

router.post('/admin/:admin/elements/artist/add',function(req,res){
    var adminId = req.params.admin;
    var form = new formidable.IncomingForm;
    imageFolder = path.join(__dirname,'public','images','artists')
    form.uploadDir = imageFolder;
    
    form.parse(req,function(err,fields,files){
        var movieName = fields.element;

        knex.insert({
            name: movieName
        }).into('artist')
        .then()

        knex('artist').max('id', {as: 'id'})
        .then((item) => {
            var ext = path.extname(files.image.originalFilename);
            var fileName = item[0].id + ext;
            var file = files.image;

            console.log(fileName);
            var newName =  path.join(imageFolder,fileName);

            fs.renameSync(file.filepath,newName,function(err){
                if(err){
                    console.log(err);
                }
            });

            knex('artist')
                .where('id',item[0].id)
                .update('image_path',fileName)
                .then()
        })    
        res.redirect(`/admin/${adminId}/elements`)
});
});

router.get('/admin/:admin/elements/genre/add',function(req,res){
    var admin = req.params.admin;
    res.render('adding-new-elements',{element:'genre',admin: adminId})
});

router.post('/admin/:admin/elements/genre/add',function(req,res){
    var adminId = req.params.admin;

    var form = new formidable.IncomingForm;
    imageFolder = path.join(__dirname,'public','images','genres')
    form.uploadDir = imageFolder;
    
    form.parse(req,function(err,fields,files){
        var genreName = fields.element;

        knex.insert({
            name: genreName
        }).into('genre')
        .then()

        knex('genre').max('id', {as: 'id'})
        .then((item) => {
            var ext = path.extname(files.image.originalFilename);
            var fileName = item[0].id + ext;
            var file = files.image;

            console.log(fileName);
            var newName =  path.join(imageFolder,fileName);

            fs.renameSync(file.filepath,newName,function(err){
                if(err){
                    console.log(err);
                }
            });

            knex('genre')
                .where('id',item[0].id)
                .update('image_path',fileName)
                .then()
        })    
        res.redirect(`/admin/${adminId}/elements`)
});
});


module.exports = router;