// Test GitHub Token Validity
// Run: node scripts/test-github-token.js

require('dotenv').config({ path: '.env.local' });

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

console.log('🔍 Testing GitHub Configuration...\n');

console.log('Configuration:');
console.log('  Owner:', GITHUB_OWNER || '❌ NOT SET');
console.log('  Repo:', GITHUB_REPO || '❌ NOT SET');
console.log('  Token:', GITHUB_TOKEN ? `✅ Set (${GITHUB_TOKEN.length} chars)` : '❌ NOT SET');
console.log('  Token Preview:', GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 20)}...` : 'N/A');
console.log('');

if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
    console.error('❌ GitHub not fully configured in .env.local');
    process.exit(1);
}

// Test token by fetching repo info
async function testToken() {
    try {
        console.log('🔄 Testing token by fetching repository info...\n');

        const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        console.log('Response Status:', response.status, response.statusText);

        if (response.status === 200) {
            const data = await response.json();
            console.log('\n✅ Token is VALID!');
            console.log('Repository:', data.full_name);
            console.log('Private:', data.private);
            console.log('Default Branch:', data.default_branch);
            console.log('\n✅ You can upload images/videos to this repository.');
        } else if (response.status === 401) {
            console.error('\n❌ Token is INVALID or EXPIRED');
            console.error('Action: Generate a new token at https://github.com/settings/tokens');
            console.error('Required scope: repo (full control)');
        } else if (response.status === 403) {
            console.error('\n❌ Token lacks PERMISSIONS');
            console.error('Action: Regenerate token with "repo" scope at https://github.com/settings/tokens');
        } else if (response.status === 404) {
            console.error('\n❌ Repository NOT FOUND');
            console.error(`Check: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('\n❌ Unexpected error:', errorData);
        }
    } catch (error) {
        console.error('\n❌ Network error:', error.message);
    }
}

testToken();
