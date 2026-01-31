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

// Upload single file (image or video) to GitHub via API route (bypasses CORS)
export async function uploadImageToGitHub(file: File): Promise<UploadResult> {
    const isImage = isImageFile(file);
    const isVideo = isVideoFile(file);

    if (!isImage && !isVideo) {
        return { success: false, error: 'Only image and video files are allowed.' };
    }

    const fileSizeMB = file.size / 1024 / 1024;

    // Check file size before uploading
    if (fileSizeMB > 100) {
        return {
            success: false,
            error: `File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is 100MB. Please compress the ${isVideo ? 'video' : 'image'} and try again.`
        };
    }

    // Warn for large files
    if (fileSizeMB > 50) {
        console.warn(`⚠️ Large file (${fileSizeMB.toFixed(1)}MB) - upload may take a while`);
    }

    // Log file info
    console.log('📤 Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${fileSizeMB.toFixed(2)} MB`,
        isVideo
    });

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', isVideo ? 'video' : 'image');

        console.log('🔄 Uploading via API route...');

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Non-JSON response:', text.substring(0, 200));
            return {
                success: false,
                error: `Server error: Expected JSON but got ${contentType}. This usually means the API route crashed. Check Vercel logs.`
            };
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('❌ Upload API error:', {
                status: response.status,
                error: result.error
            });
            return { success: false, error: result.error || 'Upload failed' };
        }

        console.log('✅ Upload successful:', result.url);

        return {
            success: true,
            rawUrl: result.url,
            type: result.type
        };
    } catch (error) {
        console.error('❌ Upload error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
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
