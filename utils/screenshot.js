const puppeteer = require("puppeteer");
const iPhone = puppeteer.devices["iPhone 6"];

async function Screenshot({ url, type, device, path }) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    device === "mobile" && (await page.emulate(iPhone));
    await page.goto(url, { waitUntil: "networkidle0" });
    if (type === "pdf") {
      await page.pdf({ path });
    }
    if (type === "image") {
      await page.screenshot({ path, fullPage: true });
    }
    await browser.close();
  } catch (e) {
    console.log(e);
    return Promise.reject(e);
  }
}

module.exports = Screenshot;
