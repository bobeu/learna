import { IConfigStorage, VerificationConfig } from '@selfxyz/core';

class SimpleConfigStorage {
  async getConfig(configId) {
    // Return your verification requirements
    return {
      olderThan: 18,                    // Minimum age (optional)
      excludedCountries: ['IRN', 'PRK'], // ISO 3-letter codes (optional)
      ofac: true                        // Enable OFAC checks (optional)
    };
  }
  
  async getActionId(userIdentifier, userDefinedData) {
    // Return a config ID based on your business logic
    return 'default_config';
  }
}



// Setup the verifier
import { SelfBackendVerifier, AttestationId, UserIdType } from '@selfxyz/core';
const IdType = {
  Passport: 1,
  EU_ID_Card: 2,
  // Add other ID types as needed
};
// Define which attestation types to accept
const allowedIds = new Map();
allowedIds.set(IdType.Passport, true); // 1 = passport
allowedIds.set(IdType.EU_ID_Card, true); // 2 = EU ID card (optional)

// Create configuration storage
const configStorage = new SimpleConfigStorage();

// Initialize the verifier
const selfBackendVerifier = new SelfBackendVerifier(
  "my-app-scope",                    // Your app's unique scope
  "https://myapp.com/api/verify",    // The API endpoint of this backend
  false,                             // false = real passports, true = mock for testing
  allowedIds,                        // Allowed document types
  configStorage,                     // Configuration storage implementation
  UserIdType.UUID                    // UUID for off-chain, HEX for on-chain addresses
);


// Set up the verifier
import { SelfBackendVerifier } from '@selfxyz/core';

// For production with real passports
const selfBackendVerifier = new SelfBackendVerifier(
    "my-app-scope",              // Your app's unique scope
    "https://myapp.com/api/verify" // The API endpoint of this backend
);

// For development/staging with mock passports
const selfBackendVerifier = new SelfBackendVerifier(
    "my-app-scope",              
    "https://myapp-staging.com/api/verify",
    "uuid",                      // User identifier type: "uuid" (default) or "hex" for addresses
    true                         // Use mock passports for testing
);



// Config
async getConfig(configId) {
  return {
    olderThan: 18,                        // Instead of setMinimumAge(18)
    excludedCountries: ['IRN', 'PRK'],    // Instead of excludeCountries('Iran', 'North Korea')
    ofac: true                            // Instead of enablePassportNoOfacCheck(), etc.
  };
}


// Verify proof
import { VcAndDiscloseProof, BigNumberish } from '@selfxyz/core';

// The frontend now sends these additional fields
const { attestationId, proof, pubSignals, userContextData } = request.body;

try {
  const result = await selfBackendVerifier.verify(
    attestationId,    // 1 for passport, 2 for EU ID card
    proof,            // The zero-knowledge proof
    pubSignals,       // Public signals array
    userContextData   // Hex string with user context
  );
  
  if (result.isValidDetails.isValid) {
    console.log('Verification successful');
    console.log('User ID:', result.userData.userIdentifier);
  }
} catch (error) {
  if (error.name === 'ConfigMismatchError') {
    console.error('Configuration mismatch:', error.issues);
  }
}

// API refund format after verification
{
  attestationId: 1,              // Document type verified
  isValidDetails: {
    isValid: boolean,            // Overall verification status
    isOlderThanValid: boolean,   // Age check result
    isOfacValid: boolean         // OFAC check result
  },
  forbiddenCountriesList: [],    // List of forbidden countries
  discloseOutput: {              // Disclosed passport data
    nationality: string,
    olderThan: string,
    name: string[],
    dateOfBirth: string,
    // ... other fields
  },
  userData: {
    userIdentifier: string,      // User's unique identifier
    userDefinedData: string      // Additional user data
  }
}


// Example API implementation

import { NextApiRequest, NextApiResponse } from 'next';
import { 
  SelfBackendVerifier, 
  AttestationId, 
  UserIdType,
  IConfigStorage,
  ConfigMismatchError 
} from '@selfxyz/core';

// Configuration storage implementation
class ConfigStorage {
  async getConfig(configId) {
    return {
      olderThan: 18,
      excludedCountries: ['IRN', 'PRK'],
      ofac: true
    };
  }
  
  async getActionId(userIdentifier, userDefinedData) {
    return 'default_config';
  }
}

// Initialize verifier once
const allowedIds = new Map();
allowedIds.set(1, true); // Accept passports

const selfBackendVerifier = new SelfBackendVerifier(
  'my-application-scope',
  'https://myapp.com/api/verify',
  false,
  allowedIds,
  new ConfigStorage(),
  UserIdType.UUID
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { attestationId, proof, pubSignals, userContextData } = req.body;

      if (!attestationId || !proof || !pubSignals || !userContextData) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify the proof
      const result = await selfBackendVerifier.verify(
        attestationId,
        proof,
        pubSignals,
        userContextData
      );
      
      if (result.isValidDetails.isValid) {
        // Return successful verification response
        return res.status(200).json({
          status: 'success',
          result: true,
          credentialSubject: result.discloseOutput
        });
      } else {
        // Return failed verification response 
        // Return 200 to ensure the error message displays in the mobile app
        return res.status(200).json({
          status: 'error',
          result: false,
          reason: 'Verification failed', //Displayed to the users in the app
          error_code: "VERIFICATION_FAILED" //received in onError() of SelfQRcodeWrapper
          details: result.isValidDetails
        });
      }
    } catch (error) {
      if (error instanceof ConfigMismatchError) {
        // Return 200 to ensure the error message displays in the mobile app
        return res.status(200).json({
          status: 'error',
          result: false,
          reason: 'Config Mismatch', //Displayed to the users in the app
          error_code: "CONFIG_MISMATCH" //received in onError() of SelfQRcodeWrapper
          issues: error.issues
        });
      }
      
      console.error('Error verifying proof:', error);

      // Return 200 to ensure the error message displays in the mobile app
      return res.status(200).json({
        status: 'error',
        result: false,
        reason: 'Internal Error', //Displayed to the users in the app
        error_code: "INTERNAL_ERROR" //received in onError() of SelfQRcodeWrapper
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}


// Generate QRCode 

import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique user ID
const userId = uuidv4();

// Create a SelfApp instance using the builder pattern
const selfApp = new SelfAppBuilder({
  appName: "My App",
  scope: "my-app-scope", 
  endpoint: "https://myapp.com/api/verify",
  logoBase64: "<base64-logo-or-png-url>", // Optional, accepts also PNG url
  userId,
  disclosures: {                      // NEW: Specify verification requirements
    minimumAge: 18,                   // Must match backend config
    excludedCountries: ['IRN', 'PRK'], // Must match backend config
    ofac: true,                       // Must match backend config
    nationality: true,                // Request nationality disclosure
    name: true,                       // Request name disclosure
    dateOfBirth: true                 // Request date of birth disclosure
  }
}).build();

// Render the QR Code 

function MyComponent() {
  return (
    <SelfQRcodeWrapper
      selfApp={selfApp}
      onSuccess={() => {
        console.log('Verification successful');
        // Perform actions after successful verification
      }}
    />
  );
}



// Complete example

'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

function VerificationPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Generate a user ID when the component mounts
    setUserId(uuidv4());
  }, []);

  if (!userId) return null;

  // Create the SelfApp configuration
  const selfApp = new SelfAppBuilder({
    appName: "My Application",
    scope: "my-application-scope",
    endpoint: "https://myapp.com/api/verify",
    userId,
    disclosures: {                    // NEW: Must match backend config
      minimumAge: 18,
      excludedCountries: ['IRN', 'PRK'],
      ofac: true,
      name: true,
      nationality: true
    }
  }).build();

  return (
    <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app to verify your identity</p>
      
      <SelfQRcodeWrapper
        selfApp={selfApp}
        onSuccess={() => {
          // Handle successful verification
          console.log("Verification successful!");
          // Redirect or update UI
        }}
        onError={(error) => {
          const errorCode = error.error_code || 'Unknown';
          const reason = error.reason || 'Unknown error';
          console.error(`Error ${errorCode}: ${reason}`);
          console.error('Error generating QR code');
        }}
        size={350}
      />
      
      <p className="text-sm text-gray-500">
        User ID: {userId.substring(0, 8)}...
      </p>
    </div>
  );
}

export default VerificationPage;


// Discolsure

import { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

const userId = uuidv4();
​
const selfApp = new SelfAppBuilder({
  appName: "My App",
  scope: "my-app-scope", 
  endpoint: "https://myapp.com/api/verify",
  endpointType: "https",
  logoBase64: "<base64EncodedLogo>",
  userId,
  disclosures: {
    minimumAge: 18,
  }
}).build();


// set minimum age
selfBackendVerifier.setMinimumAge(18);


// Result of verify function
export interface SelfVerificationResult {
  // Check if the whole verification has succeeded
  isValid: boolean;
  isValidDetails: {
    // Verifies that the proof is generated under the expected scope.
    isValidScope: boolean;
    //Check that the proof's attestation identifier matches the expected value.
    isValidAttestationId: boolean;
    // Verifies the cryptographic validity of the proof.
    isValidProof: boolean;
    // Ensures that the revealed nationality is correct (when nationality verification is enabled).
    isValidNationality: boolean;
  };
  // User Identifier which is included in the proof
  userId: string;
  // Application name, which is the same as scope
  application: string;
  // A cryptographic value used to prevent double registration or reuse of the same proof.
  nullifier: string;
  // Revealed data by users
  credentialSubject: {
    // Merkle root, which is used to generate proof.
    merkle_root?: string;
    // Proved identity type. For passport, this value is fixed as 1.
    attestation_id?: string;
    // Date when the proof is generated
    current_date?: string;
    // Revealed issuing state in the passport
    issuing_state?: string;
    // Revealed name in the passport
    name?: string;
    // Revealed passport number in the passport
    passport_number?: string;
    // Revealed nationality in the passport
    nationality?: string;
    // Revealed date of birth in the passport
    date_of_birth?: string;
    // Revealed gender in the passport
    gender?: string;
    // Revealed expiry date in the passport
    expiry_date?: string;
    // Result of older than
    older_than?: string;
    // Result of passport number ofac check
    // Gives true if the user passed the check (is not on the list),
    // false if the check was not requested or if the user is in the list
    passport_no_ofac?: boolean;
    // Result of name and date of birth ofac check
    name_and_dob_ofac?: boolean;
    // Result of name and year of birth ofac check
    name_and_yob_ofac?: boolean;
  };
  proof: {
    // Proof that is used for this verification
    value: {
      proof: Groth16Proof;
      publicSignals: PublicSignals;
    };
  };


  // Verify ceredential nationality
  import { countries, SelfVerificationResult } from "@selfxyz/core";

const result: SelfVerificationResult = await selfBackendVerifier.verify(request.body.proof, request.body.publicSignals);
if (result.credentialSubject.nationality === countries.IRAN ) { 
    return res.status(200).json({
          status: 'failure',
          result: false,
          reason: "User nationality is not allowed",
          error_code: "RESTRICTED_NATIONALITY"
    });
}



// Deeplinking on mobile
import { getUniversalLink } from '@selfxyz/core';
import { SelfAppBuilder } from '@selfxyz/qrcode';

const selfApp = new SelfAppBuilder({
    appName: "Your App Name",              // Required: Your application name
    scope: "your-app-scope",               // Required: Unique identifier for your app (max 31 chars)
    endpoint: "https://your-api.com/verify", // Required: Your verification endpoint
    logoBase64: "<base64-logo-or-png-url>", // Optional: Your app logo
    userId: "user-uuid-or-address",        // Required: User identifier
    userIdType: 'uuid',                    // Optional: 'uuid' (default) or 'hex' for addresses
    version: 2,                            // NEW in V2: Protocol version
    userDefinedData: "0x" + Buffer.from("default").toString('hex').padEnd(128, '0'), // NEW in V2
    disclosures: {                         // NEW: Specify what to verify
        minimumAge: 18,                    // Age verification
        excludedCountries: ['IRN', 'PRK'], // ISO 3-letter country codes to exclude
        ofac: true,                        // OFAC sanctions check
        name: true,                        // Request name disclosure
        nationality: true,                 // Request nationality disclosure
        date_of_birth: true,               // Request date of birth
        // ... other optional fields
    }
}).build();


const deeplink = getUniversalLink(selfApp);

// For Ethereum/blockchain addresses
// const selfApp = new SelfAppBuilder({
//     // ... other config
//     userId: "0x1234567890abcdef...",  // User's address
//     userIdType: 'hex',                 // Specify hex for addresses
// }).build();

// For regular UUIDs
// const selfApp = new SelfAppBuilder({
//     // ... other config
//     userId: "550e8400-e29b-41d4-a716-446655440000",  // UUID v4
//     userIdType: 'uuid',  // Default, can be omitted
// }).build();




// const selfApp = new SelfAppBuilder({
//   appName: "My App",
//   scope: "my-app",
//   endpoint: "https://api.myapp.com/verify",
//   userId: uuidv4(),
//   version: 2,
//   userDefinedData: "0x" + Buffer.from(JSON.stringify({
//     action: "create_account",
//     referralCode: "SUMMER2024",
//     tier: "premium"
//   })).toString('hex').slice(0, 128), // Ensure exactly 64 bytes
//   disclosures: { /* ... */ }
// }).build();

// Backend
// class ConfigStorage implements IConfigStorage {
//   async getActionId(userIdentifier: string, userDefinedData: string): Promise<string> {
//     // userIdentifier is already extracted for you
//     console.log('User ID:', userIdentifier);
    
//     // Decode the user-defined portion
//     const decoded = Buffer.from(userDefinedData, 'hex').toString();
    
//     try {
//       const data = JSON.parse(decoded);
      
//       // Use the data to determine configuration
//       if (data.action === 'withdraw' && data.amount > 10000) {
//         return 'high_value_config';
//       }
      
//       return 'standard_config';
//     } catch {
//       // Handle non-JSON data
//       return 'default_config';
//     }
//   }
// }

{
//   "olderThanEnabled": true,
//   "olderThan": "16",
//   "forbiddenCountriesEnabled": false,
//   "forbiddenCountriesListPacked": [
//     "0",
//     "0",
//     "0",
//     "0"
//   ],
//   "ofacEnabled": [
//     true,
//     true,
//     true
//   ]
// }