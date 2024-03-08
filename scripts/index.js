function toPercentString(num) {
  return `${Math.round(num * 100)}%`;
}

function resetAttempts() {
  const boxes = document.querySelectorAll('#attempts > div');
  boxes.forEach(box => box.textContent = '');
  window.opedle.currentAttempts = 0;
}

function hideElement(id) {
  document.getElementById(id).classList.add('hidden');
}

function unhideElement(id) {
  document.getElementById(id).classList.remove('hidden');
}

function changeText(id, text) {
  document.getElementById(id).innerText = text;
}

function playVid() {
  video.currentTime = 0;
  video.play();
  window.opedle.video.state = 1;
  window.opedle.video.playTimer = setTimeout(function() {
    stopVid();
  }, window.opedle.video.dur * 1000);
  document.getElementById('playButtonIcon').innerText = 'stop';
  document.getElementById('bar').style =
    `width: ${toPercentString(window.opedle.video.dur / window.opedle.totalPlayLengths + 0.01)};
    transition: width ${window.opedle.video.dur}s linear;`;
}

function stopVid() {
  video.pause();
  video.currentTime = 0;
  window.opedle.video.state = 0;
  document.getElementById('playButtonIcon').innerText = 'play_arrow';
  document.getElementById('bar').style = '';
  clearTimeout(window.opedle.video.playTimer);
}

function attempt(guess) {
  window.opedle.currentAttempts++;
  console.log(`Guess: ${guess? guess: 'skipped'}`);


  //player lost
  if (window.opedle.currentAttempts == window.opedle.maxAttempts) {

  } else {
    window.opedle.video.dur += window.opedle.playLengths[window.opedle.currentAttempts];
    document.getElementById('availableBar').style = `width: ${toPercentString(window.opedle.video.dur / window.opedle.totalPlayLengths + 0.01)};`;

    let previousAttempt = document.getElementById('attempts').children[window.opedle.currentAttempts - 1];
    previousAttempt.classList.remove('activeAttempt');
    let activeAttempt = document.getElementById('attempts').children[window.opedle.currentAttempts];
    activeAttempt.classList.add('activeAttempt');

    if (guess) {
      previousAttempt.innerText = guess;
    } else {
      previousAttempt.innerText = "SKIPPED";
    }
  }
}


function updateSearches(list) {
  let rList = document.getElementsByClassName('sResult');
  for(var i = 0; i < rList.length; i++) {
    if (i >= list.length) { //not enough results
      rList[i].classList.add('hidden');
    } else {
      rList[i].classList.remove('hidden');
      rList[i].innerText = list[i];
    }
  }
  changeText('animeTotalCount', list.length);
  changeText('resultCount', list.length < 5? list.length : 5);

}

function search(input) {
  let r = [];
  window.opedle.animelist.forEach(nameList => {
    nameList.some(name => {
      if (name.toLowerCase().indexOf(input.toLowerCase()) != -1) {
        r.push(name);
        return true;
      }
    });

  });
  updateSearches(r);
}

//start script
$(document).ready(function() {
  window.opedle = {};
  window.opedle.videos = [{
      title: "Despacito",
      src: "https://openings.moe/video/TokyoGhoul-OP01-NCOLD.mp4"
    },
    {
      title: "Shape of You",
      src: "https://openings.moe/video/TokyoGhoul-OP01-NCOLD.mp4"
    },
    // Add more videos here
  ];


  window.opedle.maxAttempts = 6;
  window.opedle.currentAttempts = 0;
  window.opedle.video = {
    state: 0,
    dur: 3,
    playTimer: undefined
  };
  window.opedle.playLengths = [3, 3, 6, 6, 6, 6];
  window.opedle.totalPlayLengths = window.opedle.playLengths.reduce((s, a) => s + a, 0);;

  let currentVideoIndex;
  let currentVideo;
  let video = document.getElementById('video');
  let guessInput = document.getElementById('guessInput');
  let submitButton = document.getElementById('submitGuess');
  let feedback = document.getElementById('feedback');
  let attemptsDiv = document.getElementById('attempts');
  let playButton = document.getElementById('playButton');
  let skipButton = document.getElementById('skipButton');
  let darkModeToggle = document.getElementById('darkModeToggle');


  fetch('./data/animelist.json')
    .then(response => response.json())
    .then(data => {
      window.opedle.animelist = data;
      search('');
    })
    .catch(function() {
      console.error('Could not fetch anime list');
    });

  initGame();

  function initGame() {
    window.opedle.currentVideoIndex = Math.floor(Math.random() * window.opedle.videos.length);
    window.opedle.currentVideo = window.opedle.videos[window.opedle.currentVideoIndex];
    video.src = window.opedle.currentVideo.src;
    video.classList.add('hidden');
    document.getElementById('guessInput').value = '';
    resetAttempts();
  }


  playButton.addEventListener('click', function() {
    let video = document.getElementById('video');
    let button = document.getElementById('playButton');

    //play video
    if (window.opedle.video.state == 0) {
      playVid();
    } else { //stop video
      stopVid();
    }
  });

  skipButton.addEventListener('click', function() {
    stopVid();
    attempt();
  });

  submitButton.addEventListener('click', function() {

  });

  function resetGame() {
    initGame();
    playButton.disabled = false;
  }

  function generateFeedback(guess) {
    let feedbackText = '';
    for (let i = 0; i < currentVideo.title.length; i++) {
      if (guess.includes(currentVideo.title[i].toLowerCase())) {
        feedbackText += currentVideo.title[i];
      } else {
        feedbackText += '_';
      }
    }
    return feedbackText;
  }

  function updateAttempts(guess) {
    const boxes = document.querySelectorAll('#attempts > div');
    if (window.opedle.currentAttempts < boxes.length) {
      boxes[window.opedle.currentAttempts].textContent = guess;
    }
  }

  darkModeToggle.addEventListener('change', function() {
    if (darkModeToggle.checked) {
      localStorage.theme = 'dark';
      document.body.classList.add('dark');
      document.getElementById('darkModeLabel').innerText = "wb_sunny";
    } else {
      localStorage.theme = 'light';
      document.body.classList.remove('dark');
      document.getElementById('darkModeLabel').innerText = "nightlight";
    }
  });

  document.getElementById('guessInput').addEventListener('input', function() {
    search(this.value);
  });

  document.getElementById('guessInput').addEventListener('focus', function() {
    unhideElement('resultBox');
    unhideElement('darkbackground');
  });
  document.getElementById('darkbackground').addEventListener('click', function() {
    hideElement('resultBox');
    hideElement('darkbackground');
  });

  let rList = document.getElementsByClassName('sResult');
  for(var i = 0; i < rList.length; i++) {
    rList[i].addEventListener('click', function() {
      document.getElementById('guessInput').value = this.innerText;
      hideElement('resultBox');
      hideElement('darkbackground');
    });
  }

}); //end start script



//gets date corresponding number for daily befuddle
function getDateNumber() {
  d1 = new Date('3/3/2024 0:00');
  d2 = new Date();
  d2.setHours(0, 0, 0);
  dd = Math.floor((d2.getTime() - d1.getTime()) / 86400000) - 1;
  return dd;
}
