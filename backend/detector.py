from ultralytics import YOLO
import cv2
import numpy as np
import base64

LUGGAGE_CLASSES = {
    24: "backpack",
    26: "handbag",
    28: "suitcase"
}

CONFIDENCE_THRESHOLD = 0.4
MATCH_THRESHOLD = 0.55  # similarity score to trigger alert

COLOR_MATCH   = (0, 0, 220)    # red — matched target
COLOR_DEFAULT = (0, 200, 100)  # green — other luggage


class LuggageDetector:
    def __init__(self):
        print("Loading YOLOv8 model...")
        self.model = YOLO("yolov8n.pt")
        print("Model loaded successfully.")
        self.reference_features = None  # stores lost bag features

    # ─────────────────────────────────────────
    # Reference image: extract + store features
    # ─────────────────────────────────────────
    def set_reference_image(self, image_bytes: bytes) -> dict:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"error": "Could not decode reference image"}

        # Detect luggage in reference image
        results = self.model(frame, verbose=False)[0]
        best_box = None
        best_conf = 0

        for box in results.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            if class_id in LUGGAGE_CLASSES and confidence > best_conf:
                best_conf = confidence
                best_box = box

        if best_box is None:
            # No luggage detected — use full image as reference
            roi = frame
            label = "unknown"
        else:
            x1, y1, x2, y2 = map(int, best_box.xyxy[0])
            roi = frame[y1:y2, x1:x2]
            label = LUGGAGE_CLASSES[int(best_box.cls[0])]

        features = self._extract_features(roi)
        features["label"] = label
        self.reference_features = features

        return {
            "success": True,
            "detected_type": label,
            "confidence": round(best_conf * 100, 2),
            "message": f"Reference bag registered as '{label}'"
        }

    # ─────────────────────────────────────────
    # Feature extraction (color histogram)
    # ─────────────────────────────────────────
    def _extract_features(self, roi: np.ndarray) -> dict:
        if roi is None or roi.size == 0:
            return {"hist": None}

        roi_resized = cv2.resize(roi, (64, 64))
        hsv = cv2.cvtColor(roi_resized, cv2.COLOR_BGR2HSV)

        # Compute HSV histogram
        hist_h = cv2.calcHist([hsv], [0], None, [36], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [32], [0, 256])
        hist_v = cv2.calcHist([hsv], [2], None, [32], [0, 256])

        cv2.normalize(hist_h, hist_h)
        cv2.normalize(hist_s, hist_s)
        cv2.normalize(hist_v, hist_v)

        return {
            "hist_h": hist_h,
            "hist_s": hist_s,
            "hist_v": hist_v,
        }

    # ─────────────────────────────────────────
    # Compare two feature sets → similarity 0–1
    # ─────────────────────────────────────────
    def _compare_features(self, f1: dict, f2: dict, label1: str, label2: str) -> float:
        if f1.get("hist_h") is None or f2.get("hist_h") is None:
            return 0.0

        score_h = cv2.compareHist(f1["hist_h"], f2["hist_h"], cv2.HISTCMP_CORREL)
        score_s = cv2.compareHist(f1["hist_s"], f2["hist_s"], cv2.HISTCMP_CORREL)
        score_v = cv2.compareHist(f1["hist_v"], f2["hist_v"], cv2.HISTCMP_CORREL)

        # Weighted color similarity
        color_score = (score_h * 0.5 + score_s * 0.3 + score_v * 0.2)
        color_score = max(0.0, color_score)

        # Type match bonus
        ref_label = self.reference_features.get("label", "unknown")
        type_bonus = 0.25 if (ref_label != "unknown" and ref_label == label2) else 0.0

        final = min(1.0, color_score + type_bonus)
        return round(final, 3)

    # ─────────────────────────────────────────
    # Detect from image bytes (upload page)
    # ─────────────────────────────────────────
    def detect_from_image_bytes(self, image_bytes: bytes) -> dict:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"error": "Could not decode image"}
        return self._run_detection(frame, camera_id="CAM-UPLOAD")

    # ─────────────────────────────────────────
    # Detect from webcam/CCTV frame
    # ─────────────────────────────────────────
    def detect_from_frame(self, frame: np.ndarray, camera_id: str = "CAM-01") -> dict:
        return self._run_detection(frame, camera_id)

    # ─────────────────────────────────────────
    # Core detection + matching logic
    # ─────────────────────────────────────────
    def _run_detection(self, frame: np.ndarray, camera_id: str = "CAM-01") -> dict:
        results = self.model(frame, verbose=False)[0]

        detections = []
        annotated_frame = frame.copy()
        match_found = False
        best_match_score = 0.0

        for box in results.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            if class_id not in LUGGAGE_CLASSES:
                continue
            if confidence < CONFIDENCE_THRESHOLD:
                continue

            label = LUGGAGE_CLASSES[class_id]
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Extract features from this detected bag
            roi = frame[y1:y2, x1:x2]
            bag_features = self._extract_features(roi)

            # Compare with reference if available
            similarity = 0.0
            is_match = False
            if self.reference_features:
                similarity = self._compare_features(
                    self.reference_features,
                    bag_features,
                    self.reference_features.get("label", ""),
                    label
                )
                is_match = similarity >= MATCH_THRESHOLD
                if is_match:
                    match_found = True
                    best_match_score = max(best_match_score, similarity)

            detections.append({
                "label": label,
                "confidence": round(confidence * 100, 2),
                "similarity": round(similarity * 100, 2),
                "is_match": is_match,
                "bbox": [x1, y1, x2, y2],
                "camera_id": camera_id
            })

            # Draw bounding box
            color = COLOR_MATCH if is_match else COLOR_DEFAULT
            thickness = 3 if is_match else 2
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, thickness)

            # Label text
            if self.reference_features and is_match:
                label_text = f"MATCH! {round(similarity * 100)}%"
            elif self.reference_features:
                label_text = f"{label} {round(similarity * 100)}% sim"
            else:
                label_text = f"{label} {round(confidence * 100)}%"

            (text_w, text_h), _ = cv2.getTextSize(
                label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
            )
            cv2.rectangle(
                annotated_frame,
                (x1, y1 - text_h - 10),
                (x1 + text_w + 8, y1),
                color, -1
            )
            cv2.putText(
                annotated_frame, label_text,
                (x1 + 4, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6, (255, 255, 255), 2
            )

            # Extra alert border for match
            if is_match:
                cv2.rectangle(
                    annotated_frame,
                    (x1 - 4, y1 - 4),
                    (x2 + 4, y2 + 4),
                    COLOR_MATCH, 1
                )

        summary = {}
        for d in detections:
            summary[d["label"]] = summary.get(d["label"], 0) + 1

        return {
            "detections": detections,
            "total_items": len(detections),
            "summary": summary,
            "match_found": match_found,
            "best_match_score": round(best_match_score * 100, 2),
            "camera_id": camera_id,
            "reference_active": self.reference_features is not None,
            "annotated_image": self._frame_to_base64(annotated_frame)
        }

    def _frame_to_base64(self, frame: np.ndarray) -> str:
        _, buffer = cv2.imencode(".jpg", frame)
        return base64.b64encode(buffer).decode("utf-8")


detector = LuggageDetector()