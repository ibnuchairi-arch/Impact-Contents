import { SlideData, AspectRatio } from "../types";

/**
 * Reconstructs the slide on a canvas element and exports it.
 */
export const downloadSlideAsImage = async (slide: SlideData, aspectRatio: AspectRatio, hasImage: boolean) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set Dimensions based on Aspect Ratio (High Res)
  let width = 1080;
  let height = 1080;

  if (aspectRatio === AspectRatio.PORTRAIT) {
    height = 1440; // 4:3
  } else if (aspectRatio === AspectRatio.STORY) {
    height = 1920; // 9:16
  }

  canvas.width = width;
  canvas.height = height;

  // 1. Background
  if (hasImage && slide.imageBase64) {
    const img = new Image();
    img.src = `data:image/png;base64,${slide.imageBase64}`;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if image fails
    });
    
    // Draw Image (Cover)
    const scale = Math.max(width / img.width, height / img.height);
    const x = (width / 2) - (img.width / 2) * scale;
    const y = (height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Add Overlay for text readability
    const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

  } else {
    // Clean Mode Background (Blue to Orange Gradient)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb'); // Blue-600
    gradient.addColorStop(1, '#f97316'); // Orange-500
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Mandatory Logo at Top Center
  const LOGO_URL = "https://v0-users-assets.s3.us-east-1.amazonaws.com/uploads/user-22920625/image.png";
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = LOGO_URL;
  
  try {
      await new Promise((resolve) => {
          logo.onload = resolve;
          logo.onerror = resolve; 
      });

      const logoTargetHeight = 80;
      const logoScale = logoTargetHeight / logo.height;
      const logoWidth = logo.width * logoScale;
      
      // White Pill Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const pillPad = 20;
      ctx.beginPath();
      ctx.roundRect(
          (width - logoWidth) / 2 - pillPad, 
          40 - pillPad/2, 
          logoWidth + (pillPad * 2), 
          logoTargetHeight + pillPad, 
          30
      );
      ctx.fill();

      ctx.drawImage(logo, (width - logoWidth) / 2, 40, logoWidth, logoTargetHeight);
  } catch (e) {
      console.warn("Could not load logo for canvas", e);
  }

  // 3. Text Configuration (Dynamic Flow)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  
  // Starting Y position for text content
  // If has image, start lower to reveal image. If clean, start higher.
  let currentY = hasImage ? height * 0.60 : height * 0.35;

  // -- Title --
  ctx.font = 'bold 60px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  currentY = wrapText(ctx, slide.title, width / 2, currentY, width - 100, 70);
  
  // Separator
  currentY += 20;
  ctx.fillStyle = '#fb923c'; // Orange
  ctx.fillRect((width / 2) - 30, currentY, 60, 4);
  currentY += 40;

  // -- Main Text (Explanation 1) --
  ctx.font = '500 40px Inter, sans-serif';
  ctx.fillStyle = '#f8fafc'; // Slate-50
  currentY = wrapText(ctx, slide.mainText, width / 2, currentY, width - 120, 55);
  currentY += 20;

  // -- Content List (Fields) --
  if (slide.contentList && slide.contentList.length > 0) {
    currentY += 10;
    ctx.font = '500 36px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    
    for (const item of slide.contentList) {
      // Draw a subtle background pill for each item to match Preview style
      // We need to measure text to center the pill roughly or just draw a wide one
      // For canvas simplicity, we will just draw text with a bullet or distinct spacing
      
      // Option: Draw a semi-transparent box behind the text line? 
      // It's complex to get width perfectly. Let's just give it spacing and maybe a bullet.
      
      const text = item;
      // Draw text
      currentY = wrapText(ctx, text, width / 2, currentY, width - 150, 50);
      currentY += 20; // Extra spacing between fields
    }
    currentY += 20; // Extra spacing after list
  }

  // -- Secondary Text (Explanation 2) --
  if (slide.secondaryText) {
    ctx.font = 'italic 32px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1'; // Slate-300
    currentY = wrapText(ctx, slide.secondaryText, width / 2, currentY, width - 120, 45);
  }

  // Footer / Branding
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillStyle = '#fb923c'; // Orange-400
  ctx.fillText("IMPACT ENGLISH", width / 2, height - 40);

  // 4. Trigger Download
  const link = document.createElement('a');
  link.download = `impact-content-${slide.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

/**
 * Wraps text and returns the next available Y coordinate.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(/[\s\n]+/);
  // Re-splitting by newline to handle pre-formatted line breaks if any
  const paragraphs = text.split('\n');
  
  let currentY = y;

  for (const paragraph of paragraphs) {
      let line = '';
      const words = paragraph.split(' ');
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
  }
  return currentY;
}