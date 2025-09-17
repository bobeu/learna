import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });

    // For now, return a mock IPFS URI
    // In production, integrate with Pinata, web3.storage, or thirdweb
    const uri = `ipfs://mock/${encodeURIComponent(file.name)}-${Date.now()}`;
    return NextResponse.json({ uri });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}


