/**
 * API route for fetching Google Font metadata
 * Serves real font data from the populated GOOGLE_FONTS_DATABASE
 * Updated to match the working implementation from src/
 */

import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_FONTS_DATABASE } from '../../../reactvideoeditor/pro/data/google-fonts';

/**
 * GET /api/fonts/[name]
 * Returns font metadata for a specific font family
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const fontFamily = params.name;
    
    // Find the font in the database
    const fontInfo = GOOGLE_FONTS_DATABASE.find(
      (font) => font.fontFamily === fontFamily
    );
    
    if (!fontInfo) {
      return NextResponse.json(
        { error: `Font "${fontFamily}" not found in database` },
        { status: 404 }
      );
    }

    // Return the actual font info
    return NextResponse.json(fontInfo, {
      headers: {
        // Cache for 1 hour to reduce API calls
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Font API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

