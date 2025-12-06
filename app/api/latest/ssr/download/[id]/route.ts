import { NextRequest, NextResponse } from 'next/server';
import { getRenderState } from '../../lib/render-state';
import path from 'path';
import fs from 'fs';

/**
 * GET /api/latest/ssr/download/[id]
 * Downloads a rendered video file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('📥 SSR download request for ID:', id);
    
    // Get the render state to verify it exists and is completed
    const renderState = getRenderState(id);
    
    // Construct the file path first
    const filePath = path.join(process.cwd(), 'public', 'rendered-videos', `${id}.mp4`);
    
    if (!renderState) {
      // Fallback: if render state is missing but file exists, allow download
      if (fs.existsSync(filePath)) {
        console.log('📥 Render state missing but file exists, allowing download');
        // Continue to download the file
      } else {
        return NextResponse.json(
          { error: `No render found with ID: ${id}. The render may have expired or the server was restarted. Please render the video again to download it.` },
          { status: 404 }
        );
      }
    } else {
      if (renderState.status !== 'done') {
        return NextResponse.json(
          { error: `Render ${id} is not completed yet. Status: ${renderState.status}` },
          { status: 400 }
        );
      }
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `Video file not found for render ${id}` },
          { status: 404 }
        );
      }
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="rendered-video-${id}.mp4"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
    
  } catch (error) {
    console.error('SSR download endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    );
  }
} 