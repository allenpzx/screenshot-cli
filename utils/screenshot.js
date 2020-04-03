const puppeteer = require("puppeteer");
const mobile_devices = puppeteer.devices;
const defaultPhone = puppeteer.devices["iPhone 6"];

async function screenshot({
  url,
  type,
  device,
  path,
  mobileType = defaultPhone
}) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    device === "mobile" && (await page.emulate(mobileType));
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

module.exports = { screenshot, mobile_devices };
