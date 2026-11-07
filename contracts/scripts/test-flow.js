const hre = require("hardhat");
const { keccak256, toUtf8Bytes } = require("ethers");

async function main() {
  const policyId = process.env.POLICY_ID ? parseInt(process.env.POLICY_ID) : 1;
  const rainfall = process.env.RAINFALL ? parseInt(process.env.RAINFALL) : 10; // mm, below threshold 25 => payout
  const address = require("fs").readFileSync("./contract-address.txt", "utf8").trim();
  const contract = await hre.ethers.getContractAt("PolicyContract", address);
  console.log("Contract:", address);
  console.log("policyCount:", (await contract.policyCount()).toString());

  const policy = await contract.getPolicy(policyId);
  console.log("Policy", policyId, ":", policy);

  console.log("\nReporting rainfall", rainfall, "mm ...");
  const reportHash = keccak256(toUtf8Bytes(JSON.stringify({ policyId, rainfall, ts: Date.now() })));
  const tx1 = await contract.report(policyId, rainfall, reportHash);
  await tx1.wait();
  console.log("Reported. tx:", tx1.hash);

  console.log("\nSettling policy", policyId, "...");
  const tx2 = await contract.settle(policyId);
  await tx2.wait();
  console.log("Settled. tx:", tx2.hash);

  const after = await contract.getPolicy(policyId);
  console.log("After:", after);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
