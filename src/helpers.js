import fs from 'fs';
import {CronJob} from "cron";

export const createDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
};

export const startJob = (cronExpression, cb) => {
    const job = CronJob.from({
        cronTime: cronExpression,
        onTick: async function () {
            console.log(job.nextDate());
            await cb();
        },
        start: true,
        timeZone: 'Europe/Moscow'
    });

    return job;
};
