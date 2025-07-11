// // To run this code you need to install the following dependencies:
// // npm install @google/genai
// // npm install -D @types/node

// import { GoogleGenAI } from '@google/genai';
// import { writeFile } from 'fs';

// function saveBinaryFile(fileName: string, content: Buffer) {
//   writeFile(fileName, content, 'utf8', (err) => {
//     if (err) {
//       console.error(`Error writing file ${fileName}:`, err);
//       return;
//     }
//     console.log(`File ${fileName} saved to file system.`);
//   });
// }

// export async function generateImage(prompt: string) {
//   const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API, });
// gemini-2.5-flash
// gemini-2.0-flash-preview-image-generation
// imagen-3.0-generate-002
// gemini-2.0-flash-001
//   const response = await ai.models.generateImages({
//     model: 'models/imagen-4.0-generate-preview-06-06',
//     prompt: `I am running a quiz project. I want to generate images based on the Hardhat with a difficulty: "Medium". I prefer a light theme with a cyan and purple blend.
// It should be a 3D isometric illustration of a simple, friendly social network icon representing 'Hardhat', with clear, smooth lines. The scene features a bright blend of cyan and purple gradient colors. The text 'Hardhat' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banners. High resolution, 1:1 aspect ratio. 
// `,
//     config: {
//       numberOfImages: 1,
//       outputMimeType: 'image/jpeg',
//       aspectRatio: '1:1',
//     },
//   });

//   if (!response?.generatedImages) {
//     console.error('No images generated.');
//     return;
//   }

//   if (response.generatedImages.length !== 1) {
//     console.error('Number of images generated does not match the requested number.');
//   }

//   for (let i = 0; i < response.generatedImages.length; i++) {
//     if (!response.generatedImages?.[i]?.image?.imageBytes) {
//       continue;
//     }
//     const fileName = `image_${i}.jpeg`;
//     const inlineData = response?.generatedImages?.[i]?.image?.imageBytes;
//     const buffer = Buffer.from(inlineData || '', 'base64');
//     saveBinaryFile(fileName, buffer);
//   }
// }

// main();
