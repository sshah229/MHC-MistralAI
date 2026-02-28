const axios = require('axios');

const options = {
    method: 'POST',
    url: 'https://smsguru1.p.rapidapi.com/sms',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '0d9a24480amsh2d0ef1fcd01ae1dp1f6fc7jsn58487d15731c',
      'X-RapidAPI-Host': 'smsguru1.p.rapidapi.com'
    },
    data: {
      phone_number: '+918657524003',
      text: 'Message from SMS Api Guru'
    }
  };

const sms =async()=>{
    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}
sms()
