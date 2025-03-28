# Computer Vision Components

This folder contains components related to computer vision features using TensorFlow.js.

## Components

### ObjectDetectionCamera

A component that uses webcam input and TensorFlow.js COCO-SSD model to detect objects in real-time. It overlays bounding boxes and labels directly on the webcam feed.

Key features:
- Real-time object detection
- Bounding box visualization with labels
- Performance optimized detection interval

### ObjectDetectionScreen

A screen component that embeds the ObjectDetectionCamera with additional UI controls:
- Toggle switch to enable/disable detection
- Informative UI elements
- Responsive layout

## Usage

Import the components:

```tsx
import { ObjectDetectionCamera, ObjectDetectionScreen } from './components/computer-vision';
```

Use the screen component in your routes:
```tsx
<Route path="/object-detection" element={<ObjectDetectionScreen />} />
```

## Dependencies

This component relies on the following libraries:
- @tensorflow/tfjs
- @tensorflow-models/coco-ssd
- react-webcam

Make sure these are installed in your project. 