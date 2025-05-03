import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";
import {executablePath} from "puppeteer";
import {checkResume, login, setBodyWidth, updateResume, waitForTimeout} from "./utils.js";
import 'dotenv/config';

const pluginStealth = StealthPlugin();
puppeteer.use(pluginStealth);

const TARGET_URL = 'https://hh.ru/applicant/resumes';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

const start = async () => {
    let browser
    try {
        console.log('Start browser');

        browser = await puppeteer.launch({
            headless: true,
            userDataDir: './profiles/hh2',
            defaultViewport: {
                width: 1366,
                height: 768,
            },
            executablePath: executablePath(),
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

        await checkResume(page);

        setInterval(async () => {
            checkResume(page);
        }, 1000 * 60 * 60);

        // await new Promise(resolve => browser.on('disconnected', resolve));

    } catch (err) {
        console.log(err);
        console.log('end error');
        await browser.close();
        start()
    }
};

start();

