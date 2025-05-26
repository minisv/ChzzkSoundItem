'use strict'

const fileMap = new Map();
const player = document.getElementById("player");

document.getElementById("file").addEventListener("change", (event) => {
  fileMap.clear();
  Array.from(event.target.files).forEach(file => {
    const nameOnly = file.name.replace(/\.mp3$/,'');
    fileMap.set(nameOnly, file);
  });
  document.body.style.display = "none";
});

const playSound = async (sound) => {
  const file = fileMap.get(sound);
  if (!file) return soundQueue.jobFinished();
  
  const url = URL.createObjectURL(file);
  let audio = new Audio(url);
  
  audio.oncanplaythrough = async () => {
    let duration = audio.duration;
    await audio.play();
    
    setTimeout( async () => {
      await soundQueue.jobFinished();
    }, duration * 1000);
  }
  player.src = URL.createObjectURL(file);
  player.load();
}

const getParameterByName = (name, url = window.location.href) => {
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}