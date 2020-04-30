//
// Resources:
// - Speech synthesis https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
// - Usage https://stackoverflow.com/questions/33943150/webkitspeechgrammarlist-really-works
// - Usage https://stackoverflow.com/questions/45574101/chrome-version-60-speechrecognition
// - Usage https://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/
// - Firefox limitations: https://stackoverflow.com/questions/39784986/speechrecognition-is-not-working-in-firefox
//

const VOCABULARY_FOR_1 = ['ok', 'yes', 'true', 'news', 'yeah', 'is', 'hughes', 'used', 'i am', 'kiss', 'use', 'positive', 'yes i did', 'yahoo', 'juice', 'judas', 'yes yes']
const VOCABULARY_FOR_0 = ['maybe', 'unknown', 'dunno', 'not sure', 'maddie', 'i don\'t know', 'mandy']
const VOCABULARY_FOR_T = ['no', 'unlikely', 'false', 'know', 'no no', 'negative', 'nope']
const VOCABULARY_FOR_ESC = ['stop', 'quit', 'go away']

const QUESTIONS = [
  'Did you sleep well?',
  'Are you ok?',
  'Did you eat breakfast?',
  'Do you feel tired?'
]
let questionIndex = 0

// Compatibility
const SpeechRecognition = window.webkitSpeechRecognition ||
  window.SpeechRecognition
const SpeechSynthesis = window.SpeechSynthesis || window.speechSynthesis;

// Setup recognition
var recognition = new SpeechRecognition()
recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 3

// Wait on voices to be loaded before fetching list.
// Browsers might load voices asynchronously.
// See https://stackoverflow.com/a/22978802/638546
let voices = []
SpeechSynthesis.onvoiceschanged = function() {
  voices = SpeechSynthesis.getVoices()
  voices.forEach((voice, i) => {
    console.log(i, voice.name)
  })
}

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var listBox = document.querySelector('#listBox')

var speak = (word, cb) => {
  var utterThis = new SpeechSynthesisUtterance(word);
  utterThis.voice = voices[49]
  utterThis.rate = 0.75 // speed
  utterThis.volume = 0.75
  SpeechSynthesis.speak(utterThis);

  if (typeof cb !== 'function') cb = () => {}
  utterThis.onend = cb
}


var hasAny = (list, words) => {
  return words.some(w => list.indexOf(w) !== -1)
}

const askQuestion = (cb) => {
  speak(QUESTIONS[questionIndex], cb)
}

const addToList = (q) => {
  // Successful recognition.
  questionIndex = (questionIndex + 1) % QUESTIONS.length
  const el = document.createElement('div')
  el.innerHTML = '<span>' + q + '</span>'
  listBox.appendChild(el)
}

document.querySelector('#start-button').onclick = function() {
  askQuestion(() => {
    recognition.start();
    console.log('Recognition started...');
    console.log('Listening...');
  })
}

recognition.onresult = function(event) {
  // var word = event.results[0][0].transcript;
  var latestResult = event.results[event.results.length - 1]
  var words = Array.prototype.map.call(latestResult, alt => alt.transcript)

  // Clean up
  words = words.map(w => w.trim().toLowerCase())

  diagnostic.textContent = 'I heard: ' + words.toString();
  console.log(words)
  //if (words.indexOf('okay') !== -1 || words.indexOf('next' !== -1)) {
  if (hasAny(words, VOCABULARY_FOR_1)) {
    addToList(1)
    speak('positive, okay', askQuestion)
  } else if (hasAny(words, VOCABULARY_FOR_0)) {
    addToList(0)
    speak('unknown, okay', askQuestion)
  } else if (hasAny(words, VOCABULARY_FOR_T)) {
    addToList(-1)
    speak('negative, okay', askQuestion)
  } else if (hasAny(words, VOCABULARY_FOR_ESC)) {
    recognition.stop()
    speak('I stopped listening you.')
  } else {
    speak('What?')
  }
}

recognition.onerror = function (err) {
  console.error(err)
}
