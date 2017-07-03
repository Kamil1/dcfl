import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

export default function API(auth, timeout = 1000) {
  return axios.create({
      baseURL: BASE_URL,
      timeout: timeout
    });
}