import { DB } from "https://deno.land/x/sqlite@v3.1.1/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.106.0/fs/mod.ts";

export default function () {
    let fields = [
        'post_id', 'log_git_hash', 'log_time_created', 'text', 'time_created'
    ]
    const db = new DB("data/comments.db");
    const posts = {};
    const comments = db.query(`
        SELECT ${fields.join(", ")} from comments where visible = true;
    `).map((arr) => {
        let comment = {};
        for (let i = 0; i < arr.length; i++) {
            comment[fields[i]] = arr[i];
        }
        let { post_id } = comment;
        if (post_id) {
            if (!posts[post_id]) {
                posts[post_id] = []
            }
            posts[post_id].unshift(comment);
        }
        return comment;
    })
    Deno.writeTextFile("data/comments.json", JSON.stringify({
        posts
    }, null, 4));
    ensureDirSync("data/hugo")
    for (let comment of comments) {
        Deno.writeTextFile(`data/hugo/${comment.log_git_hash}.md`, JSON.stringify(comment, null, 4) + "\n");
    }
}