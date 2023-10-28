import playwright, { Cookie, Page } from "playwright-core";
import { addExtra } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";

// @ts-expect-error this plugins dont have types
import chromeApp from "puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js"; // @ts-expect-error
import chromeCsi from "puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js"; // @ts-expect-error
import chromeLoadTimes from "puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js"; // @ts-expect-error
import chromeRuntime from "puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js"; // @ts-expect-error
import defaultArgs from "puppeteer-extra-plugin-stealth/evasions/defaultArgs/index.js"; // @ts-expect-error
import iframeContentWindow from "puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js"; // @ts-expect-error
import mediaCodecs from "puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js"; // @ts-expect-error
import navigatorHardwareConcurrency from "puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js"; // @ts-expect-error
import navigatorLanguages from "puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js"; // @ts-expect-error
import navigatorPermissions from "puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js"; // @ts-expect-error
import navigatorPlugins from "puppeteer-extra-plugin-stealth/evasions/navigator.plugins/index.js"; // @ts-expect-error
import navigatorWebdriver from "puppeteer-extra-plugin-stealth/evasions/navigator.webdriver/index.js"; // @ts-expect-error
import sourceurl from "puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js"; // @ts-expect-error
import userAgentOverride from "puppeteer-extra-plugin-stealth/evasions/user-agent-override/index.js"; // @ts-expect-error
import webglVendor from "puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js"; // @ts-expect-error
import windowOuterdimensions from "puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js"; // @ts-expect-error
import userDataDir from "puppeteer-extra-plugin-user-data-dir/index.js"; // @ts-expect-error
import userPreferences from "puppeteer-extra-plugin-user-preferences/index.js";
import { CancelToken } from "./CancelToken";
// import { useFirebaseAdmin } from "~/server/useFirebaseAdmin";

chromium.setHeadlessMode = true;

const pluginMap = {
  "stealth/evasions/chrome.app": chromeApp,
  "stealth/evasions/chrome.csi": chromeCsi,
  "stealth/evasions/chrome.loadTimes": chromeLoadTimes,
  "stealth/evasions/chrome.runtime": chromeRuntime,
  "stealth/evasions/defaultArgs": defaultArgs,
  "stealth/evasions/iframe.contentWindow": iframeContentWindow,
  "stealth/evasions/media.codecs": mediaCodecs,
  "stealth/evasions/navigator.hardwareConcurrency":
    navigatorHardwareConcurrency,
  "stealth/evasions/navigator.languages": navigatorLanguages,
  "stealth/evasions/navigator.permissions": navigatorPermissions,
  "stealth/evasions/navigator.plugins": navigatorPlugins,
  "stealth/evasions/navigator.webdriver": navigatorWebdriver,
  "stealth/evasions/sourceurl": sourceurl,
  "stealth/evasions/user-agent-override": userAgentOverride,
  "stealth/evasions/webgl.vendor": webglVendor,
  "stealth/evasions/window.outerdimensions": windowOuterdimensions,
  "user-preferences": userPreferences,
  "user-data-dir": userDataDir,
};

export const createBrowser = () => {
  return playwright.chromium;
  const chrome = addExtra(playwright.chromium);

  for (const [key, value] of Object.entries(pluginMap)) {
    chrome.plugins.setDependencyResolution(key, value);
  }

  chrome.use(stealthPlugin());
  return chrome;
};

export const launchBrowser = async (
  cb: (options: { page: Page }) => Promise<void>,
  cookies: Cookie[] = [],
  cancelToken: CancelToken
) => {
  const exec = await chromium.executablePath();
  console.log("Executable path", exec);
  return createBrowser()
    .launch({
      headless: chromium.headless as boolean,
      slowMo: 100,
      args: chromium.args,
      executablePath: exec,
      // executablePath: '/ms-playwright/chromium-1076/chrome-linux/chrome',
    })
    .then(async (browser) => {
      // const cancellation = cancelToken.onRevoke(() => browser.close());
      const context = await browser.newContext({
        recordVideo: {
          dir: "./recordings",
          size: { width: 640, height: 480 },
        },
      });
      const page = await context.newPage();
      // const context = page.context();
      context.clearCookies();

      try {
        context.addCookies(cookies);
      } catch (e) {
        console.warn("Failed to add cookies", e);
      }

      const path = await page.video()?.path();

      const browserRun = cb({ page });

      return Promise.race([cancelToken.promise, browserRun]).finally(
        async () => {
          await browser.close();

          if (!path) {
            console.warn("No recording path");
            return;
          }

          try {
            // upload recording to google cloud storage
            // await useFirebaseAdmin()
            //   .storage()
            //   .bucket("gs://aborise-mvp.appspot.com")
            //   .upload(path, {
            //     onUploadProgress: (progressEvent: any) => {
            //       console.log("Progress", progressEvent);
            //     },
            //   })
            //   .catch((e) => {
            //     console.error("Failed to upload recording", e);
            //   });
          } catch (e) {
            console.error("Failed to save recording", e);
          }
        }
      );
    });
};
