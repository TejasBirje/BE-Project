import { useCallback, useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import { FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS } from "@mediapipe/face_mesh";

const VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const FACE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";
const OBJECT_DETECTOR_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";

const IRIS_LEFT_INDICES = [...new Set(FACEMESH_LEFT_IRIS.flat())];
const IRIS_RIGHT_INDICES = [...new Set(FACEMESH_RIGHT_IRIS.flat())];

const FLAG_COOLDOWN_MS = {
  TAB_SWITCH: 2000,
  NO_FACE: 3000,
  MULTIPLE_FACES: 3000,
  LOOKING_AWAY: 5000,
  PHONE_DETECTED: 5000,
};

const averagePoint = (landmarks, indices) => {
  if (!Array.isArray(landmarks) || !indices.length) return null;

  let sumX = 0;
  let sumY = 0;
  let valid = 0;

  for (const idx of indices) {
    const p = landmarks[idx];
    if (p) {
      sumX += p.x;
      sumY += p.y;
      valid += 1;
    }
  }

  if (!valid) return null;
  return { x: sumX / valid, y: sumY / valid };
};

const getRatio = (value, min, max) => {
  const span = Math.max(max - min, 1e-6);
  return (value - min) / span;
};

const isLookingAway = (landmarks) => {
  const leftIris = averagePoint(landmarks, IRIS_LEFT_INDICES);
  const rightIris = averagePoint(landmarks, IRIS_RIGHT_INDICES);

  if (!leftIris || !rightIris) return false;

  const leftEyeX = [landmarks[33]?.x, landmarks[133]?.x].filter((v) => Number.isFinite(v));
  const rightEyeX = [landmarks[362]?.x, landmarks[263]?.x].filter((v) => Number.isFinite(v));

  const leftEyeY = [landmarks[159]?.y, landmarks[145]?.y].filter((v) => Number.isFinite(v));
  const rightEyeY = [landmarks[386]?.y, landmarks[374]?.y].filter((v) => Number.isFinite(v));

  if (
    leftEyeX.length < 2 ||
    rightEyeX.length < 2 ||
    leftEyeY.length < 2 ||
    rightEyeY.length < 2
  ) {
    return false;
  }

  const leftXRatio = getRatio(leftIris.x, Math.min(...leftEyeX), Math.max(...leftEyeX));
  const rightXRatio = getRatio(rightIris.x, Math.min(...rightEyeX), Math.max(...rightEyeX));

  const leftYRatio = getRatio(leftIris.y, Math.min(...leftEyeY), Math.max(...leftEyeY));
  const rightYRatio = getRatio(rightIris.y, Math.min(...rightEyeY), Math.max(...rightEyeY));

  const avgHorizontalOffset = (Math.abs(leftXRatio - 0.5) + Math.abs(rightXRatio - 0.5)) / 2;
  const avgVerticalOffset = (Math.abs(leftYRatio - 0.5) + Math.abs(rightYRatio - 0.5)) / 2;

  return avgHorizontalOffset > 0.23 || avgVerticalOffset > 0.28;
};

const containsPhone = (detections = []) =>
  detections.some((detection) =>
    (detection.categories || []).some((category) =>
      (category.categoryName || "").toLowerCase().includes("phone"),
    ),
  );

const useCheatingDetection = ({
  enabled,
  interviewId,
  socketRef,
  detectionIntervalMs = 500,
  lookAwayThresholdMs = 3000,
  enableObjectDetection = false,
} = {}) => {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const objectDetectorRef = useRef(null);
  const lastRunRef = useRef(0);
  const lookingAwaySinceRef = useRef(null);
  const lastFlagAtRef = useRef({});

  const [webcamError, setWebcamError] = useState(null);
  const [faceCount, setFaceCount] = useState(0);
  const [detectorReady, setDetectorReady] = useState(false);
  const [lastFlagType, setLastFlagType] = useState(null);

  const emitFlag = useCallback(
    (type) => {
      const socket = socketRef?.current;
      if (!socket || !interviewId) return;

      const now = Date.now();
      const prev = lastFlagAtRef.current[type] || 0;
      const cooldown = FLAG_COOLDOWN_MS[type] ?? 3000;

      if (now - prev < cooldown) return;

      lastFlagAtRef.current[type] = now;
      setLastFlagType(type);
      socket.emit("cheatingFlag", {
        interviewId,
        type,
        timestamp: now,
      });
    },
    [interviewId, socketRef],
  );

  useEffect(() => {
    if (!enabled) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        emitFlag("TAB_SWITCH");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [emitFlag, enabled]);

  useEffect(() => {
    if (!enabled || !interviewId) {
      setDetectorReady(false);
      return;
    }

    let isActive = true;

    const start = async () => {
      try {
        setWebcamError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { ideal: 15, max: 15 },
          },
          audio: false,
        });

        if (!isActive) return;

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
        if (!isActive) return;

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL_URL },
          runningMode: "VIDEO",
          numFaces: 2,
        });

        if (enableObjectDetection) {
          objectDetectorRef.current = await ObjectDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath: OBJECT_DETECTOR_MODEL_URL },
            runningMode: "VIDEO",
            scoreThreshold: 0.45,
          });
        }

        if (!isActive) return;
        setDetectorReady(true);

        const loop = () => {
          if (!isActive) return;
          frameRef.current = requestAnimationFrame(loop);

          const video = videoRef.current;
          const faceLandmarker = faceLandmarkerRef.current;
          if (!video || !faceLandmarker || video.readyState < 2) return;

          const now = performance.now();
          if (now - lastRunRef.current < detectionIntervalMs) return;
          lastRunRef.current = now;

          const faceResult = faceLandmarker.detectForVideo(video, now);
          const landmarksList = faceResult?.faceLandmarks || [];
          const currentFaceCount = landmarksList.length;
          setFaceCount(currentFaceCount);

          if (currentFaceCount === 0) {
            lookingAwaySinceRef.current = null;
            emitFlag("NO_FACE");
            return;
          }

          if (currentFaceCount > 1) {
            lookingAwaySinceRef.current = null;
            emitFlag("MULTIPLE_FACES");
            return;
          }

          const isAway = isLookingAway(landmarksList[0]);
          if (isAway) {
            if (!lookingAwaySinceRef.current) {
              lookingAwaySinceRef.current = now;
            }
            if (now - lookingAwaySinceRef.current >= lookAwayThresholdMs) {
              emitFlag("LOOKING_AWAY");
            }
          } else {
            lookingAwaySinceRef.current = null;
          }

          if (enableObjectDetection && objectDetectorRef.current) {
            const objResult = objectDetectorRef.current.detectForVideo(video, now);
            if (containsPhone(objResult?.detections || [])) {
              emitFlag("PHONE_DETECTED");
            }
          }
        };

        frameRef.current = requestAnimationFrame(loop);
      } catch (error) {
        setWebcamError(error?.message || "Unable to initialize webcam detection");
        setDetectorReady(false);
      }
    };

    start();

    return () => {
      isActive = false;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      faceLandmarkerRef.current?.close?.();
      objectDetectorRef.current?.close?.();
      faceLandmarkerRef.current = null;
      objectDetectorRef.current = null;
      lookingAwaySinceRef.current = null;
      setDetectorReady(false);
    };
  }, [
    detectionIntervalMs,
    emitFlag,
    enabled,
    enableObjectDetection,
    interviewId,
    lookAwayThresholdMs,
  ]);

  return {
    videoRef,
    webcamError,
    detectorReady,
    faceCount,
    lastFlagType,
  };
};

export default useCheatingDetection;
