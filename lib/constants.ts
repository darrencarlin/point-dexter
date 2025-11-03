export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://point-dexter.vercel.app"
    : "http://localhost:3000";
