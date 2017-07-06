import axios from 'axios';

const BASE_URL = 'https://dcfl-server.herokuapp.com';

export default function API(auth, timeout = 1000) {
  return axios.create({
      baseURL: BASE_URL,
      timeout: timeout
    });
}