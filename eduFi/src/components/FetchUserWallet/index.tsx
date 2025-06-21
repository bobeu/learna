import { SiweMessage } from "siwe";
import { createWalletClient, custom, publicActions } from "viem";
import { optimism } from "viem/chains";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Done on the backend
const config = new Configuration({
    apiKey: "YOUR_API_KEY_HERE",
   });
   
const client = new NeynarAPIClient(config);

// Create wallet client
const wallet = createWalletClient({
    chain: optimism,
    transport: custom(window.ethereum),
   }).extend(publicActions);


async function createSiweMessage(address: string, statement: string) {
    const { nonce } = await client.fetchNonce();
  
    const message = new SiweMessage({
   scheme: "http",
   domain: "localhost:8080",
   address,
   statement,
   uri: "http://localhost:8080",
   version: "1",
   chainId: 1,
   nonce: nonce,
   });
  
    return message.prepareMessage();
  }


  async function fetchSigners() {
    const address = (await wallet.getAddresses())[0];
  
    let message = await createSiweMessage(
   address,
      "Sign in with Ethereum to the app."
   );
  
    const signature = await wallet.signMessage({ account: address, message });
  
    const { signers } = await client.fetchSigners({ message, signature });
  
    return signers;
  }


  fetchSigners()
 .then((signers) => {
 console.log("\n\nsigners:", signers, "\n\n");
 })
 .catch((error) => {
 console.error("error:", error);
 });