// API Route for uploading media to GitHub (bypasses CORS)
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
const GITHUB_IMAGE_PATH = process.env.NEXT_PUBLIC_GITHUB_IMAGE_PATH || 'images/products';

// Validate token before upload
async function validateToken(): Promise<{ valid: boolean; error?: string }> {
    if (!GITHUB_TOKEN) {
        return { valid: false, error: 'Token not configured' };
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (response.status === 401) {
            return { valid: false, error: 'Token is INVALID or EXPIRED' };
        }

        if (response.status === 403) {
            return { valid: false, error: 'Token lacks permissions (needs "repo" scope)' };
        }

        if (!response.ok) {
            return { valid: false, error: `GitHub API error: ${response.status}` };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Network error connecting to GitHub' };
    }
}

function generateFileName(originalName: string, attempt: number = 0): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const suffix = attempt > 0 ? `-${attempt}` : '';
    return `${timestamp}-${random}${suffix}.${extension}`;
}

export async function POST(request: NextRequest) {
    try {
        console.log('🔥 Upload API called');
        console.log('📋 GitHub config:', {
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            hasToken: !!GITHUB_TOKEN,
            tokenLength: GITHUB_TOKEN?.length,
            branch: GITHUB_BRANCH
        });

        if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
            return NextResponse.json(
                { success: false, error: 'GitHub not configured. Check .env.local file.' },
                { status: 500 }
            );
        }

        // Validate token before attempting upload
        console.log('🔐 Validating GitHub token...');
        const tokenValidation = await validateToken();
        if (!tokenValidation.valid) {
            console.error('❌ Token validation failed:', tokenValidation.error);
            return NextResponse.json(
                {
                    success: false,
                    error: `🔐 GitHub Token Error: ${tokenValidation.error}\n\nPlease:\n1. Go to https://github.com/settings/tokens\n2. Generate new token (classic)\n3. Set expiration to "No expiration"\n4. Check "repo" scope\n5. Update NEXT_PUBLIC_GITHUB_TOKEN in .env.local\n6. Restart dev server`
                },
                { status: 401 }
            );
        }
        console.log('✅ Token is valid');

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileType = formData.get('type') as string || 'image';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        const fileSizeMB = file.size / 1024 / 1024;

        console.log('📤 Processing file:', {
            name: file.name,
            type: file.type,
            size: `${fileSizeMB.toFixed(2)} MB`,
            fileType
        });

        // GitHub API has a 100MB limit per file
        if (fileSizeMB > 100) {
            return NextResponse.json(
                {
                    success: false,
                    error: `File too large (${fileSizeMB.toFixed(1)}MB). GitHub API limit is 100MB. Please compress the ${fileType} and try again.`
                },
                { status: 413 }
            );
        }

        // Warn for large files (50-100MB) - these might timeout
        if (fileSizeMB > 50) {
            console.warn(`⚠️ Large file (${fileSizeMB.toFixed(1)}MB) - upload may be slow or timeout`);
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64Content = Buffer.from(bytes).toString('base64');

        const folder = fileType === 'video' ? 'videos/products' : GITHUB_IMAGE_PATH;

        // Retry logic for file conflicts (422 errors)
        let attempt = 0;
        let maxAttempts = 5;
        let response;
        let fileName;
        let filePath;
        let apiUrl;

        while (attempt < maxAttempts) {
            // Generate filename with attempt number if retrying
            fileName = generateFileName(file.name, attempt);
            filePath = `${folder}/${fileName}`;
            apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

            console.log(`📁 Upload attempt ${attempt + 1}/${maxAttempts}:`, filePath);

            // Upload to GitHub
            response = await fetch(apiUrl, {
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

            console.log('📡 GitHub API response:', response.status, response.statusText);

            // If successful or error is not 422 (file exists), break
            if (response.ok || response.status !== 422) {
                break;
            }

            // 422 error - file exists, retry with new name
            console.log('⚠️ File exists, retrying with new name...');
            attempt++;

            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ GitHub API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });

            let errorMsg = errorData.message || `GitHub error: ${response.status}`;

            // Detailed error messages with instructions
            if (response.status === 401) {
                errorMsg = '🔐 GitHub token is INVALID or EXPIRED!\n\nFix:\n1. Go to https://github.com/settings/tokens\n2. Generate new token (classic)\n3. Set expiration to "No expiration"\n4. Check "repo" scope\n5. Update NEXT_PUBLIC_GITHUB_TOKEN in .env.local\n6. Restart dev server';
            }
            if (response.status === 403) {
                errorMsg = '🔐 GitHub token lacks PERMISSIONS!\n\nFix:\n1. Go to https://github.com/settings/tokens\n2. Edit your token or generate new one\n3. Ensure "repo" scope is checked\n4. Update .env.local\n5. Restart server';
            }
            if (response.status === 404) errorMsg = `Repository ${GITHUB_OWNER}/${GITHUB_REPO} not found. Check repository name in .env.local`;
            if (response.status === 422) errorMsg = `File conflict after ${maxAttempts} attempts. Please try again.`;
            if (response.status === 500) errorMsg = `GitHub server error. File might be too large (${fileSizeMB.toFixed(1)}MB). Try compressing to < 50MB.`;
            if (response.status === 502 || response.status === 504) errorMsg = `Upload timeout. File too large (${fileSizeMB.toFixed(1)}MB). Please compress and try again.`;

            return NextResponse.json({ success: false, error: errorMsg }, { status: response.status });
        }

        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

        console.log('✅ Upload successful:', rawUrl);

        return NextResponse.json({
            success: true,
            url: rawUrl,
            type: fileType
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        );
    }
}
