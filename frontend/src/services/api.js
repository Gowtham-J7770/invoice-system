import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/",
});

export default api;