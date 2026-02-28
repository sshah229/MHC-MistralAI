const express = require("express");
const openai = require("../../utils/open.conf");
const query = require("../../utils/open");
const router = express.Router();
const { getUserFunction } = require("../../controllers/user.controller");
const { User } = require("../../models");
const create = (quiz) => {
  const prompt = `based on the provided cognitive behavioural therapy questionnaire generate an accurate medical report on my mental health in less than 200 words. Also tell me my medical problem. ${quiz}`;
  return prompt;
};

router.post("/", async (req, res) => {
  console.log(req.body.email);
  const user = await getUserFunction(req);
  // console.log(user)
  if (!user.report) {
    res.send({ success: false, message: "report not generated" });
  }
  //const prompt = create(user.name , user.age , user.sex , user.height, user.history , user.condition)
  else res.send({ success: true, report: user.report });
});
router.post("/fetch", async (req, res) => {
  // do the quiz prompt
  const quiz = req.body.quiz;
  const prompt = create(quiz);
  // console.log(prompt)
  const result = await query(prompt);
  // console.log(result);
  await User.updateOne({ email: req.body.email }, { report: result })
    .then((response) => {
      console.log(response);
      res.send({ success: true, message: "report generated" });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
