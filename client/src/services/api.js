import axios from "axios";

const defaultApiUrl =
  typeof window === "undefined"
    ? "http://localhost:5000/api"
    : `${window.location.protocol}//${window.location.hostname}:5000/api`;

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});
