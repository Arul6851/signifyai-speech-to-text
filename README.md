# 🎙️ SignifyAI Frontend

SignifyAI is a speech-to-ASL (American Sign Language) converter that allows users to speak or type English sentences and view them translated into sign language using animated GIFs. This frontend is built using **HTML**, **CSS**, and **Vanilla JavaScript**.

---

## 🚀 Features

- 🎤 **Start/Stop Recording** with microphone
- 🧠 Speech is transcribed using **Whisper** (via backend)
- 📤 Text input support for manual ASL generation
- 🖼️ Animated sign language (pose GIF) display
- 💡 Clean, dark-themed, modern UI

---

## 📂 Project Structure

```
.
├── index.html         # Main webpage
├── style.css          # Monochrome dark theme styling
├── bundle.js          # Compiled JS with microphone + text handling
├── .env               # Environment config (optional for local dev)
```

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/signifyai-frontend.git
cd signifyai-speech-to-text
```

### 2. Install dependencies

```bash
npm install
```

> This installs Webpack and related modules for local development.

### 3. Run the project

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Environment Variables

Create a `.env` file in the root directory (optional for connecting to backend APIs):

```
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🎨 UI Preview

- Dark-mode layout
- Stylish buttons and input
- Centered transcription output
- Responsive pose GIF display

---

## ⚠️ Note

- This project **only covers the frontend**.
- It depends on the backend server that handles:
  - Transcribing speech via OpenAI Whisper
  - Converting text to gloss
  - Generating pose GIFs

Make sure your backend server is running and accessible via the specified `VITE_BACKEND_URL`.

---
