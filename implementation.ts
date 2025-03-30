import * as fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || "";
const API_KEY = process.env.API_KEY || "";

interface WordsResponseAssemblyAI {
  text: string;
  start: number;
  end: number;
  speaker: string;
  confidence: number;
}

const uploadAudio = async (filePath: string): Promise<string> => {
  try {
    const audioData = await fs.promises.readFile(filePath);

    const config = {
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: API_KEY,
      },
    };

    const url = `${API_URL}/upload`;

    const response = await axios.post(url, audioData, config);

    if (response.status !== 200) {
      throw new Error("Failed to upload audio file");
    }

    return response.data.upload_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading audio file",
        error.response?.data,
        error.response?.status,
        error.response?.data
      );
      throw new Error("Error uploading audio file");
    }

    console.error("Error: ", error);
    throw new Error("Error uploading audio file");
  }
};

const transcribeAudio = async (audioUrl: string): Promise<string> => {
  try {
    const transcriptUrl = `${API_URL}/transcript`;

    const transcriptConfig = {
      audio_url: audioUrl,
      speaker_labels: true, // enable to identify speakers
    };

    const config = {
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(transcriptUrl, transcriptConfig, config);

    return response.data.id;
  } catch (error) {
    // console.error("Error transcribing audio file", error);

    if (axios.isAxiosError(error)) {
      console.error(
        "Error transcribing audio file",
        error.response?.data,
        error.response?.status,
        error.response?.data
      );
    }

    throw new Error("Error transcribing audio file");
  }
};

const getTranscript = async (
  transcriptId: string
): Promise<Array<WordsResponseAssemblyAI>> => {
  try {
    const url: string = `${API_URL}/transcript/${transcriptId}`;

    const config = {
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
    };

    let completed = false;
    let transcript: {
      words: Array<WordsResponseAssemblyAI>;
    } | null = null;

    while (!completed) {
      const response = await axios.get(url, config);
      console.log("Transcript status:", response.data.status);

      if (response.data.status === "completed") {
        completed = true;
        transcript = response.data;
      } else if (response.data.status === "error") {
        throw new Error(`Transcription failed: ${response.data.error}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    if (!transcript || transcript.words.length === 0) {
      throw new Error("No words found in the transcript");
    }

    return transcript.words;
  } catch (error) {
    console.error("Error getting transcript", error);
    if (axios.isAxiosError(error)) {
      console.error(
        "Error getting transcript",
        error.response?.data,
        error.response?.status,
        error.response?.data
      );
    }
    throw new Error("Error getting transcript");
  }
};

const saveTranscription = (words: Array<WordsResponseAssemblyAI>): string => {
  try {
    if (!words || words.length === 0) {
      throw new Error("No words found in the transcript");
    }

    let transcript = "recording.ogg transcription:";
    let currentSpeaker = "";

    words.forEach((word) => {
      if (word.speaker !== currentSpeaker) {
        currentSpeaker = word.speaker;
        transcript += `\n\n${word.speaker === "B" ? "AGENT" : "CALLER"}: ${
          word.text
        }`;
      } else {
        transcript += ` ${word.text}`;
      }
    });

    const fileName = `recording-transcript.txt`;

    fs.writeFileSync(fileName, transcript, "utf-8");

    return transcript;
  } catch (error) {
    console.error("Error saving transcription", error);
    if (axios.isAxiosError(error)) {
      console.error(
        "Error saving transcription",
        error.response?.data,
        error.response?.status,
        error.response?.data
      );
    }
    throw new Error("Error saving transcription");
  }
};

const main = async (): Promise<void> => {
  try {
    const filePath = "./recording.ogg";

    console.log("Uploading audio file...");
    const audioUrl = await uploadAudio(filePath);
    console.log("Audio file uploaded successfully:", audioUrl);

    console.log("Transcribing audio file...");
    const transcriptionId = await transcribeAudio(audioUrl);
    console.log("Transcription done successfully...", transcriptionId);

    console.log("Getting transcript...");
    const words = await getTranscript(transcriptionId);

    // generate the transcription based on the speaker labels on a .txt file
    const transcript = saveTranscription(words);

    console.log("Transcription saved successfully:\n", transcript);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "HTTP request failed:",
        error.response?.status,
        error.response?.data
      );
    } else if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unknown error occurred");
    }

    process.exit(1); // Exit the process with an error code
  }
};

(() => {
  main();
})();
