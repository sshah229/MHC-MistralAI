const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://emotion-detection2.p.rapidapi.com/emotion-detection',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': '0d9a24480amsh2d0ef1fcd01ae1dp1f6fc7jsn58487d15731c',
    'X-RapidAPI-Host': 'emotion-detection2.p.rapidapi.com'
  },
  data: {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80'
  }
};
const test = async()=>{
    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}
test()
