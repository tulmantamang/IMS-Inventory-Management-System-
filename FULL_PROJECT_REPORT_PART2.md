
# CHAPTER 4: IMPLEMENTATION AND TESTING

## 4.1 Tools and Technologies Used

**Table 4.1: Tools and Technologies Used**

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | v18 LTS | Server-side JavaScript execution |
| **API Framework** | Express.js | v4.21.2 | RESTful API server and middleware |
| **Database** | MongoDB (Atlas) | v6+ | NoSQL cloud document database |
| **ODM** | Mongoose | v8.9.7 | MongoDB schema modeling and querying |
| **Frontend Library** | React.js | v18.2.0 | Component-based UI framework |
| **State Management** | Redux Toolkit | v2.5.1 | Global state management |
| **Client Routing** | React Router DOM | v6.14.1 | SPA client-side routing |
| **Authentication** | JSON Web Token (JWT) | v9.0.2 | Stateless token-based auth |
| **Password Hashing** | Bcrypt.js | v2.4.3 | Secure password hashing |
| **Real-time** | Socket.io | v4.8.1 | WebSocket-based real-time events |
| **Image Upload** | Cloudinary SDK | v2.5.1 | Cloud image storage and delivery |
| **PDF Generation** | PDFKit | v0.17.2 | Server-side PDF invoice generation |
| **HTTP Cookie** | cookie-parser | v1.4.7 | JWT cookie parsing middleware |
| **CORS** | cors | v2.8.5 | Cross-origin request handling |
| **Environment Config** | dotenv | v16.4.7 | Environment variable management |
| **Dev Server** | Nodemon | v3.1.11 | Auto-restart on file changes |
| **UI Notifications** | react-hot-toast | v2.5.1 | Toast notification system |
| **Charts** | Chart.js + react-chartjs-2 | v4.4.8 | Dashboard analytics charts |
| **UI Styling** | Tailwind CSS | v3.4.17 | Utility-first CSS framework |
| **UI Components** | DaisyUI | v5.0.0 | Pre-built component library |
| **Form Handling** | React Hook Form | v7.54.2 | Performant form state management |
| **HTTP Client** | Axios | v1.7.9 | API request library |
| **Animations** | Framer Motion | v12.5.0 | UI animations and transitions |
| **ID Generation** | uuid | v13.0.0 | Unique identifier generation |
| **Icons** | Lucide React | v0.483.0 | Modern SVG icon library |

## 4.2 Module Description

### 4.2.1 Authentication Module

**Backend Files:** `authcontroller.js`, `authRouther.js`, `Authmiddleware.js`
**Frontend Files:** `authSlice.js`, `LoginPage.jsx`, `SignupPages.jsx`, `ProfilePage.jsx`

**Implementation Details:**

**Signup (`POST /api/auth/signup`):**
Accepts `full_name`, `email`, `password`, and `role`. Checks for duplicate email. Hashes the password using `bcryptjs` with 10 salt rounds. Saves the user document to MongoDB. Generates a signed JWT and sets it as an HTTP-only cookie.

**Login (`POST /api/auth/login`):**
Finds the user document by email. Uses `bcrypt.compare()` to verify the password against the stored hash. On success, generates a JWT signed with the server's `SecretKey`. Stores the token in an HTTP-only, SameSite-strict cookie named `Inventorymanagmentsystem`. Returns user data (excluding password) to the frontend.

**JWT Cookie Security:**
```javascript
res.cookie("Inventorymanagmentsystem", token, {
  httpOnly: true,         // Not accessible via document.cookie (XSS protection)
  secure: process.env.NODE_ENV === "production",  // HTTPS only in production
  sameSite: "strict"      // CSRF protection
});
```

**Middleware Architecture:**
The `Authmiddleware.js` file provides three middleware functions used across all protected routes:
- `authmiddleware` — verifies the JWT and attaches the fully populated `req.user` object
- `adminmiddleware` — blocks access if the user's role is not ADMIN (respects the `enable_rbac` setting toggle)
- `staffmiddleware` — allows access for both ADMIN and STAFF roles (requires only authentication)

**Profile Update (`PUT /api/auth/update-profile`):**
Accepts updated `full_name` and an optional base64-encoded image. If an image is provided, it is uploaded to Cloudinary using the Cloudinary Node.js SDK. The returned secure URL is stored in the `profile_image` field of the user document.

---

### 4.2.2 Product Management Module

**Backend Files:** `productController.js`, `ProductRouter.js`
**Frontend Files:** `productSlice.js`, `Productpage.jsx`

**Implementation Details:**

- Products are created with a unique name and SKU. The category is stored as a MongoDB ObjectId reference.
- The `selling_price` and `current_cost_price` are stored separately to support profit margin calculations.
- `total_stock` is never manually set by users — it is maintained exclusively by the purchase, sales, and adjustment modules.
- The `reorderLevel` field triggers a low-stock alert on the dashboard and in the product list (color-coded badge).

**Low-Stock Detection Logic:**
```javascript
// Backend aggregation — products where total_stock <= reorderLevel
const lowStockProducts = await Product.find({
  $expr: { $lte: ["$total_stock", "$reorderLevel"] },
  total_stock: { $gt: 0 },
  status: "Active"
});
```

- Products support **soft deletion**: clicking "Deactivate" sets `status` to `"Inactive"` rather than deleting the database record. This preserves historical data integrity in purchase and sales records.
- Products referenced in any StockLog entry are protected from hard deletion.
- **Product Image Upload:** On the product add/edit form, users can upload an image which is sent to Cloudinary and the returned URL stored in the `image` field.

---

### 4.2.3 Category Management Module

**Backend Files:** `categorycontroller.js`, `categoryRouter.js`
**Frontend Files:** `categorySlice.js`, `Categorypage.jsx`

**Implementation Details:**

- Full CRUD operations with an Add/Edit modal form.
- Each category has: `name` (unique), `description`, and `status` (Active/Inactive).
- Categories are referenced by Products via ObjectId. Attempting to delete a category that has associated products returns a 400 error with a descriptive message, preventing orphaned product records.
- Categories are loaded into the Product creation form via a dropdown populated from the Redux `categorySlice` state.

---

### 4.2.4 Supplier Management Module

**Backend Files:** `suppliercontroller.js`, `supplierrouter.js`
**Frontend Files:** `SupplierSlice.js`, `Supplierpage.jsx`

**Implementation Details:**

- **Auto-generated Supplier ID:** On supplier creation, the controller generates a unique `supplier_id` in the format `SUP-XXXX` (e.g., `SUP-0042`) using a UUID-based counter, ensuring uniqueness without requiring a separate counter collection.
- The `email` field uses a **sparse unique index** — this means multiple suppliers can have a null email (since `null` is treated as a missing value in sparse indexes), but if an email is provided, it must be unique.
- The `pan_vat` field is required and unique, ensuring no duplicate supplier registrations under the same tax number.
- Supplier records linked to any Purchase document are protected from deletion (400 error returned).
- The supplier list is displayed in a searchable, filterable data table with pagination.

---

### 4.2.5 Purchase Management Module

**Backend Files:** `purchasecontroller.js`, `purchaserouter.js`
**Frontend Files:** `purchaseSlice.js`, `PurchasePage.jsx`

**Implementation Details:**

The Purchase module is the primary mechanism for **stock-in** events. When a purchase is created:

1. The `Purchase` document is saved to the `purchases` collection.
2. For each item in the purchase:
   - `total_stock` on the corresponding `Product` is incremented by the purchased quantity.
   - `current_cost_price` on the `Product` is updated with the latest unit cost price.
   - A `StockLog` entry is created with `type: "IN"`, recording the supplier, quantity, previous stock, new stock, and the user who recorded the purchase.

**Financial Calculations:**
```
Subtotal    = Σ (quantity × costPrice) for each item
Discount    = subtotal × (discountPercentage / 100)
Tax         = (subtotal - discount) × (taxPercentage / 100)
Total       = subtotal - discountAmount + taxAmount
```

- The purchase form supports **dynamic item rows** — users can add multiple product rows to a single purchase order.
- **PDF Invoice Generation (`GET /api/purchase/invoice/:id`):** The backend fetches the purchase document, populates supplier and product references, then uses PDFKit to stream a formatted PDF back to the client containing: company header, supplier details, itemized table (product, quantity, rate, amount), discount, tax, and total.
- **Purchase Deletion (Admin only):** Deleting a purchase reverses all stock changes — each product's `total_stock` is decremented by the purchased quantity, and a reversal StockLog entry is created.

---

### 4.2.6 Sales Management Module

**Backend Files:** `salescontroller.js`, `salesRouter.js`
**Frontend Files:** `salesSlice.js`, `Salespage.jsx`

**Implementation Details:**

The Sales module is the primary mechanism for **stock-out** events. When a sale is created:

1. For each product in the sale, the server checks that `total_stock >= requested quantity`. If not, the entire transaction is rejected with a descriptive error.
2. The `Sale` document is saved with **price and cost price snapshots** embedded in each product sub-document — these preserve the exact pricing at the time of sale, ensuring profit calculations remain accurate even after future price changes.
3. For each sold item:
   - `total_stock` on the corresponding `Product` is decremented.
   - A `StockLog` entry is created with `type: "OUT"`.

**Profit Calculation:**
```javascript
// Per item profit
const itemProfit = (item.price - item.costPrice) * item.quantity;
// Total sale profit = sum of all item profits after applying discounts
```

- Default 13% VAT is applied automatically (configurable via Settings).
- **Sales PDF Invoice:** Uses PDFKit to generate a customer invoice including: company header, invoice number, customer name and date, itemized product table (product name, qty, rate, amount), VAT breakdown, discount, and grand total.
- The sales history table displays all transactions with search by customer name or invoice number, and a detail modal showing the full invoice breakdown and profit summary per transaction.

---

### 4.2.7 Stock Adjustment Module

**Backend Files:** `Adjustmentcontroller.js`, `Adjustmentrouter.js`
**Frontend Files:** `adjustmentSlice.js`, `AdjustmentPage.jsx`

**Implementation Details:**

Stock adjustments handle edge cases not covered by purchases or sales:
- **INCREASE:** Used for stock found during audits, customer returns, or opening balance entries.
- **DECREASE:** Used for damaged goods, expired products, theft, or write-offs.

Both adjustment types:
1. Update `total_stock` on the affected `Product` (increment for INCREASE, decrement for DECREASE).
2. Create a `StockLog` entry with `type: "ADJUST"`, recording the `reason`, `performedBy` user, `previousStock`, and `currentStock`.
3. Create an `Adjustment` document for historical records.

The adjustment history is displayed in a searchable table below the adjustment form, showing: date, product, type, quantity, reason, and who performed it.

---

### 4.2.8 Stock Transaction Log Module

**Backend Files:** `stockLogController.js`, `stockLogRouter.js`
**Frontend Files:** `stocktransactionSlice.js`, `StockTransaction.jsx`

**Implementation Details:**

The Stock Transaction Log is a **read-only, system-generated audit trail**. No user can manually create or modify log entries — they are automatically created by the purchase, sales, and adjustment controllers.

Each entry displays:
- **Product Name** (populated from Product reference)
- **Movement Type** — color-coded badges: `IN` (green), `OUT` (red), `ADJUST` (amber)
- **Quantity** — units moved
- **Reason** — e.g., "Purchase from supplier", "Sale to customer", "Damaged goods"
- **Previous Stock / Current Stock** — before and after values
- **Performed By** — staff member who triggered the action
- **Supplier** — displayed for IN-type movements
- **Date & Time**

Filtering options: by product name and by movement type (IN / OUT / ADJUST).

---

### 4.2.9 Dashboard Module

**Backend Files:** `dashboardController.js`, `dashboardRouter.js`
**Frontend Files:** `Dashboardpage.jsx`

**Implementation Details:**

The dashboard aggregates data from multiple collections using MongoDB's aggregation pipeline to produce a real-time business overview:

**KPI Cards (via `GET /api/dashboard/summary`):**

| KPI | Data Source | Calculation |
|-----|-------------|-------------|
| Total Revenue | Sales collection | `$sum` of `totalAmount` (all sales) |
| Total Products | Products collection | `countDocuments({status: "Active"})` |
| Total Suppliers | Suppliers collection | `countDocuments({status: "Active"})` |
| Low Stock Alerts | Products collection | Count products where `total_stock <= reorderLevel` |
| Monthly Net Profit | Sales collection | `Σ (price - costPrice) × quantity` for current month, minus discounts |

**Charts (via `GET /api/dashboard/charts`):**
- **Monthly Sales Trend Chart:** Aggregation groups sales by month, summing `totalAmount`. Displayed as a bar chart using Chart.js with the last 12 months of data.
- **Top Products Chart:** Aggregation unwinds the `products` array from sales, groups by product, sums quantities sold, and returns the top 5 products.

**Recent Activities (via `GET /api/dashboard/recent`):**
- Fetches the last 10 StockLog entries, populated with product name and user name.
- Also fetches the last 5 purchases and last 5 sales for quick operational overview panels.

**Real-time Updates:** Socket.io emits events from the sales and purchase controllers upon new transactions, and the Dashboard page listens for these events to trigger a data refresh without a full page reload.

---

### 4.2.10 Reports Module

**Backend Files:** `reportController.js`, `reportRouter.js`
**Frontend Files:** `ReportsPage.jsx`

**Implementation Details:**

The Reports module is Admin-only and provides three report types:

- **Sales Report (`GET /api/reports/sales?startDate=&endDate=`):**
  Returns total revenue, total number of sales transactions, average sale value, and top-selling products within the specified date range.

- **Purchase Report (`GET /api/reports/purchases?startDate=&endDate=`):**
  Returns total purchase expenditure, number of purchase orders, and top suppliers by total spend within the date range.

- **Stock Report (`GET /api/reports/stock`):**
  Returns current stock levels for all products, highlights products below reorder level, and provides a category-wise stock summary.

All reports are rendered in the UI with summary statistic cards and a detailed data table.

---

### 4.2.11 Settings Module

**Backend Files:** `settingcontroller.js`, `settingRouter.js`
**Frontend Files:** `settingsSlice.js`, `SettingsPage.jsx`

**Implementation Details:**

Settings are stored as key-value documents in the `settings` collection. The `seedDefaults()` function (called on server startup) ensures all required settings exist with default values:

| Setting Key | Default Value | Purpose |
|------------|---------------|---------|
| `enable_rbac` | `true` | Toggle Role-Based Access Control enforcement |
| `company_name` | `"My Company"` | Displayed on PDF invoices |
| `company_address` | `""` | Displayed on PDF invoices |
| `company_phone` | `""` | Displayed on PDF invoices |
| `default_tax` | `13` | Default VAT rate on new sales |
| `default_discount` | `10` | Default discount on new sales |

When `enable_rbac` is set to `false`, the `adminmiddleware` grants all authenticated users full Admin-level access, useful for single-user deployments.

---

### 4.2.12 User Management Module

**Backend Files:** `authcontroller.js` (user management endpoints)
**Frontend Files:** `Userstatus.jsx`

**Implementation Details:**

- **View All Users (`GET /api/auth/users`):** Admin-only endpoint returning all user accounts.
- **Toggle User Status (`PUT /api/auth/users/:id/status`):** Admin can toggle any user's status between ACTIVE and INACTIVE. The admin's own account cannot be deactivated.
- **Inactive User Blocking:** `authmiddleware` checks `req.user.status === "ACTIVE"` on every request. If the account is INACTIVE, a 403 Forbidden response is returned immediately, effectively locking out the user without deleting their account.

---

## 4.3 User Interface Description

### 4.3.1 Landing Page (HomePage)
The home page presents a professional introduction to the Inventory Management System with a hero section, feature highlights, and navigation links to Login and Sign Up.

### 4.3.2 Login Page
Clean, centered login form with email and password fields with client-side validation. On success, users are redirected to their role-specific dashboard (AdminDashboard or StaffDashboard wrapper).

### 4.3.3 Dashboard Page
The most feature-rich page of the system:
- **4 KPI cards** at the top: Total Revenue, Total Products, Total Suppliers, Low Stock Alert count
- **Net Profit card** showing current month's profit
- **Monthly Sales Trend** bar chart (Chart.js)
- **Top Products** chart (best selling by quantity)
- **Recent Activities** feed (last 10 stock movements)
- **Recent Purchases** and **Recent Sales** summary panels

### 4.3.4 Product Page
Full-page data table with search and category filter. Each row shows: product name, SKU, category, cost price, selling price, current stock (with color-coded low-stock badge), and status. Action buttons for edit and deactivate. "Add Product" opens a slide-over modal with full validation.

### 4.3.5 Supplier Page
Data table for supplier management showing: supplier ID, name, contact person, phone, PAN/VAT, status. Supports search by name and filter by status.

### 4.3.6 Purchase Page
Complex multi-item purchase entry form. User selects a supplier, then adds multiple product rows (each with product, quantity, unit cost price, batch number, and expiry date). Subtotal, discount, tax, and total are calculated in real-time. Existing purchases displayed in a sortable table with a detail view modal and PDF download option.

### 4.3.7 Sales Page
Multi-product sales entry form with real-time total calculation. Selecting a product auto-fills the selling price and displays available stock. Default 13% VAT is applied. The sales history table supports search by customer name or invoice number. The detail modal shows a full invoice breakdown with profit analysis per item.

### 4.3.8 Stock Adjustment Page
Form with product dropdown, adjustment type (Increase/Decrease), quantity, reason (required), and remarks (optional). Adjustment history table below with filtering.

### 4.3.9 Stock Transaction Page
Comprehensive log table with color-coded type badges (IN = green, OUT = red, ADJUST = amber). Shows previous and current stock levels for complete before/after traceability. Filterable by product and transaction type.

### 4.3.10 Reports Page
Tab-based report interface for Sales, Purchase, and Stock reports. Each tab provides: date range pickers, summary statistic cards, and a detailed data table.

### 4.3.11 Settings Page
Tab-based settings interface (Admin only) covering: General (company info), Security (RBAC toggle), and Notifications. Changes are persisted to the `settings` collection immediately.

### 4.3.12 Profile Page
Editable user profile with full name field and profile image upload. Cloudinary serves the uploaded image via CDN-optimized URL. A real-time preview of the uploaded image is displayed before saving.

---

## 4.4 Testing Methodology

The system was tested using a combination of the following testing approaches:

### 4.4.1 Unit Testing
Individual controller functions and utility methods were tested in isolation to verify they produce correct outputs for given inputs. Password hashing/comparison, stock calculation formulas, and PDF generation were verified independently.

### 4.4.2 Integration Testing
API endpoints were tested using **Postman** REST client to verify the complete request-response cycle, including database read/write operations. Tests verified that:
- Correct HTTP status codes are returned (200, 201, 400, 401, 403, 404, 500)
- Response body structure matches expected schema
- Database state changes occur correctly (e.g., stock level updates on purchase/sale)

### 4.4.3 System Testing (End-to-End)
Complete user workflows were tested from the frontend UI:
- Login → Create Purchase → Verify Stock Update → View Stock Log
- Login → Record Sale → Verify Stock Decrement → Download Invoice
- Create Adjustment → Verify Log Entry → View Dashboard Update

### 4.4.4 User Acceptance Testing (UAT)
The completed system was reviewed against every Functional Requirement (FR-01 through FR-11) to verify all requirements are met.

### 4.4.5 Security Testing
The following security scenarios were explicitly tested:
- JWT token tampering (modified tokens are rejected with 401)
- Accessing Admin-only routes with a Staff JWT (rejected with 403)
- Making API calls without any cookie (rejected with 401)
- Logging in as an INACTIVE user (rejected with 403)
- Attempting a sale with insufficient stock (rejected with 400)

---

## 4.5 Test Cases

### Table 4.3: Test Cases — Module 1: Authentication

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-01 | Valid login with correct credentials | Correct email & password | JWT cookie set; redirect to dashboard | Redirected to dashboard with user data | **Pass** |
| TC-02 | Login with incorrect password | Correct email, wrong password | 401 Unauthorized; error toast displayed | 401 returned; "Invalid credentials" toast | **Pass** |
| TC-03 | Login with non-existent email | Unknown email address | 401 Unauthorized | 401 returned | **Pass** |
| TC-04 | Login as INACTIVE user | Email of INACTIVE user | 403 Forbidden — account inactive message | 403 returned; access denied message shown | **Pass** |
| TC-05 | Session restoration on page refresh | Valid JWT cookie exists | `checkAuth` restores session; no redirect to login | User remains logged in after refresh | **Pass** |
| TC-06 | Access protected route with expired token | Expired JWT cookie | Redirect to login page | Redirected to login | **Pass** |
| TC-07 | Signup with duplicate email | Already registered email | 400 error: "Email already registered" | 400 returned; error toast shown | **Pass** |
| TC-08 | Signup with valid unique data | Name, unique email, password | Account created; JWT set; redirect to dashboard | Account created successfully | **Pass** |

### Table 4.4: Test Cases — Module 2: Product Management

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-09 | Add new product with all required fields | Valid name, SKU, category, prices | Product created; appears in product table | Product appears in list with correct data | **Pass** |
| TC-10 | Add product with duplicate SKU | Existing SKU value | 400 error: "SKU already exists" | Duplicate SKU error shown | **Pass** |
| TC-11 | Add product with duplicate name | Existing product name | 400 error: "Product name already exists" | Duplicate name error shown | **Pass** |
| TC-12 | Edit product selling price | Changed selling_price value | Product record updated; new price reflected | Updated price visible in table | **Pass** |
| TC-13 | Deactivate a product | Click deactivate button | Product status → Inactive; disappears from active list | Status changed to Inactive | **Pass** |
| TC-14 | Low stock badge display | Product with stock ≤ reorderLevel | Red/amber low-stock badge on product row | Low stock badge displayed correctly | **Pass** |
| TC-15 | Upload product image | Select an image file | Image uploaded to Cloudinary; URL saved | Image displayed on product card | **Pass** |

### Table 4.5: Test Cases — Module 3: Purchase Management

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-16 | Create single-item purchase | Supplier + 1 product × quantity 10 | Purchase saved; product stock incremented by 10 | Stock updated from N to N+10 | **Pass** |
| TC-17 | Create multi-item purchase | Supplier + 3 different products | Purchase saved; all 3 product stocks updated | All stock levels incremented correctly | **Pass** |
| TC-18 | StockLog IN entry created | Any new purchase | StockLog entry with type "IN" created per item | Log entries visible in Stock Transaction page | **Pass** |
| TC-19 | Cost price updated after purchase | Purchase with new unit cost price | `current_cost_price` on product updated | Product cost price reflects latest purchase | **Pass** |
| TC-20 | Download purchase PDF invoice | Click download icon on purchase row | PDF file downloaded with complete purchase data | PDF downloaded with correct supplier, items, totals | **Pass** |
| TC-21 | Admin deletes a purchase | Admin clicks delete on purchase | Purchase deleted; stock levels reversed | Stock decremented back; log entry created | **Pass** |
| TC-22 | Tax and discount calculation | Purchase with 10% discount, 13% tax | Total = (subtotal − discount) + tax | Calculated total matches expected value | **Pass** |

### Table 4.6: Test Cases — Module 4: Sales Management

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-23 | Create valid sale — sufficient stock | Product with stock > 0; qty ≤ stock | Sale saved; product stock decremented | Stock decremented correctly | **Pass** |
| TC-24 | Attempt sale with insufficient stock | Quantity requested > available stock | Validation error: "Insufficient stock" | 400 error returned; sale not created | **Pass** |
| TC-25 | StockLog OUT entry created | Any new sale | StockLog entry with type "OUT" created per item | Log entries visible in Stock Transaction page | **Pass** |
| TC-26 | VAT calculation on sale | 13% tax, 10% discount | totalAmount = subtotal − discount + (subtotal − discount) × 0.13 | Calculated total matches expected value | **Pass** |
| TC-27 | Download sales PDF invoice | Click generate invoice | PDF with customer name, itemized list, tax, total | PDF downloaded correctly | **Pass** |
| TC-28 | Profit calculation | Sale with cost price and selling price | Profit = Σ (price − costPrice) × quantity | Profit displayed correctly in detail modal | **Pass** |
| TC-29 | Cost price snapshot preservation | Sale recorded; product cost price updated later | Sale profit uses original cost price at time of sale | Historical profit unaffected by price change | **Pass** |

### Table 4.7: Test Cases — Module 5: Stock Adjustment

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-30 | INCREASE adjustment | Product, qty: 5, reason: "Audit found" | Product stock +5; ADJUST log entry created | Stock incremented; log entry visible | **Pass** |
| TC-31 | DECREASE adjustment | Product, qty: 3, reason: "Damaged goods" | Product stock -3; ADJUST log entry created | Stock decremented; log entry visible | **Pass** |
| TC-32 | Adjustment without reason | Empty reason field | Client-side validation error; form not submitted | Form validation error displayed | **Pass** |
| TC-33 | Adjustment history display | Multiple adjustments made | All adjustments shown in history table | History table updated correctly | **Pass** |

### Table 4.8: Test Cases — Module 6: Role-Based Access Control

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-34 | Staff attempts Admin-only API route | Staff JWT; GET /api/settings | 403 Forbidden: "Admin access required" | 403 returned | **Pass** |
| TC-35 | Admin accesses all routes | Admin JWT | Full access granted to all endpoints | All endpoints accessible | **Pass** |
| TC-36 | Unauthenticated API access | No JWT cookie | 401 Unauthorized: "No token provided" | 401 returned | **Pass** |
| TC-37 | RBAC disabled — Staff gets full access | `enable_rbac: false`; Staff JWT | Staff can access Admin-only routes | Full access granted when RBAC disabled | **Pass** |
| TC-38 | Admin cannot deactivate own account | Admin attempts self-deactivation | 400 error: "Cannot deactivate own account" | Error message shown | **Pass** |

### Table 4.9: Test Cases — Module 7: Dashboard

| Test ID | Test Description | Input | Expected Result | Actual Result | Status |
|---------|-----------------|-------|----------------|---------------|--------|
| TC-39 | Total Revenue KPI accuracy | Compare with sum of all sale totalAmounts | Dashboard value matches aggregated DB sum | Values match correctly | **Pass** |
| TC-40 | Low stock alert count | Multiple products at/below reorder level | Dashboard count matches product list filter | Count matches exactly | **Pass** |
| TC-41 | Sales trend chart data | Monthly sales data exists | Chart renders 12 months of bars correctly | Chart displays all data correctly | **Pass** |
| TC-42 | Real-time dashboard update | New sale recorded from another tab | Dashboard data refreshes without page reload | Socket.io triggers data refresh | **Pass** |
| TC-43 | Recent activities feed | Last 10 stock log entries exist | Feed shows 10 most recent log entries | Latest entries displayed in correct order | **Pass** |

---

# CHAPTER 5: CONCLUSION AND RECOMMENDATIONS

## 5.1 Conclusion

The **Inventory Management System** developed using the MERN stack successfully addresses all the objectives established at the start of this project. The system delivers a comprehensive, secure, and user-friendly web-based platform for managing inventory operations suitable for small-to-medium businesses.

The key achievements of this project are:

**1. Complete Business Process Coverage**
The system covers the full inventory lifecycle — from supplier setup and product cataloguing, through purchase stock-in events, to sales stock-out events and manual stock adjustments — with every transaction automatically reflected in real-time stock levels and immutably logged in the audit trail. No manual stock counting or financial reconciliation is required.

**2. Robust Security Architecture**
JWT-based stateless authentication with HTTP-only cookies protects against Cross-Site Scripting (XSS) attacks. Bcrypt password hashing with 10 salt rounds ensures stored credentials are secure even in a database breach. Role-Based Access Control enforced at both the API middleware level and the frontend route level ensures data integrity and operational discipline across user roles.

**3. Modern, Industry-Standard Technology Stack**
The MERN stack provides a unified JavaScript development experience across the full stack, enabling consistent, efficient development. React.js with Redux Toolkit ensures a predictable, testable, and maintainable frontend codebase. The MVC architectural pattern on the backend ensures clean separation of concerns and facilitates future extension.

**4. Real-Time Operational Awareness**
Socket.io integration enables live dashboard updates when new sales or purchases are recorded. The dashboard's KPI cards, chart visualizations, and recent activity feed give managers and administrators instant visibility into business performance without manual report generation.

**5. Professional Feature Quality**
PDFKit-powered invoice generation, Cloudinary image management, Chart.js analytics dashboards, and a complete stock transaction audit log give the system a production-ready, professional quality that surpasses typical academic project scope. The responsive Tailwind CSS interface ensures accessibility on desktop, tablet, and mobile devices.

**6. Practical Value for Nepalese SMBs**
The system is specifically designed for the Nepalese business context — with NPR currency, 13% VAT compliance, PAN/VAT supplier validation, and a deployment model using free-tier cloud services (MongoDB Atlas, Cloudinary, Vercel, Render) that minimizes ongoing operational costs.

This project demonstrates the practical application of advanced full-stack web development principles — RESTful API design, component-based UI architecture, state management with Redux Toolkit, document-oriented database modeling with Mongoose, and real-time communication with Socket.io — and serves as a strong, extensible foundation for a real-world production inventory management solution.

## 5.2 Future Enhancements

The following enhancements are identified for future versions of the system:

### 5.2.1 Barcode and QR Code Scanner Integration
Integrating USB or Bluetooth barcode scanner support would significantly accelerate product lookup during purchase entry and sales processing. Products would be identified by their barcode, eliminating manual product selection from dropdown lists. This is particularly valuable in high-volume retail environments.

### 5.2.2 Multi-Warehouse and Multi-Branch Support
Adding support for multiple storage locations (warehouses, retail branches) would allow businesses with multiple outlets to track inventory separately per location while maintaining a consolidated headquarters view. This would involve adding a `location` dimension to the `Product`, `StockLog`, and `Purchase` schemas.

### 5.2.3 Bulk Data Import and Export (CSV/Excel)
Implementing CSV and Excel import/export functionality would allow businesses to:
- Migrate existing product catalogs and opening stock balances into the system
- Export sales, purchase, and stock reports in spreadsheet-compatible formats for use in external accounting software

### 5.2.4 Customer and Receivables Management Module
Adding a dedicated Customer module with account balance tracking would support businesses that sell on credit. Features would include: customer registration, credit limit setting, outstanding balance tracking, payment recording, and aging reports for overdue receivables.

### 5.2.5 Advanced Analytics and AI-Driven Demand Forecasting
Integrating statistical forecasting models (e.g., moving average, seasonal decomposition) or machine learning models would allow the system to predict future demand for each product based on historical sales trends. This would enable proactive stock replenishment, reduce stockouts, and minimize overstock situations.

### 5.2.6 Mobile Application (React Native)
Developing a companion React Native mobile application connected to the same REST API would allow managers and staff to:
- Check stock levels on the go
- Approve purchase orders remotely
- Receive push notifications for low stock alerts and high-value transactions

### 5.2.7 Automated Email and SMS Alerts
Implementing automated alerts using Nodemailer (email) and SMS APIs (e.g., Sparrow SMS for Nepal) would notify managers when:
- A product falls below its reorder level
- A high-value sale or purchase is recorded
- A new user account is registered

### 5.2.8 Payment Gateway Integration
Integrating with Nepalese digital payment services (eSewa, Khalti, ConnectIPS) would allow the system to track online payment status directly within sales transactions, enabling a complete procure-to-pay and order-to-cash workflow.

### 5.2.9 Purchase Return and Credit Note Management
Adding support for recording purchase returns to suppliers (with negative stock adjustments and credit note generation) would complete the procurement workflow and improve supplier relationship management.

### 5.2.10 Progressive Web App (PWA) Upgrade
Converting the React frontend into a Progressive Web App would provide:
- Offline functionality for viewing last-synced data without an internet connection
- Push notification support on desktop and mobile browsers
- "Add to Home Screen" installation for an app-like experience

---

# REFERENCES

*(IEEE Citation Format)*

[1] MongoDB, Inc., "The MongoDB Manual," MongoDB Documentation, 2024. [Online]. Available: https://www.mongodb.com/docs/. [Accessed: March 2026].

[2] OpenJS Foundation, "Express.js API Reference (v4.x)," Express.js Documentation, 2024. [Online]. Available: https://expressjs.com/en/4x/api.html. [Accessed: March 2026].

[3] Meta Open Source, "React – A JavaScript Library for Building User Interfaces," React Documentation, 2024. [Online]. Available: https://react.dev/. [Accessed: March 2026].

[4] OpenJS Foundation, "Node.js Documentation," Node.js Official Documentation, 2024. [Online]. Available: https://nodejs.org/en/docs/. [Accessed: March 2026].

[5] Redux.js.org, "Redux Toolkit Introduction," Redux Toolkit Documentation, 2024. [Online]. Available: https://redux-toolkit.js.org/. [Accessed: March 2026].

[6] Mongoose.js, "Mongoose v8 Documentation," Mongoose ODM Documentation, 2024. [Online]. Available: https://mongoosejs.com/docs/. [Accessed: March 2026].

[7] Auth0 Inc., "JSON Web Tokens Introduction," JWT.io, 2024. [Online]. Available: https://jwt.io/introduction. [Accessed: March 2026].

[8] Socket.IO, "Socket.IO Documentation v4," Socket.IO Official Documentation, 2024. [Online]. Available: https://socket.io/docs/v4/. [Accessed: March 2026].

[9] Cloudinary Ltd., "Node.js SDK Quick Start Guide," Cloudinary Documentation, 2024. [Online]. Available: https://cloudinary.com/documentation/node_integration. [Accessed: March 2026].

[10] PDFKit, "A PDF Generation Library for Node.js," PDFKit Documentation, 2024. [Online]. Available: https://pdfkit.org/. [Accessed: March 2026].

[11] Tailwind Labs, "Tailwind CSS Documentation," Tailwind CSS Official Documentation, 2024. [Online]. Available: https://tailwindcss.com/docs/. [Accessed: March 2026].

[12] S. Tilkov and S. Vinoski, "Node.js: Using JavaScript to Build High-Performance Network Programs," *IEEE Internet Computing*, vol. 14, no. 6, pp. 80-83, Nov.–Dec. 2010.

[13] D. Flanagan, *JavaScript: The Definitive Guide*, 7th ed. Sebastopol, CA: O'Reilly Media, 2020.

[14] A. Freeman, *Pro MERN Stack: Full Stack Web App Development with Mongo, Express, React, and Node*, 2nd ed. New York: Apress, 2019.

[15] M. Haverbeke, *Eloquent JavaScript*, 3rd ed. San Francisco: No Starch Press, 2018. [Online]. Available: https://eloquentjavascript.net/.

[16] Tribhuvan University, Faculty of Humanities and Social Sciences, "BCA Project II (CAPJ356) Guidelines," Kirtipur, Kathmandu, Nepal, 2025/2026.

---

# APPENDICES

## Appendix A: System Requirements

### Table A.1: Minimum Hardware Requirements (Client/End User)

| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Dual-core 1.5 GHz or higher |
| RAM | 4 GB (8 GB recommended) |
| Storage | 10 GB free disk space |
| Network | Broadband internet connection (minimum 1 Mbps) |
| Display | 1280 × 720 resolution minimum |

### Table A.2: Software Requirements

| Software | Requirement |
|----------|------------|
| **End User (Client)** | |
| Web Browser | Google Chrome 88+, Mozilla Firefox 85+, Microsoft Edge 88+, Safari 14+ |
| Operating System | Windows 10/11, macOS 10.14+, Ubuntu 20.04+, or any modern OS with a supported browser |
| **Developer (Development Environment)** | |
| Node.js | v18 LTS or higher |
| npm | v8.0 or higher |
| Git | Any version (for source control) |
| Code Editor | Visual Studio Code (recommended) |

---

## Appendix B: Installation and Setup Guide

### B.1 Backend Setup

```bash
# Step 1: Navigate to the backend directory
cd backend

# Step 2: Install all Node.js dependencies
npm install

# Step 3: Create the environment configuration file
# Create a file named .env in the /backend directory with the following content:

PORT=3003
MONGO_URI=<your_mongodb_atlas_connection_string>
SecretKey=<your_jwt_secret_key_minimum_32_characters>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
FRONTEND_URLS=http://localhost:3000,http://localhost:5173
NODE_ENV=development

# Step 4: Start the development server (with auto-restart)
npm run dev

# The backend server starts at: http://localhost:3003
```

### B.2 Frontend Setup

```bash
# Step 1: Navigate to the frontend directory
cd frontend

# Step 2: Install all React dependencies
npm install

# Step 3: Create the environment configuration file
# Create a file named .env in the /frontend directory with the following content:

REACT_APP_API_URL=http://localhost:3003

# Step 4: Start the React development server
npm start

# The frontend application opens at: http://localhost:3000
```

### B.3 First-Time Setup

1. Open a browser and navigate to `http://localhost:3000`
2. Click **Sign Up** to create the first Admin account.
3. Log in using the registered credentials.
4. Navigate to **Settings** to configure company information (name, address, phone) that appears on PDF invoices.
5. Add product categories first, then products, then suppliers.
6. The system is now ready for purchase and sales operations.

---

## Appendix C: API Request/Response Examples

### C.1 Authentication — Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "65f2a3b4c1d2e3f4a5b6c7d8",
    "full_name": "System Admin",
    "email": "admin@company.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "profile_image": null
  }
}
```
*Note: JWT token is set as an HTTP-only cookie named `Inventorymanagmentsystem`.*

### C.2 Create a Sale

```http
POST /api/sales
Content-Type: application/json
Cookie: Inventorymanagmentsystem=<jwt_token>

{
  "customerName": "Ram Bahadur",
  "products": [
    {
      "product": "65f1a2b3c4d5e6f7a8b9c0d1",
      "quantity": 2,
      "price": 1500,
      "costPrice": 1000
    }
  ],
  "discountPercentage": 10,
  "taxPercentage": 13,
  "paymentType": "Cash",
  "notes": "Walk-in customer"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Sale recorded successfully",
  "sale": {
    "_id": "65f3b4c5d6e7f8a9b0c1d2e3",
    "invoiceNumber": "INV-2026-00042",
    "customerName": "Ram Bahadur",
    "totalAmount": 3050.50,
    "saleDate": "2026-03-28T09:00:00.000Z"
  }
}
```

---

## Appendix D: Database Collection Summary

| Collection | Approx. Documents | Primary Purpose |
|-----------|------------------|-----------------|
| users | 5 – 50 | Authentication and access control |
| products | 50 – 500 | Product catalog with stock levels |
| categories | 5 – 30 | Product classification |
| suppliers | 10 – 100 | Supplier directory |
| purchases | 100s – 1,000s | Purchase transaction history |
| sales | 100s – 1,000s | Sales transaction history |
| adjustments | 50 – 500 | Manual stock correction records |
| stocklogs | Very High (auto-generated) | Complete stock movement audit trail |
| settings | 10 – 20 key-value pairs | System configuration |

---

## Appendix E: Supervisor Log Sheet

| S.N. | Date | Activities Performed | Supervisor's Remarks | Signature |
|------|------|---------------------|---------------------|-----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
| 14 | | | | |
| 15 | | | | |

---

*End of Project Report*

---

**Tribhuvan University – BCA 6th Semester**
**Course: Project II (CAPJ356) — 2 Credits**
**Project Title: Inventory Management System**
**Academic Year: 2025/2026 (2082/2083 B.S.)**
**Submitted by: [Student Full Name], Roll No: [Roll Number]**
