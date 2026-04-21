# 🧳 Luggage Recognition Using Image Processing

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35?style=for-the-badge)
![OpenCV](https://img.shields.io/badge/OpenCV-4.x-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)

**An AI-powered real-time lost luggage detection and tracking system using computer vision and live CCTV feed analysis.**

*MCA Final Year Project — Baba Ghulam Shah Badshah University, Rajouri*

### 🌐 [Live Demo](https://luggage-recognition-using-image-pro.vercel.app/) &nbsp;|&nbsp; 🔌 [API](https://luggage-recognition-api.onrender.com) &nbsp;|&nbsp; 📄 [API Docs](https://luggage-recognition-api.onrender.com/docs)

</div>

---

## 📌 Overview

LuggageTrack is a computer vision system designed to help locate lost luggage at airports, railway stations, and other transit hubs. When a passenger loses their bag, they upload a photo of it into the system. The system extracts visual features from the reference image and continuously scans live CCTV footage to find a matching bag — alerting the user or authorities with the camera location and timestamp in real time.

---

## 🎯 Problem Statement

Luggage loss is a major issue at airports and transit hubs worldwide. Traditional methods rely entirely on manual searches by staff, which are slow, error-prone, and inefficient. This system automates the process using AI — reducing search time from hours to seconds.

---

## ✨ Key Features

- 📸 **Reference Registration** — Upload a photo of your lost bag to register it in the system
- 🔍 **Feature Extraction** — Automatically extracts color profile, shape, and object type using YOLOv8 + HSV histograms
- 📡 **Live CCTV Scanning** — Real-time frame-by-frame analysis via WebSocket connection
- 🚨 **Instant Alerts** — Triggers a visual alert with match confidence score, camera ID, and timestamp when bag is found
- 🖼️ **Image Scan Mode** — Upload a static image (e.g. CCTV snapshot) to search for the bag
- 📊 **Detection Log** — Maintains a timestamped log of all match events
- 🎨 **Premium Security UI** — Command-center style dark interface built for operators

---

## 🏗️ System Architecture

```
User uploads lost bag photo
        ↓
Backend extracts visual features
(YOLOv8 object detection + HSV color histogram)
        ↓
Live CCTV feed streams via WebSocket
        ↓
Every detected bag → compared against reference features
        ↓
Similarity score calculated (color + type matching)
        ↓
Score > threshold → MATCH FOUND
        ↓
Real-time alert with Camera ID + Timestamp
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python 3.10+ | Core language |
| FastAPI | REST API + WebSocket server |
| YOLOv8 (Ultralytics) | Object detection |
| OpenCV | Image processing + feature extraction |
| HSV Color Histogram | Visual similarity matching |
| Uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| WebSocket API | Real-time camera feed |
| Fetch API | REST communication |

---

## 📁 Project Structure

```
luggage-recognition-image-processing/
│
├── backend/
│   ├── main.py              # FastAPI app — REST + WebSocket routes
│   ├── detector.py          # YOLOv8 detection + similarity matching logic
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not tracked)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx    # Reference upload + image scan
│   │   │   └── LivePage.jsx      # Live CCTV detection feed
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation
│   │   │   └── ResultCard.jsx    # Detection results display
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Sajjedhussainqazi/Luggage-Recognition-Using-Image-Processing.git
cd Luggage-Recognition-Using-Image-Processing
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Backend runs at → `http://127.0.0.1:8000`

> YOLOv8 model (`yolov8n.pt`) downloads automatically on first run (~6MB)

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → `http://localhost:5173`

---

## 📖 How to Use

### Lost Luggage Search (Image Mode)
1. Go to **Upload & Scan** tab
2. **Step 1** — Upload a clear photo of your lost bag
3. Wait for ✅ "Bag Registered" confirmation
4. **Step 2** — Upload a CCTV snapshot or camera photo to scan
5. System highlights matching bags and shows confidence score

### Live CCTV Detection
1. First register your lost bag in the **Upload & Scan** tab
2. Switch to **Live Detection** tab
3. Click **Activate Detection** to start camera feed
4. System scans every frame automatically
5. 🚨 Alert triggers instantly when your bag is detected with match score + camera ID

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/reference/upload` | Register lost bag reference image |
| DELETE | `/reference/clear` | Clear registered reference |
| POST | `/detect/image` | Detect luggage in uploaded image |
| WS | `/ws/detect` | Live webcam/CCTV frame detection |

> Full interactive API docs → [https://luggage-recognition-api.onrender.com/docs](https://luggage-recognition-api.onrender.com/docs)

---

## 🧠 Detection Logic

The system uses a two-stage matching pipeline:

1. **Object Detection** — YOLOv8 identifies luggage items in each frame (suitcase, backpack, handbag) with bounding boxes and confidence scores

2. **Feature Matching** — For each detected bag, the system:
   - Extracts HSV color histogram (Hue × 36, Saturation × 32, Value × 32 bins)
   - Compares against reference bag histogram using correlation
   - Adds type-match bonus if detected class matches reference class
   - Triggers alert if combined similarity score ≥ 55%

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| 🖥️ Frontend (Vercel) | [https://luggage-recognition-using-image-pro.vercel.app](https://luggage-recognition-using-image-pro.vercel.app) |
| 🔌 Backend API (Render) | [https://luggage-recognition-api.onrender.com](https://luggage-recognition-api.onrender.com) |
| 📄 API Documentation | [https://luggage-recognition-api.onrender.com/docs](https://luggage-recognition-api.onrender.com/docs) |

> ⚠️ Backend is hosted on Render free tier — first request may take 30–60 seconds to wake up.

---

## 🎓 Academic Context

- **Degree:** Master of Computer Applications (MCA)
- **University:** Baba Ghulam Shah Badshah University, Rajouri, J&K
- **Thesis Title:** Luggage Recognition Using Image Processing
- **Year:** 2025

---

## 👨‍💻 Author

**Sajjed Hussain Qazi**
- 📧 sajjedhussainqazi@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/sajjed-hussain-qazi/)
- 🐙 [GitHub](https://github.com/Sajjedhussainqazi)
- 🌐 [Portfolio](https://sajjedhusssainqazi.github.io/portfolio/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ as MCA Final Year Project</p>
  <p>⭐ Star this repo if you found it useful!</p>
</div>
