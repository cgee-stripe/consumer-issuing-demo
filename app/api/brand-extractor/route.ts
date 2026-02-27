import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrandData {
  companyName: string;
  primaryColor: string;
  logoUrl: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Fetch the website
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/1.0)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract company name
    let companyName = '';

    // Try og:site_name
    companyName = $('meta[property="og:site_name"]').attr('content') || '';

    // Try title tag (remove common suffixes)
    if (!companyName) {
      const title = $('title').text() || '';
      companyName = title
        .replace(/\s*[-|–—]\s*.*/g, '') // Remove everything after dash/pipe
        .replace(/\s*[:|]\s*.*/g, '')    // Remove everything after colon
        .trim();
    }

    // Fallback to domain name
    if (!companyName) {
      const urlObj = new URL(targetUrl);
      companyName = urlObj.hostname
        .replace(/^www\./, '')
        .replace(/\..+$/, '')
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Extract logo URL
    let logoUrl: string | null = null;

    // Try og:image
    logoUrl = $('meta[property="og:image"]').attr('content') || null;

    // Try common logo selectors
    if (!logoUrl) {
      const logoSelectors = [
        'img[class*="logo" i]',
        'img[id*="logo" i]',
        'a[class*="logo" i] img',
        '[class*="logo" i] img',
        'header img',
        'nav img',
      ];

      for (const selector of logoSelectors) {
        const imgSrc = $(selector).first().attr('src');
        if (imgSrc) {
          logoUrl = imgSrc;
          break;
        }
      }
    }

    // Try favicon as fallback
    if (!logoUrl) {
      logoUrl = $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href') ||
                $('link[rel="apple-touch-icon"]').attr('href') ||
                '/favicon.ico';
    }

    // Convert relative URLs to absolute
    if (logoUrl && !logoUrl.startsWith('http')) {
      const urlObj = new URL(targetUrl);
      if (logoUrl.startsWith('//')) {
        logoUrl = urlObj.protocol + logoUrl;
      } else if (logoUrl.startsWith('/')) {
        logoUrl = urlObj.origin + logoUrl;
      } else {
        logoUrl = urlObj.origin + '/' + logoUrl;
      }
    }

    // Download logo and convert to base64
    let logoBase64: string | null = null;
    if (logoUrl) {
      try {
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          const buffer = await logoResponse.arrayBuffer();
          const contentType = logoResponse.headers.get('content-type') || 'image/png';
          logoBase64 = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
        }
      } catch (error) {
        console.error('Failed to download logo:', error);
      }
    }

    // Extract primary color from CSS
    let primaryColor = '#FF6B35'; // Default fallback

    // Try to find CSS variables or theme colors
    const styleContent = $('style').text() + $('link[rel="stylesheet"]').text();

    // Look for common color patterns in CSS
    const colorPatterns = [
      /--color-primary[:\s]+([#\w]+)/i,
      /--primary-color[:\s]+([#\w]+)/i,
      /--brand-color[:\s]+([#\w]+)/i,
      /--theme-color[:\s]+([#\w]+)/i,
    ];

    for (const pattern of colorPatterns) {
      const match = styleContent.match(pattern);
      if (match && match[1]) {
        primaryColor = match[1];
        break;
      }
    }

    // Try meta theme-color
    if (primaryColor === '#FF6B35') {
      const themeColor = $('meta[name="theme-color"]').attr('content');
      if (themeColor && /^#[0-9A-F]{6}$/i.test(themeColor)) {
        primaryColor = themeColor;
      }
    }

    // Try to extract color from inline styles of header/nav
    if (primaryColor === '#FF6B35') {
      const headerBg = $('header, nav, [class*="header" i]').first().css('background-color');
      if (headerBg && headerBg.startsWith('#')) {
        primaryColor = headerBg;
      }
    }

    const brandData: BrandData = {
      companyName,
      primaryColor,
      logoUrl: logoBase64,
    };

    return NextResponse.json({
      success: true,
      data: brandData,
      message: 'Brand data extracted successfully',
    });
  } catch (error: any) {
    console.error('Brand extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to extract brand data',
      },
      { status: 500 }
    );
  }
}
