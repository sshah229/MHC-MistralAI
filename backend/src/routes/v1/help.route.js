router.post("/helpline", async (req ,res)=>{
    const user = req.body.user;
    res.send (`Hold Tight!  ${user} , Help is on your way .`);
  })
  
  