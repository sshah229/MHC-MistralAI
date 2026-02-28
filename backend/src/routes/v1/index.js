const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const docRoute = require("../v1/doct.route");
const talkRoute = require("./3d.route");
const chatRoute = require("./chat.route");
const emotions = require("./emotions");
const journal = require("./journal");
const reportRoute = require("./report.route");
const router = express.Router();
const planRoute = require("./plan.route");
const dietRoute = require("./diet.route");
const goalRoute = require("./goal.route");

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "",
    route: docRoute,
  },
  {
    path: "/talk",
    route: talkRoute,
  },
  {
    path: "",
    route: chatRoute,
  },
  {
    path: "/report",
    route: reportRoute,
  },
  {
    path: "",
    route: planRoute,
  },
  {
    path: "",
    route: dietRoute,
  },
  {
    path: "",
    route: emotions,
  },
  {
    path: "",
    route: journal,
  },
];

router.use("/goals", goalRoute);

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
// if (config.env === 'development') {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }

module.exports = router;