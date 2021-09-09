import { moveSync, ensureDirSync } from "https://deno.land/std@0.106.0/fs/mod.ts";
import insertIntoDB from "./db.js";
import commentify from "./commentify.js";
import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";


ensureDirSync("logs/")
ensureDirSync("logs/processed")

async function init() {
    let dirEntries = []
    let logs = [];
    for (const dirEntry of Deno.readDirSync('logs')) {
        if (!dirEntry.name.endsWith(".json")) {
            continue;
        }
        dirEntries.push(dirEntry);
        console.log(dirEntry.name);
        const file = 'logs/' + dirEntry.name;
        let log = JSON.parse(Deno.readTextFileSync(file));
        let { output } = await exec(`git ls-files -s --abbrev=7 ${file}`, {output: OutputMode.Capture});
        log['log_git_hash'] = output.split(" ")[1];
        log['log_filename'] = file;
        log['log_time_created'] = log.time_created;
        log['time_created'] = new Date().getTime();
        logs.push(log);
    }

    insertIntoDB(logs)
    commentify();

    for (const dirEntry of dirEntries) {
        moveSync("./logs/" + dirEntry.name, "./logs/processed/" + dirEntry.name)
    }
}

init()