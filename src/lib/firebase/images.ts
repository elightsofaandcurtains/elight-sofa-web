// GitHub Image Storage Service
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ImageMetadataDocument } from '../../types/firebase';

interface GitHubConfig {
    owner: string;
    repo: string;
    token: string;
    branch: string;
}

export class ImageService {
    private static readonly COLLECTION = 'image-metadata';
    private static readonly GITHUB_CONFIG: GitHubConfig = {
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'elight-sofa-house',
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO || 'product-images',
        token: process.env.GITHUB_TOKEN || '',
        branch: 'main'
    };

    // Upload image to GitHub and store metadata in Firestore
    static async uploadImage(
        file: File,
        category: 'product' | 'team' | 'showroom' | 'hero' | 'company',
        entityId?: string,
        alt?: string
    ): Promise<string> {
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${category}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

            // Convert file to base64
            const base64Content = await this.fileToBase64(file);

            // Upload to GitHub
            const githubUrl = await this.uploadToGitHub(filename, base64Content);

            // Store metadata in Firestore
            const metadata: Omit<ImageMetadataDocument, 'id'> = {
                githubUrl,
                filename,
                alt: alt || file.name,
                category,
                entityId,
                dimensions: await this.getImageDimensions(file),
                fileSize: file.size,
                uploadedAt: serverTimestamp(),
                uploadedBy: 'system' // Replace with actual user ID
            };

            const docRef = await addDoc(collection(db, this.COLLECTION), metadata);
            return docRef.id;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    }

    // Get image URL from GitHub
    static getImageUrl(githubUrl: string): string {
        // Convert GitHub URL to raw URL for direct access
        return githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    // Get images by category
    static async getImagesByCategory(category: string): Promise<ImageMetadataDocument[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('category', '==', category)
            );

            const querySnapshot = await getDocs(q);
            const images: ImageMetadataDocument[] = [];

            querySnapshot.forEach((doc) => {
                images.push({ id: doc.id, ...doc.data() } as ImageMetadataDocument);
            });

            return images;
        } catch (error) {
            console.error('Error fetching images by category:', error);
            throw new Error('Failed to fetch images');
        }
    }

    // Private helper methods
    private static fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    private static async uploadToGitHub(filename: string, content: string): Promise<string> {
        const url = `https://api.github.com/repos/${this.GITHUB_CONFIG.owner}/${this.GITHUB_CONFIG.repo}/contents/${filename}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${filename}`,
                content,
                branch: this.GITHUB_CONFIG.branch
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload to GitHub');
        }

        const data = await response.json();
        return data.content.html_url;
    }

    private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = URL.createObjectURL(file);
        });
    }
}