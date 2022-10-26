const { format } = require('path');
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));


const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db'
    },
    useNullAsDefault: true
});

const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');

const express = require('express');
const { table } = require('console');

const app = express();

app.use(express.static("public"));

// db.run('CREATE TABLE admin(id INTEGER PRIMARY KEY AUTOINCREMENT, password text)');

// db.run("CREATE TABLE request (id INTEGER PRIMARY KEY AUTOINCREMENT, userid int, song_name text,movie_name text)");

// db.run("CREATE TABLE genre (id INTEGER PRIMARY KEY AUTOINCREMENT, name text)");
// db.run("CREATE TABLE PremiumPlans (id INTEGER PRIMARY KEY AUTOINCREMENT, name text,validity text, amount int)");
// db.run("CREATE TABLE podcasts (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text, profile_path text, owner INTEGER)");
// db.run("CREATE TABLE artist (id INTEGER PRIMARY KEY AUTOINCREMENT, name text)");
// db.run("CREATE TABLE songs (id INTEGER PRIMARY KEY AUTOINCREMENT, song_name text,movie_id int,genre_id int,artist_id int,file_path text)");
// db.run("CREATE TABLE podcastSongs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, podcastId INTEGER, audio text)");
// db.run("ALTER TABLE podcastSongs ADD COLUMN audioname TEXT");

// knex.insert({
//     password: '67890'
// }).into('admin')
// .then()

// knex.insert({
//     password: '12345'
// }).into('admin')
// .then()

// db.run('ALTER TABLE songs ADD COLUMN image_path text');




// var hours = today.getHours();
// var minutes = today.getMinutes();
// var seconds = today.getSeconds();
// var time = hours + ":" + minutes + ":" + seconds
// if(hours > 12){
//     hours = hours - 12 
//     time = time + ' pm'
// }else{
//     time = time + ' am'
// }
// console.log(time);

// knex.schema.alterTable('users',function(table){
//     table.string('name');
//     table.string('email');
//     table.integer('phoneno');
// }).then();

// db.run('ALTER TABLE PremiumAccounts add COLUMN plan int ');
// db.run('ALTER TABLE PremiumAccounts drop column amount');
// db.run('ALTER TABLE PremiumAccounts add column paid int');
// db.run('ALTER TABLE request ADD COLUMN time_of_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL');

// knex('users')
// .whereIn('id', [1,2,3,4,5,6,7])
// .del()
// .then()

var today = new Date();


// console.log(day);
// console.log(today);

// today.setDate(today.getDate() + 30)

var date = ("0" + today.getDate()).slice(-2);
var month = ("0" + (today.getMonth() + 1)).slice(-2);
var year = today.getFullYear();
// var hour = today.getTime();
var day = year + '-' + month+ '-' + date
console.log(day);
// console.log(today);



knex('PremiumPlans')
.join('PremiumAccounts','PremiumPlans.id','=','PremiumAccounts.plan')
.select(knex.raw('PremiumPlans.name,PremiumPlans.validity,PremiumPlans.amount,count(PremiumAccounts.plan) as count'))
.groupBy('PremiumAccounts.plan')
.then((sCount) => {
    console.log(sCount);
})

knex('PremiumPlans')
.join('users','users.current_plan','=','PremiumPlans.id')
.select(knex.raw('PremiumPlans.name, count(users.id) as count'))
.groupBy('users.current_plan')
.then((e) => console.log(e))









// knex('PremiumAccounts')
// .select(knex.raw('count(*) as count,plan'))
// .where(knex.raw('date(rcDate)'),day)
// .groupBy('plan')
// .then((sCount) => {
//     console.log(sCount);

//     var monthCost;
//     var seasonCost;
//     var yearlyCost;

//     for(var i = 0; i < sCount.length; i++){
//         if(sCount[i].plan === 'monthly'){
//             monthCost = sCount[i].count * 100
//         }else if(sCount[i].plan === 'season'){
//             seasonCost = sCount[i].count * 250
//         }else{
//             yearlyCost = sCount[i].count * 900
//         }
//     }
//     console.log(monthCost + seasonCost + yearlyCost);

//     console.log(monthCost,seasonCost,yearlyCost);


// })







// knex('users')
// .select(knex.raw('count(*) as users, type'))
// .groupBy('type')
// .then((acountType) => {
//     console.log(acountType);;
// })



// knex('users')
// .select(knex.raw('count(*) as users, date(created_at) as date'))
// .groupBy(knex.raw('date(created_at)'))
// .where(knex.raw('date(created_at)'), '>=', day)
// .limit(10)
// .then((date) => {
//     var count = date.map((s) => s.users);
//     var dates = date.map((b) => b.date.slice(5))
//     // var date1 = dates.slice(5)
//     console.log(dates,count)
// })


// mergeImages(['public/images/movies/37.jpg','public/images/movies/38.jpg','public/images/movies/39.jpg'], {
//     Canvas: Canvas,
//     Image: Image
// })
// .then(b64 => {
// })
// db.run('CREATE TABLE request_reports (time_of_action int, request_id int, user_id int, admin_id int, song_id int, status text)')
// db.run('DROP TABLE request_reports');
// db.run('CREATE table request_reports(time_of_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,request_id int, user_id int, admin_id int, song_id int, status text)')
// db.run(`CREATE TABLE update_reports (time_of_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,admin_id int,song_id int, status text)`);
// db.run(`CREATE TABLE playlists (id INTEGER PRIMARY KEY AUTOINCREMENT,name STRING,song_id int)`);
// db.run(`CREATE TABLE playlistSongs (time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, id INTEGER PRIMARY KEY AUTOINCREMENT,name STRING,song_id int)`);
// db.run(`CREATE TABLE PremiumAccounts (id INTEGER PRIMARY KEY AUTOINCREMENT,rcDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ,userId int, plan string, expiry_date string)`);



// knex.insert({
//     status: 'music'
// }).into('update_reports')
// .then()

// db.run(`ALTER TABLE playlistSongs DROP COLUMN userId`)


// knex('update_reports')
// .select('*')
// .then((e) => console.log(e))




// knex('playlistSongs')
// .select('song_id')
// .where('playlist_id', 2)
// .then((e) => {
//     knex('songs')
//     .join('movie','songs.movie_id','=','movie.id')
//     .whereIn('songs.id',e.map(s => s.song_id))
//     .select({
//         song: "songs.song_name",
//         movie: "movie.name",
//         image_path: "movie.image_path"
//     })
//     .then((s) => {
//             knex('songs')
//             .join('artist','songs.artist_id','=','artist.id')
//             .whereIn('songs.id',e.map(s => s.song_id))
//             .select({
//                 song: "songs.song_name",
//                 artist: "artist.name",
//                 image_path: "artist.image_path"
//             })
//             .then((f) => {
//                 console.log(f);
//                 console.log(s);
//             })
//     })

// knex('playlistSongs')
// .where('playlist_id', 2)
// .del()
// .then()

//  knex('playlistSongs')
// .select('*')
// .then((e) => console.log(e))

// knex('songs')
// .join('movie','songs.movie_id','=','movie.id')
// .join('artist','songs.artist_id', '=','artist.id')
// .select({
//     song: 'songs.song_name',
//     moviename: 'movie.name',
//     artist: 'artist.name',
//     moviepath: 'movie.image_path'
// })
// .orderByRaw('RANDOM()')
// .limit(5)
// .then((e) => console.log(e))




// knex.insert({
//     name: 'art music'
// })
// .into('genre')
// .then()
// knex.insert({
//     name: 'Hiphop'
// })
// .into('genre')
// .then()
// knex.insert({
//     name: 'Jazz'
// })
// .into('genre')
// .then()
// knex.insert({
//     name: 'Soundtrack'
// })
// .into('genre')
// .then()


// knex.insert({
//     name: 'Ar rahman'
// })
// .into('artist')
// .then()
// knex.insert({
//     name: 'Anirudh'
// })
// .into('artist')
// .then()
// knex.insert({
//     name: 'Yuvan Shankar Raja'
// })
// .into('artist')
// .then()
// knex.insert({
//     name: 'Illayaraja'
// })
// .into('artist')
// .then()
