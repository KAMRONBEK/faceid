// This file handles modules without TypeScript definitions

// Allow importing JS modules
declare module '*.js';

// Allow importing JSX files
declare module '*.jsx';

// Allow importing image files
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

// Allow importing CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.css';

// Ensure Typography and Shadows can be imported
declare module './Typography';
declare module './Shadows';
declare module '../theme/Typography';
declare module '../theme/Shadows';

// Allow importing JSON files
declare module '*.json' {
  const value: any;
  export default value;
} 