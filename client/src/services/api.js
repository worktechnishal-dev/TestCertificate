import axios from "axios";

const defaultApiUrl = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});
