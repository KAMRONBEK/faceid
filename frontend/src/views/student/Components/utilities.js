export const drawRect = (detections, ctx) => {
  // Loop through each prediction
  detections.forEach((prediction) => {
    // Extract boxes and classes
    let [x, y, width, height] = prediction["bbox"];
    const text = prediction["class"];
    const score = prediction["score"];
    
    // Adjust dimensions for person objects to focus on face area
    if (text === "person") {
      // Make face size proportional to the detected person size
      // Larger person = larger face box
      const personArea = width * height;
      
      // Calculate dynamic face size based on person size
      // For larger detected people, use a larger face percentage
      let faceHeightRatio = 0.3;  // Base height ratio
      
      // Scale ratio based on area - larger people get slightly larger relative face boxes
      if (personArea > 40000) { // Large person
        faceHeightRatio = 0.4;
      } else if (personArea > 20000) { // Medium person
        faceHeightRatio = 0.35;
      }
      
      // Calculate face height first
      const faceHeight = height * faceHeightRatio;
      // Make width proportional to height for proper face aspect ratio (typical face is approx square)
      const faceWidth = faceHeight * 0.95;  // Slightly narrower than height
      
      // Center the face box horizontally
      const faceX = x + (width - faceWidth) / 2;
      // Position face near the top of the body box
      const faceY = y + height * 0.05;
      
      // Update coordinates to focus on face
      x = faceX;
      y = faceY;
      width = faceWidth;
      height = faceHeight;
    } else if (text === "face" || prediction.isFace) {
      // For dedicated face detection, adjust aspect ratio and expand slightly
      
      // Get the larger dimension to use as reference
      const maxDimension = Math.max(width, height);
      
      // Calculate new dimensions to make it more square-like (face-shaped)
      // Typical face aspect ratio is closer to 1:1.2 (width:height)
      const newHeight = maxDimension * 1.0;
      const newWidth = maxDimension * 0.9;
      
      // Calculate expand factors
      const expandX = (newWidth - width);
      const expandY = (newHeight - height);
      
      // Center box on original coordinates
      x = Math.max(0, x - expandX/2);
      y = Math.max(0, y - expandY/2);
      width = newWidth;
      height = newHeight;
    }
    
    // Set styling based on object type
    let strokeColor;
    let fillColor;
    
    if (text === "face" || prediction.isFace || text === "person") {
      // Use green for faces/persons
      strokeColor = "#22c55e";
      fillColor = "#22c55e";
    } else if (prediction.isWarning || text === "cell phone" || text === "book") {
      // Use red for warning objects
      strokeColor = "#ef4444";
      fillColor = "#ef4444";
    } else {
      // Random color for other objects
      const colorHex = Math.floor(Math.random() * 16777215).toString(16);
      strokeColor = "#" + colorHex;
      fillColor = "#" + colorHex;
    }
    
    // Line width based on object type and size
    // Make line thickness proportional to the box size
    const boxSize = width * height;
    const minLineWidth = 2;
    const maxLineWidth = 6;
    // Dynamic line width - larger boxes get thicker lines
    const dynamicLineWidth = Math.min(maxLineWidth, 
      Math.max(minLineWidth, Math.sqrt(boxSize) / 75));
    
    ctx.lineWidth = (text === "face" || prediction.isFace || text === "person") 
      ? dynamicLineWidth 
      : dynamicLineWidth - 1;
    
    // Font settings - dynamic font size based on box size
    const fontSize = Math.min(18, Math.max(12, Math.sqrt(boxSize) / 25));
    ctx.font = `bold ${fontSize}px Arial`;

    // Draw bounding box
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.rect(x, y, width, height);
    ctx.stroke();
    
    // Draw background for label
    const labelText = text === "person" ? "face" : text; // Show "face" instead of "person"
    const textMetrics = ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    // Label size proportional to box size
    const labelHeight = Math.min(25, Math.max(16, fontSize + 8));
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y - labelHeight, textWidth + 10, labelHeight);
    
    // Draw label text
    ctx.fillStyle = "#FFFFFF"; // White text for contrast
    ctx.fillText(labelText, x + 5, y - labelHeight/3);
    
    // Add percentage if available
    if (score) {
      const percentage = Math.round(score * 100);
      const percentText = `${percentage}%`;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${fontSize-4}px Arial`;
      ctx.fillText(percentText, x + textWidth + 12, y - labelHeight/3);
    }
  });
};
