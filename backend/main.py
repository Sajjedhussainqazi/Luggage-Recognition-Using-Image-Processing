from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import base64
import asyncio

from detector import detector

app = FastAPI(title="LuggageTrack API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "LuggageTrack API is running", "version": "2.0.0"}


# ─────────────────────────────────────────
# Upload lost bag reference image
# ─────────────────────────────────────────
@app.post("/reference/upload")
async def upload_reference(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/webp"]:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid file type. Upload a JPG or PNG image."}
        )
    try:
        image_bytes = await file.read()
        result = detector.set_reference_image(image_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process reference image: {str(e)}"}
        )


# ─────────────────────────────────────────
# Clear reference image
# ─────────────────────────────────────────
@app.delete("/reference/clear")
def clear_reference():
    detector.reference_features = None
    return {"success": True, "message": "Reference image cleared"}


# ─────────────────────────────────────────
# Detect from uploaded image
# ─────────────────────────────────────────
@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/webp"]:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid file type."}
        )
    try:
        image_bytes = await file.read()
        result = detector.detect_from_image_bytes(image_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Detection failed: {str(e)}"}
        )


# ─────────────────────────────────────────
# Live CCTV feed via WebSocket
# ─────────────────────────────────────────
@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await websocket.accept()
    print("CCTV WebSocket client connected")

    try:
        while True:
            data = await websocket.receive_json()

            frame_data = data.get("frame", "")
            camera_id  = data.get("camera_id", "CAM-01")

            try:
                header, encoded = frame_data.split(",", 1)
                frame_bytes = base64.b64decode(encoded)
                np_arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    await websocket.send_json({"error": "Could not decode frame"})
                    continue

            except Exception as e:
                await websocket.send_json({"error": f"Frame error: {str(e)}"})
                continue

            result = detector.detect_from_frame(frame, camera_id)
            await websocket.send_json(result)
            await asyncio.sleep(0.05)

    except WebSocketDisconnect:
        print("CCTV client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()