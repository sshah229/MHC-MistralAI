const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, (seconds || 1) * 1000));
const getVideos = (query)=> {
  let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
  query
)}`
  const all_videos = new Set();
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
      });
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("ytd-video-renderer,ytd-grid-video-renderer", {
        timeout: 5000,
      });
      await sleep(1);
      const html = await page.content();
      const $ = cheerio.load(html);
      const results = [];
      $("#contents ytd-video-renderer,#contents ytd-grid-video-renderer").each(
        (i, link) => {
          results.push({
            link:
              "https://www.youtube.com" +
              $(link).find("#video-title").attr("href"),
            title: $(link).find("#video-title").text(),
            channel: $(link).find("#text a").text(),
            channel_link:
              "https://www.youtube.com" + $(link).find("#text a").attr("href"),
          });
        }
      );
      const cleaned = [];
      for (var i = 0; i < results.length; i++) {
        let res = results[i];
        if (res.link && res.link.trim() && res.title && res.title.trim()) {
          res.title = res.title.trim();
          res.rank = i + 1;
          if (all_videos.has(res.title) === false) {
            cleaned.push(res);
          }
          all_videos.add(res.title);
        }
      }
      browser.close();
      return resolve(results);
    } catch (e) {
      return reject(e);
    }
  });
}
module.exports = getVideos