// import { NextRequest, NextResponse } from "next/server";
// import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

// const client = new NeynarAPIClient({apiKey: process.env.NEYNAR_API_KEY as string});

// export async function POST(request: NextRequest) {
//   const { signerUuid, text } = (await request.json()) as {
//     signerUuid: string;
//     text: string;
//   };

//   try {
//     const { cast } = await client.publishCast({signerUuid, text});
//     return NextResponse.json(
//       { message: `Cast with hash ${cast.hash} published successfully` },
//       { status: 200 }
//     );
//   } catch (err) {
//     if (isApiErrorResponse(err)) {
//       return NextResponse.json(
//         { ...err.response.data },
//         { status: err.response.status }
//       );
//     } else
//       return NextResponse.json(
//         { message: "Something went wrong" },
//         { status: 500 }
//       );
//   }
// }


import { getNeynarClient } from "../../../lib/neynar";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const neynarClient = getNeynarClient();
  const body = await req.json();

  try {
    const cast = await neynarClient.publishCast({
      signerUuid: body.signer_uuid,
      text: body.text,
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}