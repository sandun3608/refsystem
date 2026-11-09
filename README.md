# LumiRep Pro — Cosmetic Rep & Distribution Management System 💄📦
**Specially Crafted for iPhone 17 Pro Resolution & Modern Web Browsers**

---

## 🌟 Overview (සිංහල හැඳින්වීම)
ඔබගේ imported cosmetics products, wholesale/retail distribution, delivery reps, customer shops (salons, cosmetic shops), inventory stock, batch tracking, orders, cheque alert notifications සහ billing කටයුතු පහසුවෙන් phone එකෙන් සහ desktop එකෙන් කරගත හැකි modern premium **White & Royal Blue** theme එකෙන් නිර්මාණය කරන ලද සම්පූර්ණ Distribution Management Web System එකකි.

දැනට **Localhost** මත ඉතා පහසුවෙන් run කළ හැකි අතර, ඉදිරියේදී ඕනෑම **Linux VPS (Ubuntu/Debian)** එකක `npm start` හෝ Docker/PM2 මගින් එක ක්ලික් එකකින් deploy කළ හැක.

---

## 🚀 ඉක්මනින් Run කරගන්නා ආකාරය (Quick Start on Localhost)

### 1. Requirements
* Node.js (v18 හෝ ඊට ඉහළ — දැනටමත් පරිගණකයේ ස්ථාපනය කර ඇත)

### 2. Run කිරීම (Development Mode)
Terminal එකේ `c:\Users\etsy dream\Desktop\az` folder එක තුළ:
```bash
# Vite frontend + Express backend එකවර run කිරීම:
npm run dev
```
👉 Browser එකේ හෝ mobile phone එකේ `http://localhost:3000` (හෝ `http://localhost:5000`) open කරන්න!

### 3. Production / Standalone Server Mode (VPS සඳහාත් මෙයම භාවිතා වේ)
```bash
# 1. Frontend එක build කිරීම:
npm run build

# 2. Server එක start කිරීම:
npm start
```
👉 Server එක `http://localhost:5000` හි ධාවනය වේ.

---

## 📱 පියවරෙන් පියවර සියලුම Features (Workflow Walkthrough)

### 1️⃣ First Page — Main Importer Shop තේරීම
- Screen එක මැද කැපී පෙනෙන **"Add Your Shop"** button එක.
- Click කළ විට Form එකක් load වේ:
  - **Shop Name** (උදා: LumiCosmetics Colombo HQ)
  - **Shop ID** (උදා: MS001)
  - **Shop Image** (URL එකක් හෝ device එකෙන් Upload කිරීම / Quick sample presets)
- Save කළ පසු First Page එකට එකතු වේ.
- ඔබ එකතු කළ සියලුම Main Shops, image එක සහ ID එක සමග display වේ.
- Shop එක click කළ විට ස්වයංක්‍රීයව Step 2 වෙත ගමන් කරයි.

### 2️⃣ Second Page — Ada Delivery Awe Kawda? (Delivery Rep Selection)
- උඩින්ම **"Search Ref"** search bar එක (නම, ID හෝ phone number මගින් සෙවිය හැක).
- **"Add Delivery Ref"** button එක:
  - **Ref ID** (උදා: REP-101)
  - **Ref Name** (උදා: Kamal Perera)
  - **Ref Image** (Photo upload හෝ presets)
  - **Phone Number**
- Rep කෙනෙක් select කළ පසු Step 3 (Customer Shop Selection) වෙත රැගෙන යයි.

### 3️⃣ Third Page — Badu Dana Customer Shop Thoranna
- උඩින්ම **"Search Customer Shop"** search bar එක (Shop name, owner name, address මගින් සෙවිය හැක).
- **"Add Customer Shop"** button එක:
  - **Shop Name** (උදා: Rose Gold Salon & Cosmetics)
  - **Address** (උදා: No 45, Galle Road, Colombo 03)
  - **Shop ID** (උදා: CUST-01)
  - **Owner Name** (උදා: Mrs. Chandrika Fernando)
  - **Shop Image (Optional)** — user ඉල්ලූ පරිදි image එකක් නැතත් save කළ හැක!
- Retail shop එක click කළ විට කෙලින්ම **Dashboard & Inventory** එකට යයි.

### 4️⃣ & 6️⃣ Fourth Page — Dashboard & Cosmetics Inventory Ordering
- උඩින්ම Product Search bar එක සහ දකුණු පසින් **ඉරි කෑලි 3 (Hamburger Menu)** Side Navigation Drawer එක.
- Brand / Category අනුව **Horizontal scrollable chips** (All, Skincare, Lipstick, Foundation, Eye Makeup, etc.).
- එක් එක් Product Row එකෙහි:
  - Checkbox / Tick mark එක
  - Product Image, Name, Brand
  - Cost Price & Sale Price
  - **Adjustable Discount**: සෑම item එකකටම කැමති discount % එකක් click කර වෙනස් කළ හැක.
  - Current Stock
  - **RED "LOW STOCK" Alert**: Stock එක අඩු වූ විට (low stock count එකට වඩා අඩු වූ විට) රතු පැහැයෙන් "LOW STOCK" badge එකක් වැටේ.
  - **(- Quantity +) Stepper**: Item එකට tick mark එක දැමූ සැනින් quantity එක අඩු/වැඩි කරන Stepper එක activate වේ!
- අඩුම වශයෙන් එක් item එකක් select කළ විට screen එක යටින් **"Create Order (X items • Rs. Total)"** button එක floating වී දිස්වේ.

### 5️⃣ Side Navigation Drawer (ඉරි කෑලි 3 ඔබූ විට)
- Menu items:
  1. **Inventory**
  2. **Reports**
  3. **Settings**
  4. **Ref Manage**
  5. **Sales Overview**
  6. **Notifications** (Pending cheques & low stock alert badges)
  7. **Product Manage**
  8. **Orders**
  9. **Shop Details**
- **Bottom 3 Circles (Active Session Context)**:
  1. Main Shop Name & Image
  2. Delivery Rep Name & Image
  3. Customer Shop Name & Image
- **Log Out Button**: Click කළ විට session reset වී First Page (Main Shop Selection) එකට ගමන් කරයි.

### 7️⃣ Seventh Page — Checkout & Billing
- තෝරාගත් සියලුම භාණ්ඩවල Product Summary එක:
  - Product Name, Sale Price, Discount, Line Total
  - Inline `(- quantity +)` controls.
- **Overall Order Discount (Rs.)**: සම්පූර්ණ order එකටම manual discount එකක් ලබා දීමේ පහසුකම.
- **Delivery Batch Number**: කඩේට බඩු දාන සැරෙන් සැරේට Batch number එක auto/manual ඇතුළත් කිරීම.
- **Payment Method Selection**:
  - **Cash**
  - **Cheque**: Cheque Number, Bank Name, සහ **Cheque Clearance / Due Date** (මෙම දිනය ළං වන විට system එකෙන් notification ලබා දේ).
- **Delivery Target Date**: "Order එක ගෙන්න ඕනෙ කවද්ද" යන්න තේරීම.
- **"Confirm & Pass To Orders"** button එක click කළ විට confetti celebration එකක් සමගින් order එක save වී inventory stock එකෙන් ස්වයංක්‍රීයව අඩුවී Orders Page එකට pass වේ!

### 8️⃣ Eighth Page — Orders Page, Invoices & Notifications
- සියලුම Orders ලැයිස්තුව **Expandable Accordion** ආකාරයට දිගහැර බැලිය හැක (Customer details, Rep details, ordered items, batch no, subtotal, discount, net total).
- **Payment Badge**: Cash ද Cheque ද යන්න පැහැදිලිව පෙන්වයි.
- **Cheque Approaching Notification Alert**: Cheque එක මාරු කිරීමට දින 3ක් හෝ ඊට අඩු කාලයක් ඇති විට order එක ඉදිරියෙන් **Pulsing Notification Warning Icon** එකක් සහ Sidebar notification badge එකක් වැටේ!
- **Processing vs Delivered Toggle**:
  - Rep මුලින් list එක අරන් යන විට `Processing`
  - බඩු කඩේට භාරදුන් පසු `Delivered` ලෙස එක ක්ලික් එකකින් status මාරු කළ හැක.
- **Tick Mark Selection & Bulk Actions**:
  - Orders වලට tick marks දමා එකවර තේරිය හැක.
  - **Download PDF Invoice**: Phone එකට හෝ පරිගණකයට පිරිසිදු A4/Thermal Delivery Invoice PDF එකක් Generate වී download වේ.
  - **WhatsApp Share**: එක ක්ලික් එකකින් WhatsApp open වී සම්පූර්ණ Invoice විස්තරය Customer Shop එකට send කිරීමට text format වේ!
  - **Print Bill**: කෙලින්ම Printer එකට යැවිය හැක.

### 9️⃣ Ninth Page — Product Manage Page
- **Add New Product Button**:
  - Name, Brand/Category (Dropdown)
  - Cost Price, Sale Price
  - Current Stock
  - **Low Stock Count threshold box**: Stock එක කීයට අඩු වූ විටද රතු පැහැයෙන් Low Stock ලෙස වැටිය යුත්තේ යන්න මෙහිදී තීරණය කළ හැක.
  - Batch ID, Product Image, Expiry Date
  - Save කළ විට කෙලින්ම Inventory එකට එකතු වේ.
- **Export Excel Button**: සම්පූර්ණ Cosmetic Catalog එකම `.xlsx` Excel sheet එකක් ලෙස download කරගත හැක.
- **Bulk Delete Mode**: Button එක click කළ විට සියලුම products වලට tick mark දමා එකවර Delete කළ හැක.
- **Recycle Bin Delete Icon**: සෑම item එකකම දකුණු කෙළවරේ තනි තනිව delete කිරීමට Recycle Bin icon එක ඇත.
- **Edit Product**: ඕනෑම product එකක මිල, stock, විස්තර වෙනස් කිරීම.
- **Category Manager**: Add Category, Delete Category, Search Category (මෙහි add කරන categories ස්වයංක්‍රීයව product form එකට ලැබේ).

### 🔟 Tenth Page — Reports & Visual Charts
- **Top Summary KPI Cards**:
  1. Total Items (ගබඩාවේ ඇති මුළු භාණ්ඩ ගණන)
  2. Inventory Cost (භාණ්ඩ ගෙන්වීමට ගිය සම්පූර්ණ පිරිවැය)
  3. Total Inventory Sale Value & Profit Margin %
  4. Total Orders Count
  5. Realized Profit (විකිණූ orders වලින් ලැබුණු ලාභය)
- **Visual Graphs & Charts**:
  - **Cash vs Cheque Breakdown**: Cheque වලින් කීයක් ලැබේද, Cash කොපමණද යන්න percent & bar visual.
  - **Customer Shops Order Volume (Low to High)**: අඩු shop එකේ සිට වැඩි shop එක දක්වා orders ලැබෙන පිළිවෙල bar chart එකක් මගින්.
  - **Brand Stock Distribution**: එක් එක් Brand කාණ්ඩය යටතේ ගබඩාවේ ඇති stock ප්‍රමාණය.
  - **Product Sales by Brand**: වැඩිපුරම අලෙවි වන Brand කාණ්ඩ.
  - **Low Stock Critical Watchlist**: ඉක්මනින් re-order කළ යුතු භාණ්ඩ ලැයිස්තුව.

### 1️⃣1️⃣ Eleventh Page — Settings Page & VPS Migration
- Delivery Reps බැලීම සහ Delete කිරීම.
- Customer Shops බැලීම සහ Delete කිරීම.
- Main Distribution Importer Shops බැලීම සහ Delete කිරීම.
- **Download Database Backup (JSON)**: සම්පූර්ණ system දත්ත backup කරගැනීම.
- **Restore Database Backup (JSON)**: කලින් save කරගත් backup එකක් upload කර restore කිරීම.
- **Reload Sample Demo Data**: මුල සිට පරීක්ෂා කිරීමට sample cosmetics demo data load කිරීම.

---

## 🌐 VPS එකකට Deploy කරගන්නේ කෙසේද? (How to Deploy to VPS)
ඔබ VPS එකක් (DigitalOcean, Hetzner, AWS, Linode ආදී) ගත් පසු:
1. VPS එකට SSH මගින් login වන්න.
2. Node.js install කරන්න: `sudo apt update && sudo apt install -y nodejs npm`
3. ഈ project folder එක VPS එකට copy කරන්න (git clone හෝ scp).
4. Folder එක තුළ:
   ```bash
   npm install
   npm run build
   ```
5. Background එකේ දිගටම run වීමට **PM2** භාවිතා කරන්න:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "lumirep-cosmetics"
   pm2 save
   pm2 startup
   ```
6. Nginx reverse proxy එකක් දමා domain එකක් (උදා: `rep.yourdomain.com`) හෝ VPS IP එකෙන් `http://your-vps-ip:5000` හරහා ඕනෑම තැනක සිට phone එකෙන් හෝ පරිගණකයෙන් access කරන්න!

---
✨ **LumiRep Pro — Designed with Modern White & Royal Blue Aesthetics for maximum field efficiency!**
