const hre = require("hardhat");
const fs = require("fs");
async function main() {
  const address = fs.readFileSync("./contract-address.txt", "utf8").trim();
  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("PolicyContract", address);
  const bal = await hre.ethers.provider.getBalance(address);
  console.log("Contract balance before:", hre.ethers.formatEther(bal), "ETH");
  const tx = await contract.fundContract({ value: hre.ethers.parseEther("0.015") });
  await tx.wait();
  const after = await hre.ethers.provider.getBalance(address);
  console.log("Contract balance after:", hre.ethers.formatEther(after), "ETH");
  console.log("tx:", tx.hash);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
