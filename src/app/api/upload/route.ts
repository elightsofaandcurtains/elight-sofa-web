// API Route for uploading media to GitHub (bypasses CORS)
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
const GITHUB_IMAGE_PATH = process.env.NEXT_PUBLIC_GITHUB_IMAGE_PATH || 'images/products';

function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
}

export async function POST(request: NextRequest) {
    try {
        if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
            return NextResponse.json(
                { success: false, error: 'GitHub not configured on server' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileType = formData.get('type') as string || 'image';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64Content = Buffer.from(bytes).toString('base64');

        // Generate filename and path
        const fileName = generateFileName(file.name);
        const folder = fileType === 'video' ? 'videos/products' : GITHUB_IMAGE_PATH;
        const filePath = `${folder}/${fileName}`;

        // Upload to GitHub
        const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: `Upload product ${fileType}: ${fileName}`,
                content: base64Content,
                branch: GITHUB_BRANCH,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GitHub API error:', response.status, errorData);

            let errorMsg = errorData.message || `GitHub error: ${response.status}`;
            if (response.status === 401) errorMsg = 'GitHub token invalid or expired';
            if (response.status === 403) errorMsg = 'GitHub token lacks permissions';
            if (response.status === 404) errorMsg = 'Repository not found';

            return NextResponse.json({ success: false, error: errorMsg }, { status: response.status });
        }

        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

        return NextResponse.json({
            success: true,
            url: rawUrl,
            type: fileType
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        );
    }
}
