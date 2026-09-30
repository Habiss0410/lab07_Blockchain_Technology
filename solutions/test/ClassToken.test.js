const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function signPermit(token, owner, spender, value, deadline) {
  const { chainId } = await ethers.provider.getNetwork();
  const domain = {
    name: "ClassToken",
    version: "1",
    chainId,
    verifyingContract: await token.getAddress(),
  };
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const nonce = await token.nonces(owner.address);
  const sig = await owner.signTypedData(domain, types, {
    owner: owner.address,
    spender: spender.address,
    value,
    nonce,
    deadline,
  });
  return ethers.Signature.from(sig);
}

describe("ClassToken", function () {
  it("mint toàn bộ tổng cung giới hạn (cap) cho tài khoản ban đầu", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    const cap = await token.cap();
    expect(await token.totalSupply()).to.equal(cap);
    expect(await token.balanceOf(owner.address)).to.equal(cap);
    expect(await token.name()).to.equal("ClassToken");
    expect(await token.symbol()).to.equal("CTK");
    expect(await token.decimals()).to.equal(18);
  });

  it("chuyển token làm thay đổi số dư và phát sự kiện Transfer", async function () {
    const [owner, alice] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    await expect(token.transfer(alice.address, 1000n))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, alice.address, 1000n);
    expect(await token.balanceOf(alice.address)).to.equal(1000n);
  });

  it("báo lỗi revert khi số dư không đủ", async function () {
    const [owner, alice] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    await expect(
      token.connect(alice).transfer(owner.address, 1n)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("ủy quyền (approve) sau đó chuyển (transferFrom) làm giảm hạn mức (allowance)", async function () {
    const [owner, alice, bob] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    await token.approve(alice.address, 500n);
    await token.connect(alice).transferFrom(owner.address, bob.address, 200n);
    expect(await token.allowance(owner.address, alice.address)).to.equal(300n);
    expect(await token.balanceOf(bob.address)).to.equal(200n);
  });

  it("tổng cung (totalSupply) giữ nguyên sau một chuỗi các giao dịch chuyển token", async function () {
    const [owner, alice] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    const before = await token.totalSupply();
    const amounts = [100n, 250n, 75n, 400n];
    let sum = 0n;
    for (const amt of amounts) {
      await token.transfer(alice.address, amt);
      sum += amt;
      expect(await token.balanceOf(alice.address)).to.equal(sum);
    }
    expect(await token.totalSupply()).to.equal(before);
  });

  it("cho phép duyệt allowance off-chain qua relayer và tăng nonce", async function () {
    const [owner, spender, relayer] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    const value = 500n;
    const deadline = (await time.latest()) + 3600;
    const { v, r, s } = await signPermit(token, owner, spender, value, deadline);

    await token
      .connect(relayer)
      .permit(owner.address, spender.address, value, deadline, v, r, s);

    expect(await token.allowance(owner.address, spender.address)).to.equal(value);
    expect(await token.nonces(owner.address)).to.equal(1n);
  });

  it("báo lỗi revert khi permit có deadline đã hết hạn", async function () {
    const [owner, spender, relayer] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ClassToken");
    const token = await Token.deploy(owner.address);
    const deadline = (await time.latest()) - 1;
    const { v, r, s } = await signPermit(token, owner, spender, 1n, deadline);

    await expect(
      token.connect(relayer).permit(owner.address, spender.address, 1n, deadline, v, r, s)
    ).to.be.revertedWithCustomError(token, "ERC2612ExpiredSignature");
  });
});