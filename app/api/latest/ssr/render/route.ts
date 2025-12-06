import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { startRendering } from '../lib/remotion-renderer';
import { collectFontInfoFromOverlays } from '../../../../reactvideoeditor/pro/utils/text/collect-font-info-from-items';

// Define the request schema based on the VideoRenderer interface
const RenderRequest = z.object({
  id: z.string(),
  inputProps: z.object({
    overlays: z.array(z.any()),
    durationInFrames: z.number(),
    fps: z.number(),
    width: z.number(),
    height: z.number(),
    src: z.string().optional(),
    selectedOverlayId: z.number().nullable().optional(),
    setSelectedOverlayId: z.any().optional(),
    changeOverlay: z.any().optional(),
    baseUrl: z.string().optional(),
  }),
});

/**
 * POST /api/latest/ssr/render
 * Starts a new video render using Remotion SSR
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now();
    const body = await request.json();
    console.log(`🎬 [${new Date().toISOString()}] SSR render request received:`, body);
    
    // Validate the request
    const validatedData = RenderRequest.parse(body);
    
    // Collect font infos before rendering
    const fontInfos = collectFontInfoFromOverlays(validatedData.inputProps.overlays || []);
    
    // Add fontInfos to inputProps
    const inputPropsWithFonts = {
      ...validatedData.inputProps,
      fontInfos: fontInfos,
    };
    
    // Start the rendering process
    const renderId = await startRendering(
      validatedData.id,
      inputPropsWithFonts
    );
    
    const endTime = performance.now();
    // Return the response in the format expected by VideoRenderer
    console.log(`🎬 [${new Date().toISOString()}] SSR render started with ID: ${renderId} (took ${(endTime - startTime).toFixed(2)}ms)`);
    return NextResponse.json({
      renderId,
      bucketName: undefined, // Not used for SSR rendering
    });
    
  } catch (error) {
    console.error('SSR render endpoint error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to start render' },
      { status: 500 }
    );
  }
} 