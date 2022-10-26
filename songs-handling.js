const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { isUndefined } = require('util');
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

var filter = [];


router.use(function timeLog(req,res,next){
    console.log('Time:', Date.now());
    next();
});


router.get('/admin/:id/songlist',function(req,res){
    var adminId = req.params.id;
    knex('songs')
    .join('movie','songs.movie_id','=','movie.id')
    .select({
            id: 'songs.id',
            song: 'songs.song_name',
            movie: 'movie.name',
            movie_id: 'songs.movie_id'
        })
    .then((row1) => {
        knex('songs')
        .join('genre','songs.genre_id','=','genre.id')
        .select({
                name: 'genre.name'
                })
        .then((row2) => {
            knex('songs')
            .join('artist','songs.artist_id','=','artist.id')
            .select({
                name: 'artist.name'
            })
            .then((row3) => {
                knex('movie')
                .select('*')
                .then((movie)=> {
                    knex('genre')
                    .select('*')
                    .then((genre)=> {
                        knex('artist')
                        .select('*')
                        .then((artist) => {
                            res.render('admin-panel/song-list',{row: row1, genre: row2, artist: row3, admin: adminId, row4: movie, row5: genre, row6: artist});
                        })
                    })
                })


            })
         })
     })

});

router.get('/admin/:id/songlist/data',function(req,res){
    console.log(req.query);
     var adminId = req.params.id;
   
     knex('songs')
     .join('movie','songs.movie_id','=','movie.id')
     .join('genre','songs.genre_id','=','genre.id')
     .join('artist','songs.artist_id','artist.id')
     .select({
             id: 'songs.id',
             song: 'songs.song_name',
             movie: 'movie.name',
             artist: 'artist.name',
             genre: 'genre.name'
         })
     .then((row) => {
                             res.send({admin: adminId, songs: row});
                         })
 
})

router.post('/admin/:id/songlist',function(req,res){
    var form = new formidable.IncomingForm;
    form.parse(req,function(err,fields,files){
        console.log(fields);
        var movie = fields.movie;
        var genre = fields.genre;
        var artist = fields.artist;

        
        if(movie != undefined && genre != undefined && artist != undefined){
           knex('songs')
           .select('*')
           .where('movie_id',movie)
           .where('genre_id',genre)
           .where('artist_id',artist)
           .then((row) => {
               for(var i = 0 ; i < row.length ; i++){
                array(row[i].id);
               }

           })
           console.log(filter);

           function array(item){
                filter.push(item)
           }
        }
    });
});

router.get('/admin/:admin/song-list/:id/delete',function(req,res){
    var songId = req.params.id;
    var admin = req.params.admin;
    knex('songs')
        .where('id',songId)
        .del()
        .then(
            knex('songs')
                .select('*')
                .where('id',songId)
                .then((row)=>{
                    fs.unlink('public/audios/'+row[0].file_path,function(err){
                        if(err){
                            console.log(err)
                        }
                    })
                    fs.unlink('public/images/song-images'+row[0].image_path,function(err){
                        if(err){
                            console.log(err)
                        }
                    })
                    res.redirect(`/admin/${admin}/songlist`) 
                }
                )
           
        )
});

router.get('/admin/:admin/song-list/:id/modify',function(req,res){
    
    var songId = req.params.id;
    var adminId = req.params.admin;

    knex('songs')
    .select('*')
    .where('id',songId)
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
                                res.render('modify',{oldData: row1[0], movie: row2, genre: row3, artist: row4, id: songId, admin: adminId})

                            )

                    )
            )
    )
    
});

router.post('/admin/:admin/song-list/:id/modify',function(req,res){
    var form = new formidable.IncomingForm;
    var songId = req.params.id;
    var adminId = req.params.admin;

    var uploadFolder = path.join(__dirname,'public','audios')
    var imageFolder = path.join(__dirname,'public','images','song-images')
    form.uploadDir = uploadFolder;
    
    form.parse(req,function(err,fields,files){
        
        let songName = fields.songName;
        let movieId = fields.movieName;
        let genreId = fields.genreName;
        let artistId = fields.artistName;
        
        console.log(fields);
        console.log(files); 
        knex('songs')
            .where('id',songId)
            .update({
                song_name: songName,
                movie_id: movieId,
                genre_id: genreId,
                artist_id: artistId
            })
            .then(()=>{
                var file = files.musicFIle
                var imgFile = files.imageFile
                if(file.size === 0){
                    console.log('no file selected');
                }else if(imgFile.size === 0){
                    console.log('image file does not selected');
                }
                else{
                    knex('songs')
                    .select('*')
                    .where('id',songId)
                    .then((row) => {
                        

                        fs.unlink('audios/' + row[0].file_path,function(err){
                            if(err) {
                                console.log(err);
                            }else{
                                console.log('deleted');
                            }
                        });
                        fs.unlink('images/' + row[0].image_path,function(err){
                            if(err) {
                                console.log(err);
                            }else{
                                console.log('deleted');
                            }
                        });

                        var ext = path.extname(files.musicFIle.originalFilename);
                        var fileName = row[0].id + ext;
                        var file = files.musicFIle;
            
                        console.log(fileName);
                        var newName =  path.join(uploadFolder,fileName);
                        console.log(file.filepath);
            
                        fs.renameSync(file.filepath,newName,function(err){
                            if(err){
                                console.log(err);
                            }
                        });

                        var ext = path.extname(files.imageFile.originalFilename);
                        var imageFileName = row[0].id + ext;
                        var imgfile = files.imageFile;
            
                        console.log(fileName);
                        var imgNewName =  path.join(imageFolder,imageFileName);
                        console.log(imgfile.filepath);
            
                        fs.renameSync(imgfile.filepath,imgNewName,function(err){
                            if(err){
                                console.log(err);
                            }
                        });

                    })
                }
                        res.redirect(`/admin/${adminId}/songlist`)
            }

                
            )

    });
});

router.get('/admin/:admin/song-list/:id/modify/add/movie',function(req,res){
    songId = req.params.id;
    adminId = req.params.admin;
    res.render('add-element-modify',{element:'Movie',admin: adminId, id: songId});
});

router.post('/admin/:admin/song-list/:id/modify/add/movie',function(req,res){
    var form = new formidable.IncomingForm;
    var songId = req.params.id;
    var adminId = req.params.admin
    form.parse(req,function(err,fields,files){
        let movieName = fields.element;

        knex.insert({
            name: movieName
        })
        .into('movie')
        .then(
            res.redirect(`/admin/${adminId}/song-list/${songId}/modify`)
        );
    });
});

router.get('/admin/:admin/song-list/:id/modify/add/genre',function(req,res){
    songId = req.params.id;
    adminId = req.params.admin;
    res.render('add-element-modify',{element:'genre',id: songId,admin: adminId});
});

router.post('/admin/:admin/song-list/:id/modify/add/genre',function(req,res){
    var form = new formidable.IncomingForm;
    var songId = req.params.id;
    var adminId = req.params.admin;
    form.parse(req,function(err,fields,files){
        let genreName = fields.element;

        knex.insert({
            name: genreName
        })
        .into('genre')
        .then(
            res.redirect(`/admin/${adminId}/song-list/${songId}/modify`)
        );
    });
});

router.get('/admin/:admin/song-list/:id/modify/add/artist',function(req,res){
    adminId = req.params.admin
    songId = req.params.id;
    res.render('add-element-modify',{element:'artist',id: songId,admin: adminId});
});

router.post('/admin/:admin/song-list/:id/modify/add/artist',function(req,res){
    var form = new formidable.IncomingForm;
    var adminId = req.params.admin
    var songId = req.params.id;
    form.parse(req,function(err,fields,files){
        let artistName = fields.element;

        knex.insert({
            name: artistName
        })
        .into('artist')
        .then(
            res.redirect(`/admin/${adminId}/song-list/${songId}/modify`)
        );
    });
});



module.exports = router;