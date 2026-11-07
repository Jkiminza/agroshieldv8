const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying PolicyContract to", hre.network.name, "...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const PolicyContract = await hre.ethers.getContractFactory("PolicyContract");
  const contract = await PolicyContract.deploy();
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\nPolicyContract deployed to:", address);

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
  fs.writeFileSync(
    "./contract-address.txt", 
    address
  );
  console.log("Contract address saved to contract-address.txt:", address);

  // Copy ABI to frontend
  fs.writeFileSync(
    "../frontend/lib/abi.ts",
    `export const CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const`
  );
  console.log("ABI copied to frontend/lib/abi.ts");

  // Verify on Basescan if not localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await contract.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
