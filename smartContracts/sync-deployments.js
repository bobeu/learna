#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration - directory files
const HARDHAT_DEPLOYMENTS_PATH = './deployments';

// Create the React ABI directory if it doesn't exist
const checkFIleExistence = (dir) => {
    const topDir = '../Deployment/';
    let dirName = path.join(topDir, dir);
    const filename = path.basename(dirName);
    const dirname = path.dirname(dirName);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true })
        fs.createWriteStream(path.join(dirname, filename)).end();
    }
    return {dirname, filename};
}

// Function to walk through directories recursively
function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory() && !filePath.includes('solcInputs')) {
            results = results.concat(walkDir(filePath));
        } else {
            if (file.endsWith('.json') && !file.includes('contracts')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

// Main script
console.log("🔄 Syncing Deployment modules to Next App...");

try {
    // Find all artifact JSON files
    const artifactFiles = walkDir(HARDHAT_DEPLOYMENTS_PATH);
    console.log("artifactFiles", artifactFiles);

    artifactFiles.forEach(filepath => {
        // Read and parse the artifact file
        const {filename, dirname} = checkFIleExistence(filepath);
        const artifact = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const contractName = filename.replace('.json', '');
        
        // Extract and save just the deployment content
        const artifactPaths = path.join(dirname, `${contractName}.json`);
        // checkFIleExistence(artifactPaths);
        if(artifact) {
            fs.writeFileSync(artifactPaths, JSON.stringify(artifact, null, 2));
        }
        // JSON.stringify(artifact.abi, null, 2)
        console.log(`Copied Deployments for ${contractName}`);
    });

    console.log("✅ Deployments sync complete!");
} catch (error) {
    console.error("❌ Error syncing Deployment:", error);
    process.exit(1);
}
