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

var adminId = [];

router.get('/admin',function(req,res){
    res.render('login',{path: 'admin'});
});

router.post('/admin',function(req,res){
    var form = new formidable.IncomingForm;

    form.parse(req,function(err,fields,files){
        var id = fields.id;
        var password = fields.password;
        console.log(fields);

        knex('admin')
            .select('*')
            .then((rows) => {
                rows.forEach(function(row1){
                    // console.log(row);

                    if(row1.id === parseInt(id) && row1.password == password){
                        // console.log(row1.id)
                        adminId.push(row1.id)

                       res.redirect(`/admin/${id}/userinteractions  `)
                    }  

                })
            })
    });
});

router.get('/admin/:admin/userinteractions',function(req,res){
    var adminId = req.params.admin;
    res.render('admin-panel/user-interactions',{admin: adminId});
});

router.get('/admin/:admin/requests',function(req,res){
    var id = req.params.admin;
    knex('request')
        .select('*')
        .where('status','pending')
        .orderBy('id','desc')
        .then((row) => {
            console.log(adminId[adminId.length - 1])
            res.render("admin-panel/admin-requests",{request: row,admin: id})
            
        })
});

router.get('/admin/:admin/dashboard',function(req,res){
    var adminId = req.params.admin;

    var today = new Date();
    var date = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear();
    var day = year + '-' + month+ '-' + date
    console.log(day);

    knex('admin')
    .select('*')
    .where('id',adminId)
    .then((admin) =>{
        knex('users')
        .select(knex.raw('count(*) as count'))
        .where(knex.raw('date(created_at)'),day)
        .then((uCount) => {

            knex('request')
            .select(knex.raw('count(*) as count'))
            .where('status','pending')
            .then((rCount) => {

                knex('PremiumAccounts')
                .select(knex.raw('sum(paid) as amount'))
                .where(knex.raw('date(rcDate)'),day)
                .then((sCount) => {
                    console.log(sCount);

                        var revenue = 0;
                    
                        if(sCount[0].amount != null){
                            revenue = sCount[0].amount;
                        }
                        console.log(revenue);

                    res.render('admin-panel/dashboard',{admin:adminId, adminDet: admin, userCount: uCount[0], requestCount: rCount[0], subcriptionsCount: revenue});

                })
            })
        })
    })

});

router.get('/admin/:admin/index/graph', function(req,res){

    var today = new Date();

    today.setDate(today.getDate() - 10)

    var date = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear()
    var day = year + '-' + month+ '-' + date
    console.log(day);

    knex('users')
    .select(knex.raw('count(*) as users, date(created_at) as date'))
    .groupBy(knex.raw('date(created_at)'))
    .where(knex.raw('date(created_at)'), '>=', day)
    .then((date) => {

        let count = [];
        date.map(function(s) {
            if (count.length == 0) {
                count.push(s.users);
            } else {
                count.push(count[count.length - 1] + s.users)
            }
        });

        var dates = date.map((b) => b.date.slice(5))
        console.log(dates,count)
        res.send({users: count, date: dates});
    })

});

router.get('/admin/:admin/index/bargraph',function(req,res){
    knex('users')
    .select(knex.raw('count(*) as users, type'))
    .groupBy('type')
    .then((acountType) => {
        res.send({acountType: acountType});
    })
});

router.get('/admin/:admin/index/usercount',function(req,res){

    knex('users')
    .select(knex.raw('count(*) as users'))
    .then((users)=>{

        knex('users')
        .select(knex.raw('count(*) as activeUsers'))
        .where('status','logged in')
        .then((activeUsers) => {

            res.send({totalUsers: users, activeUsers: activeUsers})

        })

    })

});

router.get('/admin/:admin/data',function(req,res){
    var id = req.params.admin;
    knex('request')
        .select('*')
        .then((row) => {
            // console.log(adminId);
            console.log(adminId[adminId.length - 1])
            res.send({data: row});
            // adminId.length = 0
            
        })
});

router.get('/admin/:admin/:id/decline',function(req,res){
    var requestId = req.params.id;
    var admin = req.params.admin;
    console.log(requestId);
    knex('request')
        .where('id',requestId)
        .update('status','declined')
        .then(
            res.redirect(`/admin/${admin}/requests`)
        )
});

router.get('/admin/:admin/:id/approve',function(req,res){
    var requestId = req.params.id;
    var adminId = req.params.admin;
    knex('request')
        .select('song_name','movie_name')
        .where('id',requestId)
        .then((row1) => 
            knex('movie')
                .select('*')
                .then((row2)=>
                    knex('genre')
                        .select('*')
                        .then((row3) =>
                            knex('artist')
                                .select('*')
                                .then((row4) =>
                                    res.render('add-song',{oldData: row1[0],movie: row2,genre: row3,artist: row4,id: requestId,path:'approve',admin: adminId})

                                )

                        )
                )
        )
});

router.post('/admin/:admin/:id/approve',function(req,res){
    var requestid = req.params.id;
    var adminId = req.params.admin;
    var form = new formidable.IncomingForm;
    var uploadFolder = path.join(__dirname,'public','audios')
    form.uploadDir = uploadFolder;
    var imgFolder = path.join(__dirname,'public','images','song-images')
    form.options.multiples = true;
    console.log(form);
    // console.log(form);
    form.parse(req,function(err,fields,files){
    console.log(files);

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
                .then(                 
                
                    knex('request')
                    .update('status','approved')
                    .where('id',requestid)
                    .then()
                        
                )
        })    
        res.redirect(`/admin/${adminId}/requests`)
});
});

router.get('/admin/:admin/:id/approve/add/movie',function(req,res){
    requestId = req.params.id;
    adminId = req.params.admin;
    res.render('add-element',{element:'Movie',id: requestId,admin: adminId,path:'approve'});
});

router.post('/admin/:admin/:id/approve/add/movie',function(req,res){
    var form = new formidable.IncomingForm;
    var imageFolder = path.join(__dirname,'public','images','movies')
    form.uploadDir = imageFolder;
    
    var requestId = req.params.id;
    var adminId = req.params.admin;

    form.parse(req,function(err,fields,files){
        let movieName = fields.element;

        knex.insert({
            name: movieName
        })
        .into('movie')
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

        res.redirect(`/admin/${adminId}/${requestId}/approve`)

    });
});

router.get('/admin/:admin/:id/approve/add/genre',function(req,res){
    requestId = req.params.id;
    res.render('add-element',{element:'genre',id: requestId,path:'approve',admin: adminId});
});

router.post('/admin/:admin/:id/approve/add/genre',function(req,res){
    var form = new formidable.IncomingForm;
    imageFolder = path.join(__dirname,'public','images','genres')
    form.uploadDir = imageFolder;

    var requestId = req.params.id;
    form.parse(req,function(err,fields,files){
        let genreName = fields.element;

        knex.insert({
            name: genreName
        })
        .into('genre')
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

        res.redirect(`/admin/${adminId}/${requestId}/approve`)

    });
});

router.get('/admin/:admin/:id/approve/add/artist',function(req,res){
    requestId = req.params.id;
    adminId = req.params.admin;
    res.render('add-element',{element:'artist',id: requestId,admin: adminId,path:'approve'});
});

router.post('/admin/:admin/:id/approve/add/artist',function(req,res){
    var form = new formidable.IncomingForm;
    var requestId = req.params.id;
    imageFolder = path.join(__dirname,'public','images','artists')
    form.uploadDir = imageFolder;
    form.parse(req,function(err,fields,files){
        let artistName = fields.element;

        knex.insert({
            name: artistName
        })
        .into('artist')
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

        res.redirect(`/admin/${adminId}/${requestId}/approve`)

    });
});



module.exports = router;