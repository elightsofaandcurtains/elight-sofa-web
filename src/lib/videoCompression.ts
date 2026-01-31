// Client-side Video Compression Utility
// Compresses videos in the browser before uploading to GitHub

interface CompressionOptions {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    quality: number;
}

interface CompressionResult {
    success: boolean;
    file?: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    error?: string;
}

/**
 * Compress video file in the browser
 * Uses HTML5 Canvas and MediaRecorder API
 */
export async function compressVideo(
    file: File,
    options: CompressionOptions = {
        maxSizeMB: 90, // Target 90MB to leave buffer for 100MB limit
        maxWidthOrHeight: 1920, // Max 1080p
        quality: 0.8 // 0-1, higher = better quality
    }
): Promise<CompressionResult> {
    const originalSize = file.size;
    const originalSizeMB = originalSize / 1024 / 1024;

    console.log('🎬 Starting video compression:', {
        originalName: file.name,
        originalSize: `${originalSizeMB.toFixed(2)} MB`,
        targetSize: `${options.maxSizeMB} MB`
    });

    // If file is already small enough, return as-is
    if (originalSizeMB <= options.maxSizeMB) {
        console.log('✅ Video already under target size, no compression needed');
        return {
            success: true,
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1
        };
    }

    try {
        // Create video element to load the file
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;

        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;

        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => reject(new Error('Failed to load video'));
        });

        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        console.log('📹 Video info:', {
            duration: `${duration.toFixed(1)}s`,
            resolution: `${width}x${height}`,
            aspectRatio: (width / height).toFixed(2)
        });

        // Calculate target dimensions (maintain aspect ratio)
        let targetWidth = width;
        let targetHeight = height;

        if (width > options.maxWidthOrHeight || height > options.maxWidthOrHeight) {
            if (width > height) {
                targetWidth = options.maxWidthOrHeight;
                targetHeight = Math.round((height / width) * options.maxWidthOrHeight);
            } else {
                targetHeight = options.maxWidthOrHeight;
                targetWidth = Math.round((width / height) * options.maxWidthOrHeight);
            }
        }

        // Calculate target bitrate based on desired file size
        // Formula: bitrate (kbps) = (target size MB * 8 * 1024) / duration (s)
        const targetBitrate = Math.floor((options.maxSizeMB * 8 * 1024) / duration);
        const videoBitrate = Math.min(targetBitrate * 0.9, 5000); // Max 5000 kbps, 90% for video
        const audioBitrate = 128; // 128 kbps for audio

        console.log('🎯 Compression settings:', {
            targetResolution: `${targetWidth}x${targetHeight}`,
            videoBitrate: `${videoBitrate.toFixed(0)} kbps`,
            audioBitrate: `${audioBitrate} kbps`,
            quality: options.quality
        });

        // Create canvas for video processing
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Check if MediaRecorder supports the codec
        const mimeType = 'video/webm;codecs=vp9'; // VP9 for better compression
        const mimeTypeFallback = 'video/webm;codecs=vp8';
        const mimeTypeMp4 = 'video/mp4';

        let selectedMimeType = mimeType;
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.log('⚠️ VP9 not supported, trying VP8...');
            selectedMimeType = mimeTypeFallback;
            if (!MediaRecorder.isTypeSupported(mimeTypeFallback)) {
                console.log('⚠️ VP8 not supported, trying MP4...');
                selectedMimeType = mimeTypeMp4;
                if (!MediaRecorder.isTypeSupported(mimeTypeMp4)) {
                    throw new Error('Browser does not support video compression');
                }
            }
        }

        console.log('🎥 Using codec:', selectedMimeType);

        // Capture canvas stream
        const stream = canvas.captureStream(30); // 30 fps

        // Add audio track from original video
        try {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(video);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            if (destination.stream.getAudioTracks().length > 0) {
                stream.addTrack(destination.stream.getAudioTracks()[0]);
            }
        } catch (audioError) {
            console.warn('⚠️ Could not add audio track:', audioError);
        }

        // Create MediaRecorder with target bitrate
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: videoBitrate * 1000,
            audioBitsPerSecond: audioBitrate * 1000
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms

        // Play video and draw frames to canvas
        video.currentTime = 0;
        await video.play();

        const drawFrame = () => {
            if (video.paused || video.ended) {
                return;
            }
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            requestAnimationFrame(drawFrame);
        };

        drawFrame();

        // Wait for video to finish
        await new Promise<void>((resolve) => {
            video.onended = () => {
                mediaRecorder.stop();
                resolve();
            };
        });

        // Wait for MediaRecorder to finish
        const compressedBlob = await new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: selectedMimeType });
                resolve(blob);
            };
        });

        // Clean up
        URL.revokeObjectURL(videoUrl);

        const compressedSize = compressedBlob.size;
        const compressedSizeMB = compressedSize / 1024 / 1024;
        const compressionRatio = originalSize / compressedSize;

        console.log('✅ Compression complete:', {
            originalSize: `${originalSizeMB.toFixed(2)} MB`,
            compressedSize: `${compressedSizeMB.toFixed(2)} MB`,
            saved: `${(originalSizeMB - compressedSizeMB).toFixed(2)} MB`,
            ratio: `${compressionRatio.toFixed(2)}x`
        });

        // Convert blob to file
        const extension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const compressedFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^/.]+$/, `.compressed.${extension}`),
            { type: selectedMimeType }
        );

        return {
            success: true,
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio
        };

    } catch (error) {
        console.error('❌ Video compression failed:', error);
        return {
            success: false,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 1,
            error: error instanceof Error ? error.message : 'Compression failed'
        };
    }
}

/**
 * Simple compression check - returns true if video needs compression
 */
export function needsCompression(file: File, maxSizeMB: number = 90): boolean {
    const sizeMB = file.size / 1024 / 1024;
    return sizeMB > maxSizeMB;
}

/**
 * Get estimated compression time based on file size
 */
export function estimateCompressionTime(file: File): string {
    const sizeMB = file.size / 1024 / 1024;

    if (sizeMB < 50) return '10-20 seconds';
    if (sizeMB < 100) return '20-40 seconds';
    if (sizeMB < 200) return '40-60 seconds';
    return '1-2 minutes';
}
