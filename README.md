# Lab 07 — Token Standards (Hardhat + TrustKeys)

**Họ tên:** Phạm Thu Hà - 11247164

Dự án gồm hai hợp đồng dùng OpenZeppelin 5.0.2:
- `ClassToken` (CTK): ERC-20 với `ERC20Capped` và `ERC20Permit`, cap 1.000.000 CTK.
- `ClassBadge`: ERC-721 với metadata (JSON + SVG) dựng hoàn toàn on-chain.

Báo cáo và ảnh chụp: xem [`lab_07_worksheet.md`](lab_07_worksheet.md).

## Cấu trúc

```
contracts/   ClassToken.sol, ClassBadge.sol
scripts/     deploy-token.js, deploy-badge.js, interact-token.js, read-badge.js
test/        ClassToken.test.js, ClassBadge.test.js
```

## Cài đặt và chạy test

```bash
npm install
npx hardhat test
```

## Deploy lên TrustKeys

Tạo file `.env` từ mẫu và điền PRIVATE_KEY của tài khoản thử (không dùng khóa thật):

```bash
cp .env.example .env
npx hardhat run scripts/deploy-token.js --network trustkeys
npx hardhat run scripts/deploy-badge.js --network trustkeys
```

Chuyển 100 CTK và đọc `tokenURI`:

```bash
TOKEN=0xYourToken TO=0xClassmate npx hardhat run scripts/interact-token.js --network trustkeys
REGISTRY=0xYourBadge TOKEN_ID=0 npx hardhat run scripts/read-badge.js --network trustkeys
```

## Địa chỉ đã deploy (TrustKeys, chainId 11968)

- ClassToken: `0x84C3D423717A85CA27195542056ad8d553EefD37`
- ClassBadge: `0xd1AB98277b5c8fde755522687B233dA055A19458`
