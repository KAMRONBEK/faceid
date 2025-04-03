// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isTeacher: boolean;
  createdAt: string;
  updatedAt: string;
}

// New UserInfo interface that matches the backend response
export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  message?: string;
  faceEmbedding?: number[]; // Face embedding for student users
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword?: string;
}

// Exam related types
export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  image?: string;
}

export interface Test {
  _id: string;
  title: string;
  questions: Question[];
  duration: number;
  passingScore: number;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  tests: Test[];
  creator: User | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Result related types
export interface TestResult {
  testId: string;
  score: number;
  answers: number[];
  passed: boolean;
  timeTaken: number;
}

export interface ExamResult {
  _id: string;
  examId: Exam | string;
  userId: User | string;
  results: TestResult[];
  overallScore: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  total: number;
} 