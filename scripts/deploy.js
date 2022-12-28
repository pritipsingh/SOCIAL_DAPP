
const hre = require("hardhat");
//Social deployed to: 0xD6D5A17CD5d0D93B8ba9a5ba4e668686Ba8D5E36
async function main() {
  const Social = await hre.ethers.getContractFactory("Social");
  const social = await Social.deploy();

  await social.deployed();
  console.log("Social deployed to:", social.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
