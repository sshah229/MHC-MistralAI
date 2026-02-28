const express = require('express');
const openai = require('../../utils/open.conf')
const query = require('../../utils/open')
const router = express.Router();
const {getUserFunction} = require('../../controllers/user.controller')
const create = (name , age , sex , height , history , condition ) => {
  const prompt = `based on the provided profile, suggest the type of specialist doctor in one word,name : ${name}, sex : ${sex},age :${age} , height : ${height} , family-medical-history : ${history} ,medical-condition : ${condition} `
  return prompt 
  
}

router.post("/doctors", async(req , res)=>{
    console.log(req.body.email)
   const user = await getUserFunction(req);
  // console.log(user)
   const prompt = create(user.name , user.age , user.sex , user.height, user.history , user.condition)
  console.log(prompt)
  const response =  await query(prompt)
    res.send(response)
  })
  
module.exports = router