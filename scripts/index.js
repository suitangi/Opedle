function toPercentString(num) {
  return `${Math.round(num * 100)}%`;
}

function resetAttempts() {
  const boxes = document.querySelectorAll('#attempts > div');
  boxes.forEach(box => box.textContent = '');
  window.opendle.currentAttempts = 0;
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


//function to handle the help button
function helpModal() {
  $.dialog({
    title: '<span class=\"modalTitle\">How to Play</span>',
    content: '<span class=\"helpText\">Guess the <a href="https://magic.wizards.com/en" target="_blank">Magic: The Gathering</a> Card from the art and mana cost, Hangman style. You have 7 lives, meaning after guessing 7 wrong letters, the game is over.<br><br>' +
      'After each guess, the keys will show you if the letter was incorrect, as well as the number of lives you have left.<br><br></span><div class="hr"></div>' +
      '<span class=\"helpText\">A new Opendle will be available each day!</span>',
    theme: window.opendle.theme,
    animation: 'top',
    closeAnimation: 'top',
    animateFromElement: false,
    boxWidth: 'min(400px, 80%)',
    draggable: false,
    backgroundDismiss: true,
    useBootstrap: false
  });
}

//function to show errors
function errorModal(str) {
  $.dialog({
    title: '<span class=\"modalTitle\">Error</span>',
    content: `Encountered the following error: ${str}.`,
    type: 'red',
    theme: window.opendle.theme,
    animation: 'top',
    closeAnimation: 'top',
    animateFromElement: false,
    boxWidth: 'min(400px, 80%)',
    draggable: false,
    useBootstrap: false,
    typeAnimated: true,
    backgroundDismiss: true
  });
}

function playVid() {
  video.currentTime = 0;
  video.play();
  window.opendle.video.state = 1;
  window.opendle.video.playTimer = setTimeout(function() {
    stopVid();
  }, window.opendle.video.dur * 1000);
  document.getElementById('playButtonIcon').classList.add('hidden');
  document.getElementById('musicBars').classList.remove('hidden');
  document.getElementById('bar').style =
    `width: ${toPercentString(window.opendle.video.dur / window.opendle.totalPlayLengths + 0.01)};
    transition: width ${window.opendle.video.dur}s linear;`;
}

function stopVid() {
  video.pause();
  video.currentTime = 0;
  window.opendle.video.state = 0;
  document.getElementById('playButtonIcon').classList.remove('hidden');
  document.getElementById('musicBars').classList.add('hidden');
  document.getElementById('bar').style = '';
  clearTimeout(window.opendle.video.playTimer);
}

function attempt(guess) {
  window.opendle.currentAttempts++;
  console.log(`Guess: ${guess? guess: 'skipped'}`);


  //player lost
  if (window.opendle.currentAttempts == window.opendle.maxAttempts) {

  } else {
    window.opendle.video.dur += window.opendle.playLengths[window.opendle.currentAttempts];
    document.getElementById('availableBar').style = `width: ${toPercentString(window.opendle.video.dur / window.opendle.totalPlayLengths + 0.01)};`;

    let previousAttempt = document.getElementsByClassName('attemptShown')[window.opendle.currentAttempts - 1];
    previousAttempt.classList.remove('activeAttempt');
    document.getElementsByClassName('attemptLabel')[window.opendle.currentAttempts - 1].classList.remove('activeAttemptLabel');
    document.getElementsByClassName('timelabel')[window.opendle.currentAttempts - 1].classList.add('hidden');
    let activeAttempt = document.getElementsByClassName('attemptShown')[window.opendle.currentAttempts];
    activeAttempt.classList.add('activeAttempt');
    document.getElementsByClassName('attemptLabel')[window.opendle.currentAttempts].classList.add('activeAttemptLabel');

    if (guess) {
      previousAttempt.innerText = guess;
    } else {
      previousAttempt.innerText = "SKIPPED";
    }
  }
}


function updateSearches(list) {
  let rList = document.getElementsByClassName('sResult');
  for (var i = 0; i < rList.length; i++) {
    if (i >= list.length) { //not enough results
      rList[i].classList.add('hidden');
    } else {
      rList[i].classList.remove('hidden');
      rList[i].innerText = list[i];
    }
  }
  changeText('animeTotalCount', list.length);
  changeText('resultCount', list.length < 5 ? list.length : 5);

}

function search(input) {
  let r = [];
  window.opendle.animelist.forEach(nameList => {
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
  window.opendle = {};
  window.opendle.videos = [{
      title: "Despacito",
      src: "https://openings.moe/video/TokyoGhoul-OP01-NCOLD.mp4"
    },
    {
      title: "Shape of You",
      src: "https://openings.moe/video/TokyoGhoul-OP01-NCOLD.mp4"
    },
    // Add more videos here
  ];


  window.opendle.maxAttempts = 6;
  window.opendle.currentAttempts = 0;
  window.opendle.theme = 'dark';
  window.opendle.video = {
    state: 0,
    dur: 3,
    playTimer: undefined
  };
  window.opendle.playLengths = [3, 3, 6, 6, 6, 6];
  window.opendle.totalPlayLengths = window.opendle.playLengths.reduce((s, a) => s + a, 0);
  window.opendle.gameSesh = {
    guesses: [],
    day: getDateNumber(),
    end: false
  };

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

  setInterval(function() {
    document.getElementById('blinkText').classList.toggle('text-teal-500-override');
  }, 3000)

  fetch('./data/animelist.json')
    .then(response => response.json())
    .then(data => {
      window.opendle.animelist = data;
      search('');
    })
    .catch(function() {
      console.error('Could not fetch anime list');
    });

  fetch('./data/dailyList.json')
    .then(response => response.json())
    .then(data => {
      window.opendle.dailyList = data;
      initGame(data);
    })
    .catch(function() {
      console.error('Could not fetch daily song list');
    });

  function initGame(data) {
    if (getDateNumber() - data.start >= data.list.length) {
      errorModal('Opendle\'s daily list needs to be updated, please report a bug to Suitangi')
      // console.error('Opendle needs to be updated, please report a bug to Suitangi');
    }
    window.opendle.currentVideo = data.list[getDateNumber() - data.start];

    video.src = window.opendle.currentVideo.src;
    document.getElementById('guessInput').value = '';
    resetAttempts();
  }


  playButton.addEventListener('click', function() {
    let video = document.getElementById('video');
    let button = document.getElementById('playButton');

    //play video
    if (window.opendle.video.state == 0) {
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
    if (window.opendle.currentAttempts < boxes.length) {
      boxes[window.opendle.currentAttempts].textContent = guess;
    }
  }

  darkModeToggle.addEventListener('change', function() {
    if (darkModeToggle.checked) {
      localStorage.theme = 'dark';
      document.body.classList.add('dark');
      document.getElementById('darkModeLabel').innerText = "wb_sunny";
      window.opendle.theme = 'dark';
    } else {
      localStorage.theme = 'light';
      document.body.classList.remove('dark');
      document.getElementById('darkModeLabel').innerText = "nightlight";
      window.opendle.theme = 'light';
    }
  });

  document.getElementById('guessInput').addEventListener('input', function() {
    if (this.value.length > 0) {
      unhideElement('resultBox');
      unhideElement('darkbackground');
    } else {
      hideElement('resultBox');
      hideElement('darkbackground');
    }
    search(this.value);
  });

  document.getElementById('guessInput').addEventListener('focus', function() {
    if (this.value.length > 0) {
      unhideElement('resultBox');
      unhideElement('darkbackground');
    }
  });
  document.getElementById('darkbackground').addEventListener('click', function() {
    hideElement('resultBox');
    hideElement('darkbackground');
  });

  let rList = document.getElementsByClassName('sResult');
  for (var i = 0; i < rList.length; i++) {
    rList[i].addEventListener('click', function() {
      document.getElementById('guessInput').value = this.innerText;
      hideElement('resultBox');
      hideElement('darkbackground');
    });
  }

}); //end start script



//gets date corresponding number for daily befuddle
function getDateNumber() {
  d1 = new Date('3/7/2024 0:00');
  d2 = new Date();
  d2.setHours(0, 0, 0);
  dd = Math.floor((d2.getTime() - d1.getTime()) / 86400000) - 1;
  return dd;
}
