const hre = require("hardhat");

async function main() {
  const tokenAddress = process.env.TOKEN;
  const toAddress = process.env.TO;

  if (!tokenAddress || !toAddress) {
    throw new Error("Vui lòng truyền TOKEN và TO qua biến môi trường!");
  }

  const Token = await hre.ethers.getContractFactory("ClassToken");
  const token = Token.attach(tokenAddress);

  const amount = hre.ethers.parseUnits("100", 18);
  console.log(`Đang chuyển 100 CTK tới địa chỉ ${toAddress}...`);

  const tx = await token.transfer(toAddress, amount);
  await tx.wait();
  console.log("Chuyển thành công 100 CTK!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});