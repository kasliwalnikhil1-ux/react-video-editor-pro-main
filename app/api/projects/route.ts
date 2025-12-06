import { NextResponse } from "next/server";

/**
 * Local API proxy endpoint for fetching video projects.
 * 
 * ## Purpose:
 * This endpoint acts as a secure proxy between your frontend and your external projects API.
 * It keeps API keys secure on the server-side and prevents CORS issues.
 * 
 * ## Configuration Required:
 * Set these environment variables in your `.env.local` file:
 * 
 * ```env
 * # Your external projects API endpoint
 * NEXT_PUBLIC_PROJECTS_API_URL=https://www.reactvideoeditor.com/api/projects
 * 
 * # Your API key for authentication (keep this secret!)
 * PROJECTS_API_KEY=your-api-key-here
 * ```
 * 
 * ## How it works:
 * 1. Frontend calls: GET /api/projects?id=123
 * 2. This endpoint receives the request
 * 3. It forwards the request to your external API with the x-api-key header
 * 4. Returns the response back to the frontend
 * 
 * ## Usage from frontend:
 * ```typescript
 * const response = await fetch('/api/projects?id=11127c3f-9081-470f-a46e-c6063a3bfd90');
 * const project = await response.json();
 * ```
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // Build the external API URL from environment variables
    const externalApiUrl = process.env.NEXT_PUBLIC_PROJECTS_API_URL || "https://www.reactvideoeditor.com/api/templates";
    const apiKey = process.env.PROJECTS_API_KEY;
    
    if (!apiKey) {
      console.error("[Projects API] PROJECTS_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }
    
    // Construct URL with query params
    const url = new URL(externalApiUrl);
    if (id) {
      url.searchParams.set("id", id);
    }
    
    console.log(`[Projects API] Fetching from external API: ${url.toString()}`);
    
    // Fetch from external API with authentication
    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": apiKey,
      },
    });
    
    // Forward rate limit headers if present
    const rateLimitHeaders: Record<string, string> = {};
    const rateLimitLimit = response.headers.get("X-RateLimit-Limit");
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    
    if (rateLimitLimit) rateLimitHeaders["X-RateLimit-Limit"] = rateLimitLimit;
    if (rateLimitRemaining) rateLimitHeaders["X-RateLimit-Remaining"] = rateLimitRemaining;
    if (rateLimitReset) rateLimitHeaders["X-RateLimit-Reset"] = rateLimitReset;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Projects API] External API returned ${response.status}: ${errorText}`);
      
      return NextResponse.json(
        { error: `Failed to fetch project state: ${response.statusText}` },
        { status: response.status, headers: rateLimitHeaders }
      );
    }
    
    const data = await response.json();
    console.log(`[Projects API] Successfully fetched project state data:`, {
      projectId: id,
      hasOverlays: !!data.overlays,
      overlaysCount: data.overlays?.length || 0,
      projectName: data.name || 'N/A',
      aspectRatio: data.aspect_ratio || 'N/A'
    });
    
    return NextResponse.json(data, { headers: rateLimitHeaders });
    
  } catch (error) {
    console.error("[Projects API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project state" },
      { status: 500 }
    );
  }
}

