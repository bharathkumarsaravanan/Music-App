const express = require('express');

const app = express();
const formidable = require('formidable');


app.use(express.static("public"));
app.use(express.static("audios"));
app.use(express.static("images"));
app.use(express.static("movies"));
app.use(express.static("artists"));
app.use(express.static("genres"));
app.set("view engine","ejs");

app.use(require('./admin-request-handling'))
app.use(require('./admin-updates'))
app.use(require('./songs-handling'))
app.use(require('./user'))
app.use(require('./element'))
app.use(require('./profile'))
app.use(require('./user-podcasts'))




app.listen(3000,function(){
    console.log('Server Started has been Started though port 3000');
});