import { NextRequest, NextResponse } from "next/server";
import { aiService } from '../../../services/aiService';
import { uploadImageToPinata } from "@/components/utilities";

// Using nodejs runtime for better File/Blob API support
export const runtime = 'nodejs';

/**
 * Convert base64 data URL to File object
 * Uses Node.js Buffer for compatibility with nodejs runtime
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param fileName - Name for the file
 * @returns File object
 */
function dataUrlToFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    throw new Error('Invalid data URL format');
  }
  
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const base64Data = arr[1];
  
  // Convert base64 to Buffer (Node.js compatible)
  // Buffer.from handles base64 decoding natively
  const buffer = Buffer.from(base64Data, 'base64');
  const bytes = new Uint8Array(buffer);
  
  // Create File from Blob
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Extract file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return mimeToExt[mimeType] || '.png';
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, campaignName } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'no_prompt' }, { status: 400 });

    // Generate image using AI service
    // Note: If quota is exceeded, this will return a fallback IPFS URI
    const imageResult = await aiService.generateImage(prompt);
    
    // Check if we got a fallback URI (indicates all models failed)
    const isFallbackUri = imageResult === 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png';
    if (isFallbackUri) {
      console.warn('Image generation failed, using fallback image. This may indicate quota limits.');
    }
    
    // Check if the result is already an IPFS URI or HTTP(S) URL
    if (imageResult.startsWith('ipfs://') || imageResult.startsWith('http://') || imageResult.startsWith('https://')) {
      // Already a URI, return as-is
      return NextResponse.json({ uri: imageResult });
    }
    
    // Check if it's a base64 data URL
    if (imageResult.startsWith('data:image/')) {
      try {
        // Extract MIME type and generate filename
        const mimeMatch = imageResult.match(/data:(image\/[^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const extension = getExtensionFromMimeType(mimeType);
        const fileName = `ai-generated-${Date.now()}${extension}`;
        
        // Convert data URL to File
        const imageFile = dataUrlToFile(imageResult, fileName);
        
        // Upload to Pinata
        const uploadResult = await uploadImageToPinata({
          file: imageFile,
          fileName: fileName,
          fileType: mimeType,
          campaignName: campaignName || 'ai-generated-campaign'
        });
        
        if (uploadResult.success && uploadResult.imageURI) {
          // Convert gateway URL to IPFS URI format for consistency
          const ipfsUri = uploadResult.imageURI.replace('https://gateway.pinata.cloud/ipfs/', 'ipfs://');
          return NextResponse.json({ uri: ipfsUri });
        } else {
          console.error('Upload to Pinata failed:', uploadResult.error);
          // Fallback: return the data URL if upload fails (client can still display it)
          return NextResponse.json({ uri: imageResult });
        }
      } catch (conversionError) {
        console.error('Error converting base64 to file:', conversionError);
        // Fallback: return the data URL if conversion fails
        return NextResponse.json({ uri: imageResult });
      }
    }
    
    // If it's neither a URI nor a data URL, return as-is (might be a fallback IPFS URI)
    return NextResponse.json({ uri: imageResult });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}


