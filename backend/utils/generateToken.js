import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Cookie sozlamalari - localhost uchun optimallashtirilgan
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false, // localhost uchun false qilish kerak
    sameSite: "lax", // strict o'rniga lax
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
    domain: undefined, // maxsus domain belgilash
    path: "/",
  });

  return token;
};

export default generateToken;