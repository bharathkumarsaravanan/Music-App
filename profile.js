const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { Router } = require('express');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));

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

router.get('/:id/profile',function(req,res){
    var user = req.params.id;

    knex('users')
    .select('*')
    .where('id',user)
    .then((userDatas) => {
        res.render('user-profile/profile', {user: userDatas});
    })

});

router.get('/:id/premium/podcasts',function(req,res){
    var userId = req.params.id;
    console.log(userId);
    knex('podcasts')
    .select('*')
    .where('owner',userId)
    .then((podcastList) => {
        res.render('user-profile/podcast-list',{user: userId, podcasts: podcastList})
    })

});

router.get('/:id/premium/podcast/create', function(req,res){
    var userId = req.params.id;

    res.render('user-profile/create-podcast',{user: userId});
});

router.post('/:id/premium/podcast/create', function(req,res){
    var userId = req.params.id;

    var form = new formidable.IncomingForm;
    var imgFolder = path.join(__dirname,'public','images','podcast-profiles')

    form.parse(req,function(err,fields,files){

        var podcastName = fields.name;
        var description = fields.description;

        knex.insert({
            name: podcastName,
            description: description,
            owner: userId
        }).into('podcasts')
        .then();

        knex('podcasts').max('id',{as: 'id'})
        .then((item) => {
            var ext = path.extname(files.podcastProfile.originalFilename);
            var imagefileName = item[0].id + ext;
            var imgfile = files.podcastProfile
            var newImageName = path.join(imgFolder,imagefileName)

            fs.renameSync(imgfile.filepath,newImageName,function(err){
                if(err){
                    console.log(err);
                }
            })

            knex('podcasts')
                .where('id',item[0].id)
                .update('profile_path',imagefileName)
                .then()
        })

        res.redirect(`/${userId}/premium/podcasts`)

    });


});

router.get('/:id/premium/podcast/:podcastId/audio', function(req,res){
    var userId = req.params.id;
    var podcastId = req.params.podcastId;

    console.log(userId, podcastId);

    knex('podcastSongs')
    .join('users','users.id','=','podcastSongs.userId')
    .join('podcasts','podcasts.id','=','podcastSongs.podcastId')
    .select({
        id: 'podcastSongs.id',
        image: 'podcasts.profile_path',
        audioname: 'podcastSongs.audioname',
        podcastname: 'podcasts.name',
        username: 'users.name',
        audiopath: 'podcastSongs.audio',
        description: 'podcasts.description'
    })
    .where('podcastSongs.userId', userId)
    .andWhere('podcastSongs.podcastId', podcastId)
    .then((podcastSongs) => {
        console.log(podcastSongs);
        res.render('user-profile/podcast-audios',{user:userId, podcast: podcastId, podcastSongs: podcastSongs});
    })

});

router.get('/:id/premium/podcast/:podcastId/audio/add', function(req,res){
    var userId = req.params.id;
    var podcastId = req.params.podcastId;

    res.render('user-profile/add-podcast-audio',{user: userId, podcast: podcastId});
});

router.post('/:id/premium/podcast/:podcastId/audio/add', function(req,res){
    var userId = req.params.id;
    var podcastId = req.params.podcastId;

    var form = new formidable.IncomingForm;
    var uploadFolder = path.join(__dirname,'public','audios','podcast-audios')
    form.uploadDir = uploadFolder;

    form.parse(req,function(err,fields,files){
        // console.log(fields,files);

        var audioname = fields.audiotitle;

        knex.insert({
            userId: userId,
            podcastId: podcastId,
            audioname: audioname
        }).into('podcastSongs')
        .then();

        knex('podcastSongs').max('id',{as: 'id'})
        .then((item)=> {
            var ext = path.extname(files.audiofile.originalFilename);
            var fileName = item[0].id + ext;
            var file = files.audiofile;

            console.log(fileName);
            var newName =  path.join(uploadFolder,fileName);

            fs.renameSync(file.filepath,newName,function(err){
                if(err){
                    console.log(err);
                }
            })

            knex('podcastSongs')
            .where('id',item[0].id)
            .update('audio',fileName)
            .then()
        });

        res.redirect(`/${userId}/premium/podcast/${podcastId}/audio`)
    });

});

router.get('/:id/premium/podcast/:podcastId/audio/:podcastAudioid/delete',function(req,res){
    var userId = req.params.id;
    var podcastId = req.params.podcastId;
    var podcastAudioid = req.params.podcastAudioid;

    knex('podcastSongs')
    .del()
    .where('id', podcastAudioid)
    .then(res.redirect(`/${userId}/premium/podcast/${podcastId}/audio`))
});

module.exports = router;
