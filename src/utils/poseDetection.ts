import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { PoseLandmarks, RepCounterState } from '../types';

export class PoseDetector {
  private pose!: Pose;
  private camera: Camera;
  private onResults: (results: Results) => void;
  private isInitialized: boolean = false;

  constructor(videoElement: HTMLVideoElement, onResults: (results: Results) => void) {
    this.onResults = onResults;
    
    try {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults(this.onResults);

      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.isInitialized) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('MediaPipe initialization failed:', error);
      // Create a mock camera for demo purposes
      this.camera = {
        start: () => console.log('Demo mode: Camera would start'),
        stop: () => console.log('Demo mode: Camera would stop')
      } as any;
    }
  }

  start() {
    if (this.isInitialized) {
      this.camera.start();
    }
  }

  stop() {
    if (this.isInitialized) {
      this.camera.stop();
    }
  }
}

export const calculateAngle = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
};

export class RepCounter {
  private repCount: number = 0;
  private stage: 'up' | 'down' | 'invalid' = 'up';
  private exerciseType: string;
  private formFeedback: string[] = [];

  constructor(exerciseType: string) {
    this.exerciseType = exerciseType;
  }

  getExerciseType(): string {
    return this.exerciseType;
  }

  processSquat(landmarks: PoseLandmarks): RepCounterState {
    const leftHip = landmarks.LEFT_HIP;
    const leftKnee = landmarks.LEFT_KNEE;
    const leftAnkle = landmarks.LEFT_ANKLE;
    const rightHip = landmarks.RIGHT_HIP;
    const rightKnee = landmarks.RIGHT_KNEE;
    const rightAnkle = landmarks.RIGHT_ANKLE;

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
      return { count: this.repCount, stage: 'invalid', formAccuracy: 0, feedback: ['Body not fully visible'] };
    }

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    this.formFeedback = [];
    let formAccuracy = 100;

    // Check knee alignment
    if (Math.abs(leftKnee.x - leftAnkle.x) > 0.1) {
      this.formFeedback.push('Keep knees aligned with ankles');
      formAccuracy -= 20;
    }

    // Check back posture
    const leftShoulder = landmarks.LEFT_SHOULDER;
    const rightShoulder = landmarks.RIGHT_SHOULDER;
    if (leftShoulder && rightShoulder) {
      const shoulderAngle = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderAngle > 0.1) {
        this.formFeedback.push('Keep shoulders level');
        formAccuracy -= 15;
      }
    }

    // Rep counting logic
    if (avgKneeAngle > 160 && this.stage === 'down') {
      this.stage = 'up';
      this.repCount++;
    } else if (avgKneeAngle < 120 && this.stage === 'up') {
      this.stage = 'down';
    }

    // Form feedback based on angle
    if (avgKneeAngle < 90 && this.stage === 'down') {
      this.formFeedback.push('Don\'t go too low');
      formAccuracy -= 10;
    }

    return {
      count: this.repCount,
      stage: this.stage,
      formAccuracy: Math.max(0, formAccuracy),
      feedback: this.formFeedback
    };
  }

  processPushup(landmarks: PoseLandmarks): RepCounterState {
    const leftShoulder = landmarks.LEFT_SHOULDER;
    const leftElbow = landmarks.LEFT_ELBOW;
    const leftWrist = landmarks.LEFT_WRIST;
    const rightShoulder = landmarks.RIGHT_SHOULDER;
    const rightElbow = landmarks.RIGHT_ELBOW;
    const rightWrist = landmarks.RIGHT_WRIST;

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
      return { count: this.repCount, stage: 'invalid', formAccuracy: 0, feedback: ['Arms not fully visible'] };
    }

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

    this.formFeedback = [];
    let formAccuracy = 100;

    // Check body alignment
    const leftHip = landmarks.LEFT_HIP;
    const rightHip = landmarks.RIGHT_HIP;
    if (leftHip && rightHip && leftShoulder && rightShoulder) {
      const bodyAngle = Math.abs((leftShoulder.y + rightShoulder.y) / 2 - (leftHip.y + rightHip.y) / 2);
      if (bodyAngle > 0.2) {
        this.formFeedback.push('Keep body straight');
        formAccuracy -= 25;
      }
    }

    // Rep counting logic
    if (avgElbowAngle > 160 && this.stage === 'down') {
      this.stage = 'up';
      this.repCount++;
    } else if (avgElbowAngle < 90 && this.stage === 'up') {
      this.stage = 'down';
    }

    // Form feedback
    if (avgElbowAngle < 70 && this.stage === 'down') {
      this.formFeedback.push('Go lower for full range');
      formAccuracy -= 15;
    }

    return {
      count: this.repCount,
      stage: this.stage,
      formAccuracy: Math.max(0, formAccuracy),
      feedback: this.formFeedback
    };
  }

  processLunge(landmarks: PoseLandmarks): RepCounterState {
    const leftHip = landmarks.LEFT_HIP;
    const leftKnee = landmarks.LEFT_KNEE;
    const leftAnkle = landmarks.LEFT_ANKLE;

    if (!leftHip || !leftKnee || !leftAnkle) {
      return { count: this.repCount, stage: 'invalid', formAccuracy: 0, feedback: ['Left leg not fully visible'] };
    }

    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    
    this.formFeedback = [];
    let formAccuracy = 100;

    // Check knee alignment
    if (leftKnee.x < leftAnkle.x) {
      this.formFeedback.push('Don\'t let knee go over toes');
      formAccuracy -= 30;
    }

    // Rep counting logic
    if (kneeAngle > 160 && this.stage === 'down') {
      this.stage = 'up';
      this.repCount++;
    } else if (kneeAngle < 90 && this.stage === 'up') {
      this.stage = 'down';
    }

    return {
      count: this.repCount,
      stage: this.stage,
      formAccuracy: Math.max(0, formAccuracy),
      feedback: this.formFeedback
    };
  }

  reset() {
    this.repCount = 0;
    this.stage = 'up';
    this.formFeedback = [];
  }

  getCount() {
    return this.repCount;
  }
}