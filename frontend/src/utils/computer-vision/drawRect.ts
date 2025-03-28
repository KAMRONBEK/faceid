import { Detection } from '../../components/computer-vision/types';

/**
 * Draws detection rectangles on the canvas with appropriate styling
 */
export const drawRect = (detections: Detection[], ctx: CanvasRenderingContext2D): void => {
  if (!detections || detections.length === 0 || !ctx) {
    console.warn('No detections to draw or missing context');
    return;
  }
  
  console.log(`Drawing ${detections.length} detection boxes`);
  
  // Set global canvas settings for better visibility
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // Process each detection
  detections.forEach((detection, index) => {
    if (!detection.bbox || detection.bbox.length !== 4) {
      console.warn(`Detection #${index} has invalid bbox`, detection);
      return;
    }
    
    // Get bounding box values
    const [x, y, width, height] = detection.bbox;
    const text = detection.class || 'unknown';
    
    console.log(`Drawing box #${index}: ${text} at [${Math.round(x)},${Math.round(y)}] size ${Math.round(width)}x${Math.round(height)}`);
    
    try {
      // Determine styling based on detection type
      if (detection.isFace) {
        drawFaceBox(ctx, x, y, width, height, text);
      } else if (detection.isProhibited) {
        drawProhibitedBox(ctx, x, y, width, height, text);
      } else if (detection.isAllowed) {
        drawAllowedBox(ctx, x, y, width, height, text);
      } else {
        drawObjectBox(ctx, x, y, width, height, text, detection.isWarning);
      }
    } catch (error) {
      console.error(`Error drawing box for ${text}:`, error);
    }
  });
};

/**
 * Draw a face detection box
 */
function drawFaceBox(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string
): void {
  // Determine if this is an allowed face
  const isAllowed = !text.includes("Multiple") && !text.includes("Not Allowed");
  
  // Face styling - green for allowed, blue for faces in general
  ctx.lineWidth = 5;
  ctx.strokeStyle = isAllowed ? '#00CC00' : '#0099FF';
  ctx.setLineDash(isAllowed ? [] : [8, 4]); // Solid line for allowed face
  ctx.fillStyle = isAllowed ? 'rgba(0, 204, 0, 0.2)' : 'rgba(0, 153, 255, 0.2)';
  
  // Draw box
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.fill();
  ctx.setLineDash([]);
  
  // Add a solid outline for better visibility
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(x, y, width, height);
  
  // Draw checkmark if allowed
  if (isAllowed && width > 40 && height > 40) {
    const centerX = x + width / 2;
    const centerY = y + height / 2 + height * 0.2; // Position slightly below center
    const size = Math.min(width, height) * 0.2;
    
    // White circle background
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Green checkmark
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX - size / 2, centerY + size);
    ctx.lineTo(centerX + size, centerY - size);
    ctx.strokeStyle = '#00CC00';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  
  // Draw label with background for readability
  ctx.font = 'bold 16px Arial';
  const textWidth = ctx.measureText(text).width;
  
  // Background for text - green for allowed, blue otherwise
  ctx.fillStyle = isAllowed ? '#00CC00' : '#0099FF';
  ctx.fillRect(x, y - 25, textWidth + 14, 25);
  
  // Text border for readability
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y - 25, textWidth + 14, 25);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x + 7, y - 7);
}

/**
 * Draw a prohibited/not allowed object box
 */
function drawProhibitedBox(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string
): void {
  // Prohibited styling (red)
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#FF0000';
  ctx.setLineDash([10, 5]); // Distinctive dashed line
  ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
  
  // Draw box
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.fill();
  ctx.setLineDash([]);
  
  // Add a solid outline for better visibility
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(x, y, width, height);
  
  // Draw prohibition symbol - larger and more visible
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) * 0.3;
  
  // White background circle for the prohibition symbol
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  
  // Red circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 5;
  ctx.stroke();
  
  // Red diagonal line
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.7);
  ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.7);
  ctx.lineWidth = 5;
  ctx.stroke();
  
  // Draw label with background for readability
  ctx.font = 'bold 18px Arial';
  const textWidth = ctx.measureText(text).width;
  
  // Background for text
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(x, y - 30, textWidth + 14, 30);
  
  // Text border for readability
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y - 30, textWidth + 14, 30);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x + 7, y - 8);
}

/**
 * Draw an allowed object box
 */
function drawAllowedBox(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string
): void {
  // Allowed styling (green)
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#00CC00';
  ctx.fillStyle = 'rgba(0, 204, 0, 0.2)';
  
  // Draw box
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.fill();
  
  // Add a solid outline for better visibility
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(x, y, width, height);
  
  // Draw checkmark with white background for visibility
  if (width > 40 && height > 40) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const size = Math.min(width, height) * 0.25;
    
    // White circle background
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Green checkmark
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX - size / 2, centerY + size);
    ctx.lineTo(centerX + size, centerY - size);
    ctx.strokeStyle = '#00CC00';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  
  // Draw label with background for readability
  ctx.font = 'bold 16px Arial';
  const textWidth = ctx.measureText(text).width;
  
  // Background for text
  ctx.fillStyle = '#00CC00';
  ctx.fillRect(x, y - 25, textWidth + 14, 25);
  
  // Text border for readability
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y - 25, textWidth + 14, 25);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x + 7, y - 7);
}

/**
 * Draw a standard object detection box
 */
function drawObjectBox(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string,
  isWarning: boolean = false
): void {
  // Object styling
  ctx.lineWidth = 5;
  ctx.strokeStyle = isWarning ? '#FFA500' : '#888888';
  ctx.fillStyle = isWarning ? 'rgba(255, 165, 0, 0.3)' : 'rgba(136, 136, 136, 0.2)';
  
  // Draw box
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.fill();
  
  // Add a solid outline for better visibility
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(x, y, width, height);
  
  // Draw label with background for readability
  ctx.font = 'bold 16px Arial';
  const textWidth = ctx.measureText(text).width;
  
  // Background for text
  ctx.fillStyle = isWarning ? '#FFA500' : '#888888';
  ctx.fillRect(x, y - 25, textWidth + 14, 25);
  
  // Text border for readability
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y - 25, textWidth + 14, 25);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x + 7, y - 7);
} 