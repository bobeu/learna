# Pinata IPFS Upload Security Implementation

## Overview
This document outlines the secure implementation of the `uploadImageToPinata` function with proper JWT authentication and security best practices.

## Security Features

### 1. Environment Variable Security
- **Server-side only**: JWT secrets are stored in server-side environment variables (no `NEXT_PUBLIC_` prefix)
- **Validation**: Environment variables are validated at runtime before use
- **Error handling**: Clear error messages for missing or invalid configuration

### 2. File Validation
- **File size limits**: Maximum 10MB file size to prevent abuse
- **File type restrictions**: Only allows common image formats (JPEG, PNG, GIF, WebP)
- **Extension validation**: Validates both MIME type and file extension
- **Empty file check**: Prevents upload of empty files

### 3. Upload Security
- **Unique filenames**: Generates timestamped, randomized filenames to prevent conflicts
- **Metadata tracking**: Stores original filename, upload time, file type, and size
- **CID version**: Uses IPFS CID version 1 for better compatibility
- **Upload verification**: Verifies uploaded files are accessible after upload

### 4. Error Handling
- **Comprehensive validation**: Validates all input parameters
- **User-friendly errors**: Returns clear, actionable error messages
- **Graceful degradation**: Handles verification failures without breaking the upload
- **Logging**: Proper error logging for debugging (without exposing sensitive data)

## Environment Setup

### Required Environment Variables
```bash
# Pinata JWT Secret (Server-side only - NEVER use NEXT_PUBLIC_)
PINATA_JWT_SECRET=your_pinata_jwt_secret_here

# Pinata Gateway URL
PINATA_GATEWAY=https://gateway.pinata.cloud
```

### Getting Pinata Credentials
1. Sign up at [Pinata.cloud](https://pinata.cloud)
2. Create a new API key with upload permissions
3. Copy the JWT secret (not the API key)
4. Add to your `.env.local` file (never commit this file)

## Usage Example

```typescript
import { uploadImageToPinata } from './utilities';

// Example usage
const handleFileUpload = async (file: File) => {
  const result = await uploadImageToPinata({
    file: file,
    fileName: file.name,
    fileType: file.type
  });

  if (result.success) {
    console.log('Upload successful:', result.imageURI);
    // Use result.imageURI in your application
  } else {
    console.error('Upload failed:', result.error);
    // Handle error appropriately
  }
};
```

## Security Best Practices Implemented

1. **No client-side secrets**: JWT secrets are never exposed to the client
2. **Input validation**: All inputs are validated before processing
3. **File restrictions**: Only safe image file types are allowed
4. **Size limits**: Prevents abuse through large file uploads
5. **Unique naming**: Prevents filename conflicts and potential security issues
6. **Error sanitization**: Error messages don't expose sensitive information
7. **Verification**: Uploads are verified to ensure they're accessible

## File Type Support

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

## File Size Limits

- **Maximum**: 10MB per file
- **Minimum**: 1 byte (empty files are rejected)

## Error Codes

The function returns a standardized response format:

```typescript
{
  success: boolean;
  imageURI?: string;  // Present when success is true
  error?: string;     // Present when success is false
}
```

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure `PINATA_JWT_SECRET` and `PINATA_GATEWAY` are set in your `.env.local`
   - Verify the variables don't have `NEXT_PUBLIC_` prefix

2. **"File type not allowed"**
   - Check that the file is a supported image format
   - Verify the file extension matches the MIME type

3. **"File size exceeds maximum"**
   - Compress or resize the image to under 10MB
   - Consider using a different image format

4. **"Pinata initialization failed"**
   - Verify your JWT secret is correct
   - Check that your Pinata account has upload permissions
   - Ensure the gateway URL is correct

## Migration from Previous Implementation

If you're migrating from the previous implementation:

1. **Update environment variables**: Remove `NEXT_PUBLIC_` prefix from Pinata variables
2. **Update function calls**: The function now returns a result object instead of just a string
3. **Add error handling**: Check the `success` property before using `imageURI`
4. **Update types**: The function signature has changed to include proper TypeScript types

## Security Considerations

- Never commit `.env.local` files to version control
- Rotate JWT secrets regularly
- Monitor upload usage for abuse
- Consider implementing rate limiting for uploads
- Use HTTPS for all communications
- Regularly update the Pinata SDK for security patches
