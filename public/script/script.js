var audio = document.getElementById('audio')
var playPause = document.getElementById('playPause')

var element = '<%= songs.songid %>'
console.log(element);
alert(element)
var x = "<%=user%>"
alert(x);

var count = 0;

function play(){
    if(count == 0){
        count = 1;
        audio.play();
    }else{
        count = 0
        audio.pause();
    }
}


//     for(var i = 0; i < songs.length; i++){

    //         var btn[i] = "<%=songs[i].songid%>";
    //         var aud[i] = "<%=songs[i].audiopath%>";
    //         var audio[i] = document.getElementById(aud[i])
    //         var button[i] = document.getElementById(btn[i])

    //         var count = 0;

    // function play(){
    //     if(count == 0){
    //     count = 1;
    //     audio[i].play();
    //     }else{
    //     count = 0
    //     audio[i].pause();
    //     }
    //     }
    // }