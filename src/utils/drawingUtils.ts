import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

export const drawPose = (
  ctx: CanvasRenderingContext2D,
  results: any,
  width: number,
  height: number,
  feedback: string[]
) => {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  
  if (results.poseLandmarks) {
    // Draw connections
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00ff88',
      lineWidth: 2,
    });
    
    // Draw landmarks
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#ff0000',
      lineWidth: 1,
      radius: 3,
    });

    // Highlight problematic joints if there's feedback
    if (feedback.length > 0) {
      results.poseLandmarks.forEach((landmark: any, index: number) => {
        if (shouldHighlightJoint(index, feedback)) {
          ctx.beginPath();
          ctx.arc(landmark.x * width, landmark.y * height, 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#ff4444';
          ctx.fill();
        }
      });
    }
  }
  
  ctx.restore();
};

const shouldHighlightJoint = (index: number, feedback: string[]): boolean => {
  // Highlight specific joints based on feedback
  const kneeIndices = [25, 26]; // LEFT_KNEE, RIGHT_KNEE
  const shoulderIndices = [11, 12]; // LEFT_SHOULDER, RIGHT_SHOULDER
  const elbowIndices = [13, 14]; // LEFT_ELBOW, RIGHT_ELBOW
  
  if (feedback.some(f => f.includes('knee'))) {
    return kneeIndices.includes(index);
  }
  if (feedback.some(f => f.includes('shoulder'))) {
    return shoulderIndices.includes(index);
  }
  if (feedback.some(f => f.includes('elbow'))) {
    return elbowIndices.includes(index);
  }
  
  return false;
};