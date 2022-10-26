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


router.get('/:id/podcasts', function(req,res){
    var userId = req.params.id;

    knex('podcasts')
    .select('*')
    .orderBy('id','desc')
    .limit(8)
    .then((latestPodcasts) => {

        knex('podcastSongs')
        .join('podcasts','podcastSongs.podcastId','=','podcasts.id')
        .join('users','podcastSongs.userId','=','users.id')
        .select({
            audioId: 'podcastSongs.id',
            audioname: 'podcastSongs.audioname',
            podcastname: 'podcasts.name',
            profile: 'podcasts.profile_path',
            username: 'users.name',
            audiopath: 'podcastSongs.audio'
        })
        .orderBy('podcastSongs.id','desc')
        .limit(8)
        .then((latestEpisodes) => {

            res.render('user-podcasts/user-podcast-index',{user: userId,latestPodcasts: latestPodcasts, latestEpisodes: latestEpisodes})

        })

    })
});

router.get('/:id/podcasts/:podcastId', function(req,res){
    var user = req.params.id;
    var podcastId = req.params.podcastId;

    knex('podcastSongs')
    .join('podcasts','podcastSongs.podcastId','=','podcasts.id')
    .join('users','podcastSongs.userId','=','users.id')
    .select({
        audioId: 'podcastSongs.id',
        audioname: 'podcastSongs.audioname',
        podcastname: 'podcasts.name',
        description: 'podcasts.description',
        image: 'podcasts.profile_path',
        username: 'users.name',
        audiopath: 'podcastSongs.audio'
    })
    .where('podcastSongs.podcastId',podcastId)
    .then((podcastSongs) => {
        res.render('user-podcasts/user-podcast-audioList',{podcastSongs: podcastSongs})
    })

});



module.exports = router;