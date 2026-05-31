import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/backend/",

  //////////////////////////////////////////////////
  // IMPORTANT FOR OTP SESSION
  //////////////////////////////////////////////////

  withCredentials: true,
});

export default api;