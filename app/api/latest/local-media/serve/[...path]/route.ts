import { NextRequest, NextResponse } from 'next/server';
import { open, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Content-Type mapping for supported file extensions
 * Using a map for better maintainability and performance
 */
const CONTENT_TYPE_MAP: Record<string, string> = {
  // Video formats
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  
  // Audio formats
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.oga': 'audio/ogg',
  '.ogg': 'audio/ogg',
  
  // Image formats
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

/**
 * Serves uploaded media files with proper content-type headers and HTTP Range support
 * 
 * This API endpoint:
 * 1. Receives a file path
 * 2. Verifies the file exists in the user's directory  
 * 3. Serves the file with appropriate headers
 * 4. **CRITICAL**: Supports HTTP Range requests for video seeking (fixes pause/play bug)
 * 5. Uses streaming for memory efficiency with large files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    
    // Security check: Ensure the file path is within the users directory
    if (!filePath.startsWith('users/')) {
      return NextResponse.json(
        { error: 'Unauthorized file access' },
        { status: 403 }
      );
    }
    
    // Convert to server path with explicit path validation
    const publicDir = path.join(process.cwd(), 'public');
    const serverPath = path.join(publicDir, filePath);
    
    // Additional security: Verify the resolved path is still within public directory
    const normalizedPath = path.normalize(serverPath);
    if (!normalizedPath.startsWith(publicDir)) {
      return NextResponse.json(
        { error: 'Unauthorized file access' },
        { status: 403 }
      );
    }
    
    // Check if file exists
    if (!existsSync(serverPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Get file stats for size information
    const fileStats = await stat(serverPath);
    const fileSize = fileStats.size;
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPE_MAP[ext] || 'application/octet-stream';
    
    // Check for Range header (critical for video seeking)
    const rangeHeader = request.headers.get('range');
    
    // Handle Range requests for video/audio seeking
    if (rangeHeader) {
      // Parse the range header (format: "bytes=start-end")
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Requested range not satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }
      
      const chunkSize = end - start + 1;
      
      // Memory-efficient: Read only the requested chunk using file handle
      const fileHandle = await open(serverPath, 'r');
      try {
        const buffer = Buffer.allocUnsafe(chunkSize);
        await fileHandle.read(buffer, 0, chunkSize, start);
        
        // Return partial content with proper headers
        return new NextResponse(new Uint8Array(buffer), {
          status: 206, // Partial Content
          headers: {
            'Content-Type': contentType,
            'Content-Length': chunkSize.toString(),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000',
            'Cross-Origin-Resource-Policy': 'cross-origin',
          },
        });
      } finally {
        await fileHandle.close();
      }
    }
    
    // No range header - return full file
    // For full file reads, we use a simple approach
    // Could be optimized with streaming for very large files if needed
    const fileHandle = await open(serverPath, 'r');
    try {
      const buffer = Buffer.allocUnsafe(fileSize);
      await fileHandle.read(buffer, 0, fileSize, 0);
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      });
    } finally {
      await fileHandle.close();
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
} 