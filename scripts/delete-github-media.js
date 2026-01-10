// Script to delete all images and videos from GitHub repository
// Run with: node scripts/delete-github-media.js

require('dotenv').config({ path: '.env.local' });

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';

if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
    console.error('❌ Missing GitHub configuration in .env.local');
    console.error('Required: NEXT_PUBLIC_GITHUB_OWNER, NEXT_PUBLIC_GITHUB_REPO, NEXT_PUBLIC_GITHUB_TOKEN');
    process.exit(1);
}

console.log(`\n🔧 GitHub Config:`);
console.log(`   Owner: ${GITHUB_OWNER}`);
console.log(`   Repo: ${GITHUB_REPO}`);
console.log(`   Branch: ${GITHUB_BRANCH}\n`);

async function getContents(path = '') {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return [];
        }
        throw new Error(`Failed to get contents: ${response.status}`);
    }

    return response.json();
}

async function deleteFile(path, sha) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `Delete: ${path}`,
            sha: sha,
            branch: GITHUB_BRANCH,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete ${path}: ${error.message}`);
    }

    return true;
}

async function deleteAllInFolder(folderPath) {
    console.log(`\n📂 Checking folder: ${folderPath || '(root)'}`);

    try {
        const contents = await getContents(folderPath);

        if (!Array.isArray(contents)) {
            console.log(`   ⚠️ Not a folder or empty`);
            return 0;
        }

        let deletedCount = 0;

        for (const item of contents) {
            if (item.type === 'file') {
                // Check if it's an image or video file
                const ext = item.name.split('.').pop()?.toLowerCase();
                const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov', 'avi', 'mkv'];

                if (mediaExtensions.includes(ext)) {
                    console.log(`   🗑️ Deleting: ${item.path}`);
                    try {
                        await deleteFile(item.path, item.sha);
                        deletedCount++;
                        // Small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (err) {
                        console.log(`   ❌ Failed: ${err.message}`);
                    }
                }
            } else if (item.type === 'dir') {
                // Recursively delete in subdirectories
                deletedCount += await deleteAllInFolder(item.path);
            }
        }

        return deletedCount;
    } catch (error) {
        console.log(`   ⚠️ Error: ${error.message}`);
        return 0;
    }
}

async function main() {
    console.log('🚀 Starting GitHub media cleanup...\n');

    let totalDeleted = 0;

    // Delete from images folder
    totalDeleted += await deleteAllInFolder('images');

    // Delete from videos folder
    totalDeleted += await deleteAllInFolder('videos');

    console.log(`\n✅ Done! Deleted ${totalDeleted} media files.`);
}

main().catch(console.error);
