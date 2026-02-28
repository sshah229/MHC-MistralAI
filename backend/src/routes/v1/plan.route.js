const express = require("express");
const openai = require("../../utils/open.conf");
const query = require("../../utils/open");
const router = express.Router();
const { getUserFunction } = require("../../controllers/user.controller");
const getVideos = require("../../crawler");
const create = (
  report = "Blood Pressure: High, Anxiety Levels: High, Sugar: Low, Obesity, Loneliness maximum, Crying everyday"
) => {
  const prompt = `based on the provided user mental health report, precisely suggest adequate type of exercises types in one word. Report : ${report}`;
  return prompt;
};
router.post("/plans", async (req, res) => {
  console.log(req.body.email);
  const user = await getUserFunction(req);
  console.log(user);
  if (user?.report === null) {
    const result = await getVideos("yoga");
    res.send(result);
  } else {
    const prompt = create(
      "Name:" +
        user?.name +
        " " +
        "Age: " +
        user?.age +
        " " +
        "Sex: " +
        user?.sex +
        " " +
        "Height: " +
        user?.height +
        " " +
        "History of Diseases:" +
        user?.history +
        " " +
        "Prior medical condition: " +
        user?.condition
    );

    await query(prompt).then(async (results) => {
      const result = await getVideos(results);
      res.send(result);
    });
  }
});

module.exports = router;
