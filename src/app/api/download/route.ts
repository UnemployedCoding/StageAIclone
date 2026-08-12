import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    const urlObj = new URL(imageUrl);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return new NextResponse("Invalid protocol", { status: 400 });
    }
    
    // Prevent fetching from local networks (basic SSRF protection)
    const hostname = urlObj.hostname;
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname === '::1' || 
      hostname.startsWith('10.') || 
      hostname.startsWith('192.168.') || 
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
      hostname === '169.254.169.254'
    ) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }
  } catch (error) {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Determine extension based on content type
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    if (contentType.includes("webp")) ext = "webp";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="stagelumen-room-${Date.now()}.${ext}"`,
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Failed to download image", { status: 500 });
  }
}
