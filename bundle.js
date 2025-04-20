import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import MicrophoneStream from "microphone-stream";
import { Buffer } from "buffer";
import { Sign } from "crypto";

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const SIGNIFY_SERVER_URL = process.env.SIGNIFY_SERVER_URL;

let microphoneStream = undefined;
const language = "en-US";
const SAMPLE_RATE = 44100;
let transcribeClient = undefined;

const createMicrophoneStream = async () => {
  microphoneStream = new MicrophoneStream();
  microphoneStream.setStream(
    await window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    })
  );
};

const createTranscribeClient = () => {
  transcribeClient = new TranscribeStreamingClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
};

const encodePCMChunk = (chunk) => {
  const input = MicrophoneStream.toRaw(chunk);
  let offset = 0;
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};

const getAudioStream = async function* () {
  for await (const chunk of microphoneStream) {
    if (chunk.length <= SAMPLE_RATE) {
      yield {
        AudioEvent: {
          AudioChunk: encodePCMChunk(chunk),
        },
      };
    }
  }
};

const startStreaming = async (language, callback) => {
  const command = new StartStreamTranscriptionCommand({
    LanguageCode: language,
    MediaEncoding: "pcm",
    MediaSampleRateHertz: SAMPLE_RATE,
    AudioStream: getAudioStream(),
  });
  const data = await transcribeClient.send(command);
  for await (const event of data.TranscriptResultStream) {
    const results = event.TranscriptEvent.Transcript.Results;
    if (results.length && !results[0]?.IsPartial) {
      const newTranscript = results[0].Alternatives[0].Transcript;
      console.log(newTranscript);
      callback(newTranscript + " ");
    }
  }
};

export const startRecording = async (callback) => {
  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    alert("Set AWS env variables first.");
    return false;
  }

  if (microphoneStream || transcribeClient) {
    stopRecording();
  }
  createTranscribeClient();
  createMicrophoneStream();
  await startStreaming(language, callback);
};

export const stopRecording = function () {
  if (microphoneStream) {
    microphoneStream.stop();
    microphoneStream.destroy();
    microphoneStream = undefined;
  }
};

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const clearButton = document.getElementById("clear");
const transcriptionDiv = document.getElementById("transcription");

let transcription = "";

console.log("AWS Region: ", AWS_REGION);
console.log("AWS Access Key ID: ", AWS_ACCESS_KEY_ID);
console.log("AWS Secret Access Key: ", AWS_SECRET_ACCESS_KEY);

startButton.addEventListener("click", async () => {
  await startRecording(async (text) => {
    transcription += text;
    transcriptionDiv.innerHTML = transcription;

    // Send final transcript to backend
    const response = await fetch(SIGNIFY_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("Failed to generate pose GIF");
      return;
    }

    const blob = await response.blob();
    const gifUrl = URL.createObjectURL(blob);

    // Display the GIF
    const gifElement = document.getElementById("poseGif");
    gifElement.src = gifUrl;
    gifElement.style.display = "block";
  });
});

stopButton.addEventListener("click", () => {
  stopRecording();
});

clearButton.addEventListener("click", () => {
  transcription = "";
  transcriptionDiv.innerHTML = "";
  const gifElement = document.getElementById("poseGif");
  gifElement.src = "";
  gifElement.style.display = "none";
});
