# Lab 07 — Token Standards on Hardhat + TrustKeys

**Họ tên:** Phạm Thu Hà - 11247164

**Địa chỉ ví:** `0x263E1Fec189cb34433ffa420BCeDc82999bC88dB`

---

## Bước 0 (5') — Project setup / Khởi tạo dự án

Lệnh đã chạy:
```bash
mkdir tokens && cd tokens
npm init -y
npm i --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm i @openzeppelin/contracts@5.0.2
npx hardhat init   # Create a JavaScript project
```

Cấu hình `hardhat.config.js`: solidity 0.8.24 (optimizer, runs 200), EVM `paris`, mạng `trustkeys` (RPC `https://l1testnet.trustkeys.network`, chainId 11968).

**Q1 / Câu 1: Why do we build on OpenZeppelin instead of writing ERC-20 from scratch? / Vì sao dùng OpenZeppelin thay vì tự viết ERC-20?**

Trả lời: OpenZeppelin đã được kiểm toán, dùng rộng rãi và được xem xét gas, nên ít lỗi hơn tự viết.

---

## Bước 1 (15') — ClassToken (ERC-20 + tests) / Viết token

File `contracts/ClassToken.sol` (kế thừa `ERC20`, `ERC20Capped`, `ERC20Permit`; cap 1.000.000 × 10¹⁸) và `test/ClassToken.test.js` (5 test cases cho Bước 1, thêm 2 test permit ở Bước 4):
- `mint toàn bộ tổng cung giới hạn (cap) cho tài khoản ban đầu`
- `chuyển token làm thay đổi số dư và phát sự kiện Transfer`
- `báo lỗi revert khi số dư không đủ`
- `ủy quyền (approve) sau đó chuyển (transferFrom) làm giảm hạn mức (allowance)`
- `tổng cung (totalSupply) giữ nguyên sau một chuỗi các giao dịch chuyển token`

Lệnh đã chạy:
```bash
npx hardhat test
```

Kết quả:

```
  ClassToken
    ✔ mint toàn bộ tổng cung giới hạn (cap) cho tài khoản ban đầu
    ✔ chuyển token làm thay đổi số dư và phát sự kiện Transfer
    ✔ báo lỗi revert khi số dư không đủ
    ✔ ủy quyền (approve) sau đó chuyển (transferFrom) làm giảm hạn mức (allowance)
    ✔ tổng cung (totalSupply) giữ nguyên sau một chuỗi các giao dịch chuyển token
```

**Q2 / Câu 2: decimals() returns 18. If Alice's balance is 1000000000000000000, how many CTK is that, and where does the "18" actually live — on-chain or in the UI? / Số dư đó là bao nhiêu CTK, và số "18" nằm ở đâu?**

Trả lời: 1 CTK. Số "18" chỉ là metadata hiển thị; trên chuỗi mọi giá trị là số nguyên theo đơn vị nhỏ nhất. 

**Q3 / Câu 3: Why does a DEX need approve + transferFrom instead of a plain transfer? What is the risk of approve(spender, 2²⁵⁶−1)? / Vì sao DEX cần hai bước? Rủi ro của infinite approval?**

Trả lời: `transfer` thường không chạy code của bên nhận nên hợp đồng DEX không thể phản ứng; với `transferFrom`, DEX tự kéo token ngay trong giao dịch của nó. Với infinite approval, nếu spender bị hack thì toàn bộ số dư bị rút sạch.

---

## Bước 2 (15') — ClassBadge (ERC-721, on-chain metadata) / Viết NFT

File `contracts/ClassBadge.sol` (`ERC721` + `Ownable`, `mint` chỉ owner dùng `_safeMint`, `tokenURI` dựng on-chain bằng `Base64` + `Strings`, lỗi `EmptyName`) và `test/ClassBadge.test.js` (2 test cases):
- `mint và giải mã tokenURI on-chain thành công`
- `revert EmptyName khi tên rỗng`

Kết quả (cùng lần chạy `npx hardhat test`, tổng số test ở Bước 4):

```
  ClassBadge
    ✔ mint và giải mã tokenURI on-chain thành công (713ms)
    ✔ revert EmptyName khi tên rỗng
```

**Q4 / Câu 4: Where do the JSON and the image live? What did we avoid by NOT using IPFS on TrustKeys? / JSON và ảnh sống ở đâu? Ta tránh được điều gì khi không dùng IPFS?**

Trả lời: Cả JSON và ảnh SVG nằm trong chính hợp đồng, được dựng khi gọi `tokenURI`. Nhờ đó không cần dịch vụ pin IPFS hay server bên ngoài. 

**Q5 / Câu 5: What does the "safe" in _safeMint / safeTransferFrom actually check, and why? / Chữ "safe" kiểm tra điều gì?**

Trả lời: Nếu bên nhận là hợp đồng thì nó phải cài `onERC721Received`, để NFT không bị kẹt trong hợp đồng không thể chuyển nó đi.

---

## Bước 3 (10') — Deploy & interact on TrustKeys / Triển khai

Lệnh đã chạy:
```bash
npx hardhat run scripts/deploy-token.js --network trustkeys
npx hardhat run scripts/deploy-badge.js --network trustkeys
```

Kết quả:

```
Deploying ClassToken with account: 0x263E1Fec189cb34433ffa420BCeDc82999bC88dB
ClassToken deployed to: 0x84C3D423717A85CA27195542056ad8d553EefD37

Deploying ClassBadge with account: 0x263E1Fec189cb34433ffa420BCeDc82999bC88dB
ClassBadge deployed to: 0xd1AB98277b5c8fde755522687B233dA055A19458
Minted Badge #0 for Phạm Thu Hà successfully!
```

![test](deploy.jpg)


**Chuyển 100 CTK cho bạn cùng lớp:**
```bash
TOKEN=0x84C3D423717A85CA27195542056ad8d553EefD37 TO=0xccD639c18E7DbE514824031a2358328453825327 \
  npx hardhat run scripts/interact-token.js --network trustkeys
```
```
Đang chuyển 100 CTK tới địa chỉ 0xccD639c18E7DbE514824031a2358328453825327...
Chuyển thành công 100 CTK!
```
![test](interact.jpg)


**Ảnh MetaMask (Import tokens + số dư CTK):**
![MetaMask CTK](b3_metamask_ctk.png)

![MetaMask CTK](trustkeyblock_explorer.jpg)


**Giải mã tokenURI của ClassBadge:**
```bash
REGISTRY=0xd1AB98277b5c8fde755522687B233dA055A19458 TOKEN_ID=0 \
  npx hardhat run scripts/read-badge.js --network trustkeys
```

JSON sau khi giải mã base64:
```json
{
  "name": "Blockchain Class Badge #0",
  "description": "On-chain proof of attendance for the Blockchain course. Metadata and image live entirely on-chain (no IPFS, no server).",
  "attributes": [
    { "trait_type": "Student", "value": "Phạm Thu Hà" },
    { "trait_type": "Course", "value": "Blockchain Technology and Cryptocurrency" }
  ],
  "image": "data:image/svg+xml;base64,..."
}
```

SVG sau khi giải mã:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#12331E"/><text x="200" y="120" fill="#CFE6D6" font-size="26" text-anchor="middle" font-family="sans-serif">Blockchain Class</text><text x="200" y="210" fill="#FFFFFF" font-size="30" text-anchor="middle" font-family="sans-serif">Phạm Thu Hà</text><text x="200" y="300" fill="#8FBF9F" font-size="22" text-anchor="middle" font-family="sans-serif">Badge #0</text></svg>
```

**Ảnh kết quả `read-badge.js`:**
![read-badge](b3_read_badge.png)

**Q6 / Câu 6: TrustKeys has no public explorer. How did you confirm the 100-CTK transfer landed? / Không có explorer — bạn xác nhận giao dịch bằng cách nào?**

Trả lời: Bằng lời gọi view `balanceOf` qua ethers và số dư CTK hiển thị trong MetaMask. 
---

## Bước 4 — BONUS: gasless approval with permit (EIP-2612) / permit

Đã thêm vào `test/ClassToken.test.js` các test:
- `cho phép duyệt allowance off-chain qua relayer và tăng nonce`
- `báo lỗi revert khi permit có deadline đã hết hạn` (`ERC2612ExpiredSignature`)

Lệnh đã chạy:
```bash
npx hardhat test
```

**Ảnh kết quả :**
![test](passing_test.jpg)


**Q7 / Câu 7: What stops someone from replaying your permit signature on a second chain or a second time? / Điều gì chặn tấn công replay chữ ký permit?**

Trả lời: Chữ ký gắn với `chainId`, địa chỉ hợp đồng, `nonce` của từng owner và `deadline`, nên không thể phát lại trên chuỗi khác, hợp đồng khác, lần thứ hai hoặc sau khi hết hạn. 
