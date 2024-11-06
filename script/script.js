let songs;
let folders;
let currentsong=new Audio();
function formatTime(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }
    /*let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    
    // Pad minutes and seconds with leading zeros if needed
    minutes = String(minutes).padStart(2, '0');
    secs = String(secs).padStart(2, '0');
    
    return `${minutes}:${secs}`;*/
    const minutes=Math.floor(seconds/60);
    const remainingseconds=Math.floor(seconds%60);

    const formatminutes=String(minutes).padStart(2,'0');
    const formatseconds=String(remainingseconds).padStart(2,'0');

    return `${formatminutes}:${formatseconds}`;
}
async function getSongs(folder) {
    folders=folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML="";
    for (const song of songs) {
        let [songname, songartist] = song.split("-");
        songul.innerHTML = songul.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="music">
                            <div class="info">
                                <div style="display:none;" >${song}</div>
                                <div>${songname.replaceAll("%20", " ")}</div>
                                <div>${songartist.replaceAll("%20", " ").replaceAll(".mp3", "")}</div>
                            </div>
                            <div class="playnow">
                                <span>
                                    Play 
                                    Now
                                </span>
                                <img  class="invert" src="img/play.svg" alt="play-now">
                            </div></li>`;
    }
    
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            //console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });   
        
    });
    return songs;
}
const playMusic=(track,pause=false)=>{
      currentsong.src=`${folders}/`+track;
      if(!pause){
          currentsong.play();
          play.src="img/pause.svg";
      }else{
        currentsong.pause();
      }
      
      document.querySelector(".songinfo").innerHTML=track.replaceAll("%20"," ").replace(".mp3","").replace("-"," ");
      document.querySelector(".songtime").innerHTML="00:00";

      
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a");
    let array=Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")){
            console.log(e.href.split("/").slice(-2)[1]);
            let currfolder=e.href.split("/").slice(-2)[1];
            //get meta data from each folder
            let f = await fetch(`http://127.0.0.1:5500/songs/${currfolder}/info.json`);
            let response = await f.json();
            document.querySelector(".card-container").innerHTML=document.querySelector(".card-container").innerHTML+`<div data-folder="${currfolder}" class="card bg-grey2">
                        <div class="play">
                            <img src="img/play.svg" alt="play-now">
                        </div>
                        <img src="/songs/${currfolder}/cover.jpeg" alt="cover-image">
                        <h2>${response.heading}</h2>
                        <p>${response.description}</p>
                    </div>`;
            
        }
    }

    //whenever acard is clicked then load that folder's song.
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click",async item=>{
            //songs = await getSongs(`songs/${item.target.dataset.folder}`)
            //here we have to use the currentTarget property as we want to load the songs of the current folder and we only want to listen to the card's event not H1,img or anything within it
            //console.log(item.currentTarget.dataset.folder);
            
            songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })   
}

async function main() {
    
    // Fetch songs from default folder
    await getSongs("songs/happy-hits");
    playMusic(songs[0],true);

    //Display all the albums on the page
    displayAlbums();
    
    let play=document.getElementById("play");
    let prev=document.getElementById("previous");
    let next=document.getElementById("next");
    play.addEventListener("click",()=>{
        if(currentsong.paused){
            play.src="img/pause.svg";
            currentsong.play();
        }else{
            play.src="img/play.svg";
            currentsong.pause();
        }
    })

    currentsong.addEventListener("timeupdate",()=>{
        //console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML=`${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
    })

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        //console.log(e.offsetX,e.offsetY);
        document.querySelector(".circle").style.left=(e.offsetX/e.target.getBoundingClientRect().width)*100+"%";
        currentsong.currentTime=(currentsong.duration*(e.offsetX/e.target.getBoundingClientRect().width)*100)/100;
    })
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left=0;
    })
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left=-110+"%";
    })
    //previous and next 
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {  // Check if there's a previous song
            playMusic(songs[index - 1]);
        }
    });
    
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {  // Check if there's a next song
            playMusic(songs[index + 1]);
        }
    });
    
}

main();

