import { DB } from "https://deno.land/x/sqlite@v3.1.1/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.106.0/fs/mod.ts";

// Open a database
ensureDirSync("data/")
const db = new DB("data/comments.db");
db.query(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT,
    comment_id INTEGER,
    log_filename TEXT,
    log_git_hash TEXT,
    log_time_created timestamp,
    time_created timestamp,
    time_updated timestamp,
    ip_address TEXT,
    text TEXT,
    user TEXT,
    auth TEXT,
    visible INTEGER default true,
    FOREIGN KEY(comment_id) REFERENCES comments(id)
  );
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    
    comment_id INTEGER,
    value INTEGER,
    log_filename TEXT,
    log_git_hash TEXT,
    log_time_created timestamp,
    time_created timestamp,
    time_updated timestamp,
    ip_address TEXT,
    user TEXT,
    auth TEXT,
    FOREIGN KEY(comment_id) REFERENCES comments(id)
  )
`);

export default function (logs) {
    // Run a simple query
    for (const logn of logs) {
        let log = { ...logn };
        if (log.action === "comment") {
            delete log.action;
            db.query(
                `INSERT INTO comments (${Object.keys(log).join(", ")}) VALUES (${Object.keys(log).map(log => "?").join(", ")})`,
                Object.values(log)
            );
        } else if (log.action === "upvote" || log.action === "downvote") {
            db.query(
                `INSERT INTO votes ${Object.keys(log)} VALUES (${Object.keys(log)}.map(log => "?").join(", "))`,
                Object.values(log)
            );
        }
    }

}
