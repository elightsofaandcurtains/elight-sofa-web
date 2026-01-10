// API Route for deleting media from GitHub
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';

// Extract file path from GitHub raw URL
function extractPathFromUrl(url: string): string | null {
    // URL format: https://raw.githubusercontent.com/owner/repo/branch/path/to/file.ext
    const match = url.match(/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)$/);
    return match ? match[1] : null;
}

// Get file SHA (required for deletion)
async function getFileSha(path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data.sha;
}

// Delete single file from GitHub
async function deleteFileFromGitHub(url: string): Promise<{ success: boolean; error?: string }> {
    const path = extractPathFromUrl(url);

    if (!path) {
        return { success: false, error: 'Invalid GitHub URL format' };
    }

    const sha = await getFileSha(path);

    if (!sha) {
        // File doesn't exist or already deleted
        return { success: true };
    }

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(apiUrl, {
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
        const error = await response.json().catch(() => ({}));
        return { success: false, error: error.message || `Failed to delete: ${response.status}` };
    }

    return { success: true };
}

export async function POST(request: NextRequest) {
    try {
        if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
            return NextResponse.json(
                { success: false, error: 'GitHub not configured on server' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { urls } = body;

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json(
                { success: false, error: 'No URLs provided' },
                { status: 400 }
            );
        }

        const results: { url: string; success: boolean; error?: string }[] = [];

        // Delete files sequentially to avoid rate limits
        for (const url of urls) {
            if (url && typeof url === 'string' && url.includes('raw.githubusercontent.com')) {
                const result = await deleteFileFromGitHub(url);
                results.push({ url, ...result });
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            message: `Deleted ${successCount} files${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
            results
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Delete failed' },
            { status: 500 }
        );
    }
}
