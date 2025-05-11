import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";
import {checkUpdateIsPossible, login, setBodyWidth, startBrowser, waitForTimeout} from "./utils.js";
import {createDir} from "./helpers.js";
import {DEV_MODE, PROFILE_DIR} from "./consts.js";
import 'dotenv/config';

const pluginStealth = StealthPlugin();
puppeteer.use(pluginStealth);

const TARGET_URL = 'https://hh.ru/applicant/resumes';

createDir(PROFILE_DIR);

const start = async () => {
    let browser;
    try {
        browser = await startBrowser();

        const page = await browser.newPage();

        await page.goto(TARGET_URL, {waitUntil: "domcontentloaded"});
        console.log(`Page ${TARGET_URL} is opened`);
        await setBodyWidth(page);
        await waitForTimeout(3000);

        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                setBodyWidth(frame);
            }
        });

        await login(page);

        await checkUpdateIsPossible(page);

        if (DEV_MODE) {
            await new Promise(resolve => browser.on('disconnected', resolve));
        } else {
            await browser.close();
            console.log('Success');
            console.log('Browser close');
        }

    } catch (err) {
        console.log(err);
        console.log('end error');
        await browser.close();
    }
};

const TIME = 1000 * 60 * 242; // 4 hour and 2 minutes

setInterval(start, TIME);
start();
