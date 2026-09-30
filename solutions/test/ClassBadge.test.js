const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClassBadge", function () {
  it("mint và giải mã tokenURI on-chain thành công", async function () {
    const [owner, student] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("ClassBadge");
    const badge = await Badge.deploy(owner.address);

    await badge.mint(student.address, "Phạm Thu Hà");

    const uri = await badge.tokenURI(0);
    expect(uri).to.include("data:application/json;base64,");

    const jsonBase64 = uri.split(",")[1];
    const decodedJson = Buffer.from(jsonBase64, "base64").toString("utf8");
    const meta = JSON.parse(decodedJson);

    expect(meta.name).to.equal("Blockchain Class Badge #0");
    const studentAttr = meta.attributes.find((a) => a.trait_type === "Student");
    expect(studentAttr.value).to.equal("Phạm Thu Hà");
    expect(meta.image).to.include("data:image/svg+xml;base64,");
  });

  it("revert EmptyName khi tên rỗng", async function () {
    const [owner, student] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("ClassBadge");
    const badge = await Badge.deploy(owner.address);

    await expect(badge.mint(student.address, ""))
      .to.be.revertedWithCustomError(badge, "EmptyName");
  });
});