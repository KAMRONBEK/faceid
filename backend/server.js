import express from "express";
import dotenv from "dotenv";
import path from "path";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5005;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://faceid-gold.vercel.app',
    "*"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);

// Production setup
// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));
//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => res.send("Server is running"));
// }
app.get("/", (req, res) => res.send("Backend API is running"));


// Error handling
app.use(notFound);
app.use(errorHandler);

// app.listen(port, () => 
//   console.log(`Server running on http://localhost:${port}`)
// );

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => 
    console.log(`Server running on http://localhost:${port}`)
  );
}

export default app;