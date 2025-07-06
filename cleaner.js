//  npm install snoowrap csv

const snoowrap = require('snoowrap');

const config = {
    clientId: '...',
    clientSecret: '...',
    userAgent: 'user-collector-script by u/...',
    username: '...',
    password: '...', // required for script-type apps
    delayMs: 2000, // 2 sec between actions to stay safe
    limit: 5000    // Max number of comments/posts to process
};

const reddit = new snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    username: config.username,
    password: config.password
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wipeComments() {
    console.log('🔁 Fetching comments...');
    const comments = await reddit.getUser(config.username).getComments({ limit: config.limit });

    for (const comment of comments) {
        if (comment.body === '[deleted]' || comment.body === '.') {
            console.log(`⏭️ Already cleared: ${comment.id}`);
            continue;
        }

        try {
            await comment.edit('.');
            await sleep(500); // Let it settle
            await comment.delete();
            console.log(`🗑️ Deleted comment ${comment.id}`);
        } catch (err) {
            console.error(`❌ Failed to delete comment ${comment.id}:`, err.message);
        }

        await sleep(config.delayMs);
    }
}

async function wipePosts() {
    console.log('🔁 Fetching submissions...');
    const posts = await reddit.getUser(config.username).getSubmissions({ limit: config.limit });

    for (const post of posts) {
        if (post.title === '[deleted]') {
            console.log(`⏭️ Already deleted post: ${post.id}`);
            continue;
        }

        try {
            await post.delete();
            console.log(`🗑️ Deleted post ${post.id}`);
        } catch (err) {
            console.error(`❌ Failed to delete post ${post.id}:`, err.message);
        }

        await sleep(config.delayMs);
    }
}

(async () => {
    console.log('🚨 Starting Reddit content wipe');
    await wipeComments();
    await wipePosts();
    console.log('✅ Done wiping content');
})();
