# hgilabs-coding-challenge

## Description

This project processes `.ogg` audio files, converting them into text while performing speaker diarization to distinguish between the agent and caller. It is built using TypeScript and runs on Node.js.

## Features

- Converts an `.ogg` audio file into text.
- Identifies different speakers (agent and caller).
- Uses AssemblyAI for speech recognition and speaker diarization.

## Requirements

- Node.js (>=16.0.0)
- AssemblyAI API Key

## Dependencies

This project uses the following dependencies:

- `axios` - For making HTTP requests.
- `dotenv` - To manage environment variables.
- `typescript` - For TypeScript support.

## API Used

- **AssemblyAI**
- [Official Documentation](https://docs.assemblyai.com)

## Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/figueiredojoaopedro/hgilabs-coding-challenge.git
   cd your-repo
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file and add your AssemblyAI API details:

   ```sh
   API_URL=https://api.assemblyai.com/v2
   API_KEY=your_assemblyai_api_key
   ```

4. Place the `.ogg` audio file in the project directory.

## Usage

Run the script with:

```sh
npm start
```

The process will:

1. Upload the `.ogg` file to AssemblyAI.
2. Transcribe the audio and identify speakers.
3. Save the transcription in `recording-transcript.txt` and log it into the terminal.

## API Specifications (AssemblyAI)

### 1. Upload Audio File

**Endpoint:** `POST /upload`  
Uploads an audio file to AssemblyAI.

### 2. Transcribe Audio

**Endpoint:** `POST /transcript`  
Sends the uploaded audio URL for transcription.

**Request Body:**

```json
{
  "audio_url": "uploaded_audio_url",
  "speaker_labels": true
}
```

### 3. Get Transcription

**Endpoint:** `GET /transcript/{transcription_id}`  
Retrieves the transcription result.

## Error Handling

- If an error occurs during upload or transcription, it is logged.
- If the transcription fails, the script retries until it completes.
