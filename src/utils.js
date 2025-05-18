import puppeteer from "puppeteer-extra";
import {executablePath} from "puppeteer";
import {DEV_MODE, PROFILE_DIR, USER_AGENT} from "./consts.js";

export const waitForTimeout = async (timeout) => new Promise(r => setTimeout(r, timeout));

export const click = async (page) => {
    const vacanciesButtons = await page.$$('a[data-qa="vacancy-serp__vacancy_response"]');

    for (let button of vacanciesButtons) {
        try {
            await button.click();
            await page.waitForSelector('.bloko-modal', {timeout: 5000});
            const target = await page.$('.bloko-modal-footer .bloko-button_kind-primary');
            if (target) {
                await target.click();
            } else {
                await page.mouse.click(100, 100);
            }
            await waitForTimeout(2000);

            if ((await page.$('.bloko-modal-container'))) {
                await page.mouse.click(100, 100);
            }

        } catch (err) {
            console.log(err);
        }
    }
};

export const setBodyWidth = async (page) => {
// Добавляем стиль
    await page.addStyleTag({
        content: `
              body.my-custom-class {
                width: unset !important;
              }
            `
    });

    // Добавляем класс к body
    await page.evaluate(() => {
        document.body?.classList.add('my-custom-class');
    });
};

export const updateResume = async (page) => {
    console.log('Updating resume');
    try {
        const updateButtons = await page.$x('//button/div/span/span[contains(text(), "Поднять в поиске")]');

        if (!updateButtons.length) {
            console.log('Resume update is not available yet', new Date());
            return;
        }

        for (const button of updateButtons) {
            await button.click();
            await waitForTimeout(3000);
            console.log('Resume updated', new Date());
            const modalCloseButton = await page.$('[data-qa="bot-update-resume-modal__close-button"]');
            if (modalCloseButton) {
                await modalCloseButton.click();
                await waitForTimeout(1000);
            }
        }
    } catch (err) {
        console.log('Cannot update resume');
        console.log(err);
    }
};

export const login = async (page) => {
    const loginInput = await page.$('input[name="login"]');
    if (!loginInput) return;
    console.log('Login...');


    await loginInput.evaluate((el) => {
        el.value = '';
        el.dispatchEvent(new Event('input', {bubbles: true}));
    });

    await loginInput.type(process.env.HH_USERNAME, {delay: 15});
    await waitForTimeout(500);

    await page.click('[data-qa="expand-login-by-password-text"]');
    await waitForTimeout(1500);

    const passwordInput = await page.$('[data-qa="login-input-password"');

    if (!passwordInput) {
        throw new Error('Password input not found');
    }

    await passwordInput.type(process.env.HH_PASSWORD, {delay: 15});
    await waitForTimeout(500);

    await page.click('[data-qa="account-login-submit"');

    if (page.url().includes('/login')) {
        throw new Error('Login failed');
    }

    console.log('Login successful');
    await waitForTimeout(7500);
};

export const checkUpdateIsPossible = async (page) => {
    try {
        await waitForTimeout(5000);
        console.log('Check updating...');
        await updateResume(page);
    } catch (e) {
        console.log('checkUpdateIsPossible error');
    }
};

export const startBrowser = async (profileDir = PROFILE_DIR) => {
    console.log('Start browser');

    const args = [
        `--user-agent=${USER_AGENT}`,
    ];

    if (!DEV_MODE) {
        args.push('--no-sandbox');
    }

    return await puppeteer.launch({
        headless: !!process.env.HEADLESS,
        userDataDir: profileDir,
        defaultViewport: {
            width: 1366,
            height: 768,
        },
        executablePath: executablePath(),
        args
    });
};
