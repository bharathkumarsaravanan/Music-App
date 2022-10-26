const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { parse } = require('path');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const { exit } = require('process');

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db'
    },
    useNullAsDefault: true
});

const app = express();
app.use(express.static("images"));
app.use(express.static("public"));
app.use(express.static("audios"));
app.use(express.static("images"));
app.use(express.static("artists"));
app.use(express.static("genres"));
app.set("view engine","ejs");


router.use(function timeLog(req,res,next){
    console.log('Time:', Date.now());
    next();
});

router.get('/',function(req,res){
    res.render('login',{path: ''});
});

router.post('/',function(req,res){
    var form = new formidable.IncomingForm;

    form.parse(req,function(err,fields,files){
        var id = fields.id;
        var password = fields.password;
        
        knex('users')
        .select('*')
        .where('id', id)
        .andWhere('password',password)
        .then((e) => {
            if(e.length === 0){
                res.send('Wrong Password')
            }else{
                knex('users')
                .update('status','logged in')
                .where('id',id)
                .then( res.redirect(`/${id}/songs`)   )
                            
            }
        })
        
    });
});

router.get("/:id/logout",function(req,res){
    var user = req.params.id;
    // console.log(user.id);
    knex('users')
    .update('status','logged out')
    .where('id',user)
    .then()
    res.redirect('/')
});

router.get('/create-new-account',function(req,res){
    res.render('user-new-account');
});

router.post('/create-new-account',function(req,res){
    var form = new formidable.IncomingForm;
    form.parse(req,function(err,fields,files){
        console.log(fields);
        var userName = fields.firstname + " " + fields.lastname;
        var userEmail = fields.email;
        var userPhoneno = fields.phoneno;
        var userPassword = fields.confirmPassword;

        knex.insert({
             password:  userPassword,
             name: userName,
             email: userEmail,
             phoneno: userPhoneno,
             type: 'Regular',
             status: 'logged out',
             current_plan: 'none'
        }).into('users')
        .then(() => {
            res.redirect('/')
        }
        );

    });
});

router.get('/:id/plans',function(req,res){
    var user = req.params.id;

    knex('PremiumPlans')
    .select('*')
    .then((plans) => {
        res.render('Premium-plans',{id: user, plan: plans});
    })

});

router.get('/:id/plan/month/:amount',function(req,res){
    var user = req.params.id;
    var amount = req.params.amount;

    var today = new Date();
    today.setDate(today.getDate() + 30)

    var date = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear()
    var expiryDate = year + '-' + month+ '-' + date

    var day = new Date();

    var currentdate = ("0" + day.getDate()).slice(-2);
    var currentmonth = ("0" + (day.getMonth() + 1)).slice(-2);
    var currentyear = day.getFullYear()
    var currentDate = currentyear + '-' + currentmonth+ '-' + currentdate
    

    knex('PremiumAccounts')
    .select('*')
    .where('userId',user)
    .orderBy('id','desc').limit(1)
    .then((check) => {

        if(check.length === 0){
            premiumPlans();

        }else if(currentDate < check[0].expiry_date){
            res.send({alert: 'Your current Plan has not expired'})

        }else{
            premiumPlans();
        }
    })

function premiumPlans(){

    knex('users')
    .update({
        type:'premium',
        current_plan: 1
    })
    .where('id',user)
    .then(() => {


        knex.insert({
            userId: user,
            plan: 1,
            paid: amount

        }).into('PremiumAccounts')
        .then(() => {
            knex('PremiumAccounts')
            .max('id',{as:'id'})
            .then((item) => {

                knex('PremiumAccounts')
                .update('expiry_date',expiryDate)
                .where('id',item[0].id)
                .then(res.redirect(`/${user}/songs`))

            })
            

        })
    })
}


});

router.get('/:id/plan/season/:amount',function(req,res){
    var user = req.params.id;
    var amount = req.params.amount;

    var today = new Date();
    today.setDate(today.getDate() + 90)

    var date = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear()
    var expiryDate = year + '-' + month+ '-' + date

    var day = new Date();

    var currentdate = ("0" + day.getDate()).slice(-2);
    var currentmonth = ("0" + (day.getMonth() + 1)).slice(-2);
    var currentyear = day.getFullYear()
    var currentDate = currentyear + '-' + currentmonth+ '-' + currentdate
    

    knex('PremiumAccounts')
    .select('*')
    .where('userId',user)
    .orderBy('id','desc').limit(1)
    .then((check) => {

        if(check.length === 0){
            premiumPlans();

        }else if(currentDate < check[0].expiry_date){
            res.send({alert: 'Your current Plan has not expired'})

        }else{
            premiumPlans();
        }
    })

function premiumPlans(){

    knex('users')
    .update({
        type:'premium',
        current_plan: 2
    })
    .where('id',user)
    .then(() => {


        knex.insert({
            userId: user,
            plan: 2,
            paid: amount
        }).into('PremiumAccounts')
        .then(() => {
            knex('PremiumAccounts')
            .max('id',{as:'id'})
            .then((item) => {

                knex('PremiumAccounts')
                .update('expiry_date',expiryDate)
                .where('id',item[0].id)
                .then(res.redirect(`/${user}/songs`))

            })
            

        })
    })
}

    

});

router.get('/:id/plan/year/:amount',function(req,res){
    var user = req.params.id;
    var amount = req.params.amount;

    var today = new Date();
    today.setDate(today.getDate() + 365)

    var date = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear()
    var expiryDate = year + '-' + month+ '-' + date

    var day = new Date();

    var currentdate = ("0" + day.getDate()).slice(-2);
    var currentmonth = ("0" + (day.getMonth() + 1)).slice(-2);
    var currentyear = day.getFullYear()
    var currentDate = currentyear + '-' + currentmonth+ '-' + currentdate
    

    knex('PremiumAccounts')
    .select('*')
    .where('userId',user)
    .orderBy('id','desc').limit(1)
    .then((check) => {

        if(check.length === 0){
            premiumPlans();

        }else if(currentDate < check[0].expiry_date){
            res.send({alert: 'Your current Plan has not expired'})

        }else{
            premiumPlans();
        }
    })

function premiumPlans(){
    

    knex('users')
    .update({
        type:'premium',
        current_plan: 3
    })
    .where('id',user)
    .then(() => {


        knex.insert({
            userId: user,
            plan: 3,
            paid: amount
        }).into('PremiumAccounts')
        .then(() => {
            knex('PremiumAccounts')
            .max('id',{as:'id'})
            .then((item) => {

                knex('PremiumAccounts')
                .update('expiry_date',expiryDate)
                .where('id',item[0].id)
                .then(res.redirect(`/${user}/songs`))

            })
            

        })
    })
}

});










router.get('/:id/request',function(req,res){
    var id = req.params.id;
    res.render("request",{userid: id});
});
router.post('/:id/request',function(req,res){
    var form = new formidable.IncomingForm;
    var id = req.params.id;
    console.log(id.id);

    form.parse(req,function(err,fields,files){
        let songName = fields.songName;
        let movieName = fields.movieName;

        knex.insert({
            userid: id,
            song_name: songName,
            movie_name: movieName,
            status: 'pending'
        })
        .into('request')
        .then();
        res.redirect('/home');

    })
});

router.get('/:id/songs',function(req,res){
    var userId = req.params.id;

    knex('songs')
    .join('movie','songs.movie_id','=','movie.id')
    .select({
        songid: 'songs.id',
        songname: 'songs.song_name',
        moviename: 'movie.name',
        audiopath: 'songs.file_path',
        moviepath: 'movie.image_path'
    })
    .orderBy('songs.id','desc')
    .then((songlist) =>{
        knex('artist')
        .select('*')
        .then((artistrow) => {
            knex('movie')
            .select('*')
            .then((movierow) => {
                knex('songs')
                .join('movie','songs.movie_id','=','movie.id')
                .join('artist','songs.artist_id', '=','artist.id')
                .select({
                    id: 'songs.id',
                    song: 'songs.song_name',
                    moviename: 'movie.name',
                    artistname: 'artist.name',
                    moviepath: 'movie.image_path',
                    filepath: 'songs.file_path'
                })
                .orderByRaw('RANDOM()')
                .limit(5)
                .then((randomRecord) => {
                    knex('genre')
                    .select('*')
                    .then((genrerow) => {
                        knex('playlists')
                        .select('*')
                        .then((playlists) => {

                                knex('users')
                                .select('*')
                                .where('id',userId)
                                .then((userInfo) => {
                                    console.log(userInfo);
                                    res.render('user-index',{userId: userId,user: userInfo, songs: songlist, artists: artistrow, movies: movierow, randomsong: randomRecord, genres: genrerow, playlist: playlists});     
                                })
                            
                                
                        })

                    })
    
                })
            })
        })

    })
    
});

router.get('/:id/artists/:artistId',function(req,res){
    var userId = req.params.id;
    var artistId = req.params.artistId;

    knex('artist')
    .select('*')
    .where('id',artistId)
    .then((artistrow) => {
            knex('songs')
            .join('movie','songs.movie_id','=','movie.id')
            .select({
                imagepath: 'movie.image_path',
                songname: 'songs.song_name',
                audiopath: 'songs.file_path',
                moviename: 'movie.name'
            })
            .where('artist_id',artistId)
            .then((songrow) => {
                res.render('predefined-playlists',{element: artistrow[0], folder: 'movies', songs: songrow, coverFolder: 'artists', id: userId});
            })
        console.log(artistrow);
    })

});

router.get('/:id/movies/:movieId',function(req,res){
    var userId = req.params.id;
    var movieId = req.params.movieId;

    knex('movie')
    .select('*')
    .where('id',movieId)
    .then((movierow) => {
            knex('songs')
            .join('movie','songs.movie_id','=','movie.id')
            .select({
                imagepath: 'movie.image_path',
                songname: 'songs.song_name',
                audiopath: 'songs.file_path',
                moviename: 'movie.name'
            })
            .where('movie_id',movieId)
            .then((songrow) => {
                res.render('predefined-playlists',{element: movierow[0], folder: 'movies', songs: songrow, coverFolder: 'movies', id: userId});
            })
        // console.log(artistrow);
    })

});

router.get('/:id/genres/:genreId',function(req,res){
    var userId = req.params.id;
    var genreId = req.params.genreId;

    knex('genre')
    .select('*')
    .where('id',genreId)
    .then((genrerow) => {
            knex('songs')
            .join('movie','songs.movie_id','=','movie.id')
            .select({
                imagepath: 'movie.image_path',
                songname: 'songs.song_name',
                audiopath: 'songs.file_path',
                moviename: 'movie.name'
            })
            .where('genre_id',genreId)
            .then((songrow) => {
                res.render('predefined-playlists',{element: genrerow[0], folder: 'movies', songs: songrow, coverFolder: 'genres', id: userId});
            })
        // console.log(artistrow);
    })

});

router.get('/:id/playlists',function(req,res){
    var userId = req.params.id;

    knex('playlists')
    .select('*')
    .then((playlistrow) => {
        res.render('playlists',{user: userId, playlists: playlistrow})
    })
});

router.get('/:id/playlists/create',function(req,res){
    var userId = req.params.id;
    res.render('create-playlist',{user: userId})
});

router.post('/:id/playlists/create', function(req,res){
    var userId = req.params.id;

    var form = new formidable.IncomingForm

    form.parse(req,function(err,fields){
        console.log(fields);
        var playlistName = fields.playlistName

        knex.insert({
            name: playlistName,
            userId: userId
        }).into('playlists')
        .then(
            res.redirect(`/${userId}/playlists`)
        );
    });

});

router.get('/:id/playlists/:playlistid/songs',function(req,res){
    var userId = req.params.id;
    var playlistId = req.params.playlistid;

    knex('playlistSongs')
    .select('song_id')
    .where('playlist_id',playlistId)
    .then((playlistSongs) => {
        knex('songs')
        .select('*')
        .whereIn('id',playlistSongs.map(s => s.song_id))
        .then((song) => {
            knex('songs')
            .join('movie','songs.movie_id','=','movie.id')
            .whereIn('songs.id',playlistSongs.map(s => s.song_id))
            .select({
                song: "songs.song_name",
                movie: "movie.name",
                image_path: "movie.image_path"
            })
            .then((movie) => {
                    knex('songs')
                    .join('artist','songs.artist_id','=','artist.id')
                    .whereIn('songs.id',playlistSongs.map(s => s.song_id))
                    .select({
                        song: "songs.song_name",
                        artist: "artist.name",
                        image_path: "artist.image_path"
                    })
                    .then((artist) => {
                        console.log(song[0].id);
                        res.render('userdefined-playlist',{user: userId, playlistid: playlistId, songs: song, movies: movie, artists: artist})                        
    
                    })
            })
            })
           
            
        })

});

router.get('/:id/playlists/:playlistid/songs/add', function(req,res){
    var userId = req.params.id;
    var playlistId = req.params.playlistid;

    knex('songs')
    .join('movie','songs.movie_id','=','movie.id')
    .select({
        songid : 'songs.id',
        imagepath: 'movie.image_path',
        songname: 'songs.song_name',
        audiopath: 'songs.file_path',
        moviename: 'movie.name'
    })
    .then((songrow) => {
        knex('songs')
        .join('artist','songs.artist_id','=','artist.id')
        .select({
            artistname: 'artist.name'
        }).then((artist) => {
            knex('playlistSongs')
            .select('*')
            .where('playlist_id',playlistId)
            .then((check) => {
           

                res.render('playlist-song-add',{user: userId, playlistid: playlistId, songs: songrow, md: artist, imgFolder: 'movies', playCheck: check.map(s => s.song_id)})
            })
        })
    })

    
});

router.get('/:id/playlists/:playlistid/songs/add/:songid',function(req,res){
    var userId = req.params.id;
    var playlistId = req.params.playlistid;
    var songId = req.params.songid;

    knex.insert({
        song_id: songId,
        playlist_id: playlistId,
        user_id: userId
    }).into('playlistSongs')
    .then(
        res.redirect(`/${userId}/playlists/${playlistId}/songs/add`)
    )
});

router.get('/:id/playlists/:playlistid/songs/remove/:songid',function(req,res){
    var userId = req.params.id;
    var playlistId = req.params.playlistid;
    var songId = req.params.songid;

    knex('playlistSongs')
    .where('song_id',songId)
    .andWhere('playlist_id',playlistId)
    .del()
    .then(
        res.redirect(`/${userId}/playlists/${playlistId}/songs/add`)
    )
    
});

router.get('/:id/playlists/:playlistid/songs/list/remove/:songid',function(req,res){
    var userId = req.params.id;
    var playlistId = req.params.playlistid;
    var songId = req.params.songid;

    knex('playlistSongs')
    .where('song_id',songId)
    .andWhere('playlist_id',playlistId)
    .del()
    .then(
        res.redirect(`/${userId}/playlists/${playlistId}/songs`)
    )
    
});


module.exports = router;