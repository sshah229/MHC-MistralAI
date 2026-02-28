// azure-cognitiveservices-speech.js
require("dotenv").config();
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const blendShapeNames = require("./blendshapeNames");
const _ = require("lodash");

let SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
<voice name="en-US-JennyNeural">
  <mstts:viseme type="FacialExpression"/>
  __TEXT__
</voice>
</speak>`;

const key =
  "GER7mherzw3KPz8pYKDywCocC3tQZGu3ihFO6EdGsF38Yl5uSFeFJQQJ99BCAC4f1cMXJ3w3AAAYACOG2Lfc";
const region = "westus";

/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio
 */
const textToSpeech = async (text, voice) => {
  // convert callback function to promise
  return new Promise((resolve, reject) => {
    let ssml = SSML.replace("__TEXT__", text);

    // console.log(text)
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat = 5; // mp3

    let audioConfig = null;

    // if (filename) {
    let randomString = Math.random().toString(36).slice(2, 7);
    let filename = `./src/public/speech-${randomString}.mp3`;
    audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
    // }

    let blendData = [];
    let timeStep = 1 / 60;
    let timeStamp = 0;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Subscribes to viseme received event
    synthesizer.visemeReceived = function (s, e) {
      // `Animation` is an xml string for SVG or a json string for blend shapes
      var animation = JSON.parse(e.animation);

      _.each(animation.BlendShapes, (blendArray) => {
        let blend = {};
        _.each(blendShapeNames, (shapeName, i) => {
          blend[shapeName] = blendArray[i];
        });

        blendData.push({
          time: timeStamp,
          blendshapes: blend,
        });
        timeStamp += timeStep;
      });
    };

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        resolve({ blendData, filename: `speech-${randomString}.mp3` });
      },
      (error) => {
        synthesizer.close();
        // console.log(error)
        reject(error);
      }
    );
  });
};

module.exports = textToSpeech;
