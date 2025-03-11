# Contract Risk Detector
**Contract Risk Detector** is a simple AI tool I built to help you quickly check your contracts or any documents. 
It reads through your contract file, tells you what looks off in plain English, and even suggests some fixes so you don’t need a law degree to figure things out.

## Features
- **Contract Analysis** - Upload a contract to detect risky clauses with detailed risk explanations and actionable suggestions.
- **Non-Contract Detection** - Identifies if a document isn’t a contract and summarizes its content instead(basically becomes a file summurization tool too lol).

## Tech Stack
- **Frontend** React, Tailwind CSS
- **Backend** Node.js, Express.js
- **AI** Google Gemini API (`gemini-1.5-pro`)

## Self-Hosting
- Since the project is under development you can self host this :)

## Setup

#### Backend
- The project uses **Express.js** for the backend so go to (`server`) directory, install all the dependecies and create an `env` file to put your gemini api key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
#### Frontend
- The frontend uses **(React + Vite)**, go to (`frontend`) directory and install all the dependencies then you're good to go.

