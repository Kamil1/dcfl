import axios from 'axios';

const BASE_URL = 'http://www.dcfl.me';

export default function API(auth, timeout = 1000) {
  return axios.create({
      baseURL: BASE_URL,
      timeout: timeout
    });
}