// GitHub Media Upload Service
// Uploads images and videos directly to a GitHub repository and returns the raw URL

interface GitHubUploadConfig {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    token: string;
}

interface UploadResult {
    success: boolean;
    url?: string;
    rawUrl?: string;
    error?: string;
    type?: 'image' | 'video';
}

interface MultiUploadResult {
    success: boolean;
    urls: string[];
    errors: string[];
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
// No file size limits - GitHub API has its own limits (100MB per file)

// Get config from environment variables
export function getGitHubConfig(): GitHubUploadConfig {
    return {
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
        branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
        path: process.env.NEXT_PUBLIC_GITHUB_IMAGE_PATH || 'images/products',
        token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
    };
}

// Check if GitHub upload is configured
export function isGitHubConfigured(): boolean {
    const config = getGitHubConfig();
    return !!(config.owner && config.repo && config.token);
}

// Generate unique filename with optional attempt number for retries
function generateFileName(originalName: string, attempt: number = 0): string {
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substring(2, 10);
    const random2 = Math.random().toString(36).substring(2, 10);
    const microtime = performance.now().toString().replace('.', '');
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const suffix = attempt > 0 ? `-retry${attempt}` : '';
    return `${timestamp}-${random1}-${random2}-${microtime}${suffix}.${extension}`;
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

// Check if file is an image
export function isImageFile(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');
}

// Check if file is a video
export function isVideoFile(file: File): boolean {
    return ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/');
}

// Upload single file (image or video) directly to GitHub API (bypasses Vercel 4.5MB limit)
export async function uploadImageToGitHub(file: File): Promise<UploadResult> {
    const isImage = isImageFile(file);
    const isVideo = isVideoFile(file);

    if (!isImage && !isVideo) {
        return { success: false, error: 'Only image and video files are allowed.' };
    }

    const fileSizeMB = file.size / 1024 / 1024;

    // GitHub API has a 100MB limit per file
    if (fileSizeMB > 100) {
        return {
            success: false,
            error: `⚠️ File too large (${fileSizeMB.toFixed(1)}MB)\n\nGitHub API limit: 100MB per file\n\nPlease compress your ${isVideo ? 'video' : 'image'} to under 100MB.`
        };
    }

    // Warn for very large files (50-100MB) - these might be slow
    if (fileSizeMB > 50) {
        console.warn(`⚠️ Large file (${fileSizeMB.toFixed(1)}MB) - upload may take a while`);
    }

    // Log file info
    console.log('📤 Uploading file directly to GitHub:', {
        name: file.name,
        type: file.type,
        size: `${fileSizeMB.toFixed(2)} MB`,
        isVideo
    });

    // Get GitHub config
    const config = getGitHubConfig();

    if (!config.owner || !config.repo || !config.token) {
        return {
            success: false,
            error: 'GitHub not configured. Please check environment variables.'
        };
    }

    try {
        // Convert file to base64
        console.log('🔄 Converting file to base64...');
        const base64Content = await fileToBase64(file);

        // Determine folder based on file type
        const folder = isVideo ? 'videos/products' : config.path;

        // Retry logic for file conflicts (422 errors)
        let attempt = 0;
        const maxAttempts = 10;
        let response;
        let fileName;
        let filePath;

        while (attempt < maxAttempts) {
            // Generate unique filename with attempt number if retrying
            fileName = generateFileName(file.name, attempt);
            filePath = `${folder}/${fileName}`;
            const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

            console.log(`📁 Upload attempt ${attempt + 1}/${maxAttempts}:`, filePath);

            // Upload directly to GitHub API
            response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    message: `Upload product ${isVideo ? 'video' : 'image'}: ${fileName}`,
                    content: base64Content,
                    branch: config.branch,
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

            // Delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ GitHub API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });

            let errorMsg = errorData.message || `GitHub error: ${response.status}`;

            // Detailed error messages
            if (response.status === 401) {
                errorMsg = '🔐 GitHub token is invalid or expired. Please check NEXT_PUBLIC_GITHUB_TOKEN in environment variables.';
            }
            if (response.status === 403) {
                errorMsg = '🔐 GitHub token lacks permissions. Ensure "repo" scope is enabled.';
            }
            if (response.status === 404) {
                errorMsg = `Repository ${config.owner}/${config.repo} not found. Check repository name.`;
            }
            if (response.status === 422) {
                errorMsg = `File conflict after ${maxAttempts} attempts. Please try again.`;
            }
            if (response.status === 500 || response.status === 502 || response.status === 504) {
                errorMsg = `GitHub server error or timeout. File might be too large (${fileSizeMB.toFixed(1)}MB).`;
            }

            return { success: false, error: errorMsg };
        }

        // Construct raw URL
        const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filePath}`;

        console.log('✅ Upload successful:', rawUrl);

        return {
            success: true,
            rawUrl: rawUrl,
            type: isVideo ? 'video' : 'image'
        };
    } catch (error) {
        console.error('❌ Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        };
    }
}

// Upload multiple files (images/videos) to GitHub
export async function uploadMultipleImagesToGitHub(files: File[]): Promise<MultiUploadResult> {
    const urls: string[] = [];
    const errors: string[] = [];

    // Upload sequentially to avoid rate limits
    for (const file of files) {
        const result = await uploadImageToGitHub(file);
        if (result.success && result.rawUrl) {
            urls.push(result.rawUrl);
        } else {
            errors.push(`${file.name}: ${result.error}`);
        }
        // Small delay between uploads to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    return {
        success: urls.length > 0,
        urls,
        errors,
    };
}

// Delete media from GitHub via API route
export async function deleteMediaFromGitHub(urls: string[]): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!urls || urls.length === 0) {
        return { success: true, message: 'No URLs to delete' };
    }

    // Filter only GitHub URLs
    const githubUrls = urls.filter(url =>
        url && typeof url === 'string' && url.includes('raw.githubusercontent.com')
    );

    if (githubUrls.length === 0) {
        return { success: true, message: 'No GitHub URLs to delete' };
    }

    try {
        const response = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: githubUrls }),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Delete failed' };
        }

        return { success: true, message: result.message };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
}
