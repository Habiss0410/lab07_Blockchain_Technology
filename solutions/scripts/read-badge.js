const hre = require("hardhat");

async function main() {
  const badgeAddress = process.env.REGISTRY;
  const tokenId = process.env.TOKEN_ID || "0";

  if (!badgeAddress) {
    throw new Error("Vui lòng truyền REGISTRY address!");
  }

  const Badge = await hre.ethers.getContractFactory("ClassBadge");
  const badge = Badge.attach(badgeAddress);

  console.log(`Đang truy vấn tokenURI(${tokenId}) từ ClassBadge...`);
  const uri = await badge.tokenURI(tokenId);

  console.log("\n=================== 1. RAW TOKEN URI ===================");
  console.log(uri);

  // Giải mã Base64 JSON Metadata
  const jsonBase64 = uri.split(",")[1];
  const decodedJson = Buffer.from(jsonBase64, "base64").toString("utf8");
  const meta = JSON.parse(decodedJson);

  console.log("\n=================== 2. DECODED METADATA JSON ===================");
  console.log(JSON.stringify(meta, null, 2));

  // Giải mã Base64 SVG Image
  const svgBase64 = meta.image.split(",")[1];
  const decodedSvg = Buffer.from(svgBase64, "base64").toString("utf8");

  console.log("\n=================== 3. DECODED ON-CHAIN SVG IMAGE ===================");
  console.log(decodedSvg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});