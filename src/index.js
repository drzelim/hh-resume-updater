import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";
import {executablePath} from "puppeteer";
import {checkUpdateIsPossible, login, setBodyWidth, waitForTimeout} from "./utils.js";
import {CronJob} from 'cron';
import 'dotenv/config';
import {createDir} from "./helpers.js";

const pluginStealth = StealthPlugin();
puppeteer.use(pluginStealth);

const DEV_MODE = !!process.env.DEV_MODE;
const TARGET_URL = 'https://hh.ru/applicant/resumes';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
const PROFILE_DIR = './profiles/hh';

createDir(PROFILE_DIR);

const start = async () => {

    let browser;
    try {
        console.log('Start browser');

        const args = [
            `--user-agent=${USER_AGENT}`,
        ];

        if (!DEV_MODE) {
            args.push('--no-sandbox');
        }

        browser = await puppeteer.launch({
            headless: process.env.HEADLESS,
            userDataDir: PROFILE_DIR,
            defaultViewport: {
                width: 1366,
                height: 768,
            },
            executablePath: executablePath(),
            args
        });

        const page = await browser.newPage();

        await page.setUserAgent(USER_AGENT);

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

const cronExpression = '0 * * * *'; // Every hour

const job =   CronJob.from({
    cronTime: cronExpression,
    onTick: function () {
        console.log(job.nextDate());
        start();
    },
    start: true,
    timeZone: 'Europe/Moscow'
});

console.log(job.nextDate());
