// GitHub Image Upload Service
// Uploads images directly to a GitHub repository and returns the raw URL

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
}

interface MultiUploadResult {
    success: boolean;
    urls: string[];
    errors: string[];
}

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

// Generate unique filename
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
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

// Upload single image to GitHub
export async function uploadImageToGitHub(file: File): Promise<UploadResult> {
    const config = getGitHubConfig();

    if (!config.owner || !config.repo || !config.token) {
        return { success: false, error: 'GitHub upload not configured.' };
    }

    if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Only image files are allowed.' };
    }

    if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB.' };
    }

    try {
        const fileName = generateFileName(file.name);
        const filePath = `${config.path}/${fileName}`;
        const base64Content = await fileToBase64(file);

        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: `Upload product image: ${fileName}`,
                content: base64Content,
                branch: config.branch,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload to GitHub');
        }

        const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filePath}`;

        return { success: true, rawUrl };
    } catch (error) {
        console.error('GitHub upload error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
}

// Upload multiple images to GitHub
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
