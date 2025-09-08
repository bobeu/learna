import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });

  // Mock IPFS upload: replace with thirdweb/storage or pinata/web3.storage later
  // Example with thirdweb/storage (pseudo):
  // const storage = new ThirdwebStorage({ secretKey: process.env.THIRDWEB_SECRET });
  // const uri = await storage.upload(file);
  const uri = `ipfs://mock/${encodeURIComponent(file.name)}`;
  return NextResponse.json({ uri });
}


