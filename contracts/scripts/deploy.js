const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Get and save the ABI
  const artifact = await hre.artifacts.readArtifact("PolicyContract");
  console.log("\nContract ABI:");
  console.log(JSON.stringify(artifact.abi, null, 2));
  
  // Save ABI to file
  fs.writeFileSync(
    "./PolicyContractABI.json", 
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("\nABI saved to PolicyContractABI.json");
  
  // Save contract address to file
  const contractAddress = "0xC3EF46B3Fcce1a266a65DdEF2865BE59758a9e75";
  fs.writeFileSync(
    "./contract-address.txt", 
    contractAddress
  );
  console.log("Contract address saved to contract-address.txt:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
