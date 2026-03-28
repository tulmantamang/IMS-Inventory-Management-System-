
---
# TRIBHUVAN UNIVERSITY
## Faculty of Humanities and Social Sciences
### Bachelor of Computer Applications (BCA)
### 6th Semester — Project II (CAPJ356)

---

# INVENTORY MANAGEMENT SYSTEM

**A Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of Bachelor in Computer Application**

---

**Submitted by:**

[Student Full Name]
TU Registration No: [Registration Number]
Roll No: [Roll Number]

**Submitted to:**

Department of Computer Science and Information Technology
[College Name]
[College Address]
Kathmandu, Nepal

**Date:** March, 2026

---

## CERTIFICATE OF APPROVAL

This project report entitled **"Inventory Management System"** submitted by **[Student Full Name]**, TU Registration No. **[Registration Number]**, Roll No. **[Roll Number]** in partial fulfillment of the requirements for the Degree of Bachelor of Computer Applications (BCA) has been examined and approved.

&nbsp;

**Head of Department**
Name: ___________________________
Signature: ___________________________
Date: ___________________________

**External Examiner**
Name: ___________________________
Signature: ___________________________
Date: ___________________________

**Supervisor**
Name: ___________________________
Designation: ___________________________
Signature: ___________________________
Date: ___________________________

---

## SUPERVISOR'S RECOMMENDATION

This is to certify that the project report entitled **"Inventory Management System"** submitted by **[Student Full Name]**, TU Registration No. **[Registration Number]**, for the degree of Bachelor of Computer Applications (BCA) has been carried out under my supervision. This project work is found to be original and ready for submission.

**Supervisor:**
[Supervisor Name]
Designation: [Designation]
Department of Computer Science
[College Name]

**Date:** March 2026

---

## DECLARATION

I hereby declare that the project work entitled **"Inventory Management System"** submitted as partial fulfillment of the requirement for the degree of Bachelor of Computer Applications (BCA) under Tribhuvan University is an original work done by me and has not been submitted earlier to any university or institution for the award of any degree or diploma. All sources of information used in this report have been duly acknowledged.

**Signature:** ___________________________
**Name:** [Student Full Name]
**Roll No:** [Roll Number]
**Date:** March 2026
**Place:** Kathmandu, Nepal

---

## ACKNOWLEDGEMENT

First and foremost, I would like to express my deep gratitude to **Tribhuvan University** and my college for providing this opportunity to develop a real-world project as part of the BCA curriculum.

I am sincerely grateful to my project supervisor, **[Supervisor Name]**, for providing constant guidance, encouragement, and support throughout the development of this project. His/her invaluable suggestions and technical insights greatly helped in bringing this project to fruition.

I would also like to extend my heartfelt thanks to the **Head of the Department** and all the faculty members of the Department of Computer Science for their continuous support and motivation.

I am also thankful to my classmates and friends who provided valuable feedback during the testing phase of the system.

Finally, I express my sincere gratitude to my **family** for their moral support and encouragement throughout the project period.

**[Student Full Name]**
BCA 6th Semester
[College Name]
March 2026

---

## ABSTRACT

The **Inventory Management System** is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The system is designed to streamline and automate the core business operations of a small-to-medium business, covering product management, supplier management, purchase tracking, sales processing, stock adjustment, and comprehensive reporting.

The system implements Role-Based Access Control (RBAC) with two user roles — **Admin** and **Staff** — ensuring each user accesses only the functionality relevant to their responsibility. Real-time updates are delivered using **Socket.io**, while **JWT (JSON Web Token)**-based authentication with HTTP-only cookies ensures secure user sessions. Passwords are stored securely using the **Bcrypt** hashing algorithm.

Key features include an interactive analytics dashboard with Chart.js visualizations, automated PDF invoice generation using PDFKit, Cloudinary-based product image management, stock-level monitoring with reorder-level alerts, and a complete stock transaction log for audit traceability.

The system is deployed with the React.js frontend on Vercel and the Node.js/Express.js backend on Render, connected to a MongoDB Atlas cloud database. The development follows a modular MVC (Model-View-Controller) architecture on the backend and a feature-based Redux Toolkit slice architecture on the frontend.

This documentation covers the complete software development lifecycle — from requirement analysis and system design to implementation, testing, and deployment — following the standards of a Tribhuvan University BCA 6th Semester Project Report.

---

## TABLE OF CONTENTS

| Chapter | Title | Page |
|---------|-------|------|
| | Certificate of Approval | i |
| | Supervisor's Recommendation | ii |
| | Declaration | iii |
| | Acknowledgement | iv |
| | Abstract | v |
| | Table of Contents | vi |
| | List of Figures | viii |
| | List of Tables | ix |
| | List of Abbreviations | x |
| **1** | **Introduction** | 1 |
| 1.1 | Background | 1 |
| 1.2 | Problem Statement | 2 |
| 1.3 | Objectives | 3 |
| 1.4 | Scope of the Project | 3 |
| 1.5 | Limitations | 4 |
| 1.6 | Report Organization | 4 |
| **2** | **Background Study and Literature Review** | 5 |
| 2.1 | Related Works | 5 |
| 2.2 | Review of Technologies | 6 |
| **3** | **System Analysis and Design** | 11 |
| 3.1 | Existing System | 11 |
| 3.2 | Proposed System | 12 |
| 3.3 | Feasibility Study | 13 |
| 3.4 | Functional Requirements | 14 |
| 3.5 | Non-Functional Requirements | 16 |
| 3.6 | System Architecture | 17 |
| 3.7 | Database Design (ER Diagram) | 19 |
| 3.8 | Use Case Diagram | 25 |
| 3.9 | Data Flow Diagram | 26 |
| 3.10 | Sequence Diagram | 28 |
| **4** | **Implementation and Testing** | 29 |
| 4.1 | Tools and Technologies Used | 29 |
| 4.2 | Module Description | 30 |
| 4.3 | User Interface Screenshots | 38 |
| 4.4 | Testing Methodology | 39 |
| 4.5 | Test Cases | 40 |
| **5** | **Conclusion and Recommendations** | 46 |
| 5.1 | Conclusion | 46 |
| 5.2 | Future Enhancements | 47 |
| | **References** | 49 |
| | **Appendices** | 50 |

---

## LIST OF FIGURES

| Figure No. | Title | Page |
|------------|-------|------|
| Figure 3.1 | Three-Tier System Architecture | 17 |
| Figure 3.2 | Backend MVC Architecture | 18 |
| Figure 3.3 | ER Diagram — Users & Products | 19 |
| Figure 3.4 | ER Diagram — Purchases & Suppliers | 21 |
| Figure 3.5 | ER Diagram — Sales & Stock Logs | 22 |
| Figure 3.6 | Complete Entity Relationship Overview | 24 |
| Figure 3.7 | Use Case Diagram — Admin | 25 |
| Figure 3.8 | Use Case Diagram — Staff | 25 |
| Figure 3.9 | Level 0 DFD (Context Diagram) | 26 |
| Figure 3.10 | Level 1 DFD | 27 |
| Figure 3.11 | Sequence Diagram — Recording a Sale | 28 |
| Figure 4.1 | Authentication Flow Diagram | 31 |
| Figure 4.2 | Dashboard Screenshot | 38 |
| Figure 4.3 | Product Management Page | 38 |
| Figure 4.4 | Purchase Entry Form | 38 |
| Figure 4.5 | Sales Entry Form | 39 |
| Figure 4.6 | Stock Transaction Log | 39 |

---

## LIST OF TABLES

| Table No. | Title | Page |
|-----------|-------|------|
| Table 3.1 | Comparison: Existing vs. Proposed System | 12 |
| Table 3.2 | Users Collection Schema | 20 |
| Table 3.3 | Products Collection Schema | 20 |
| Table 3.4 | Categories Collection Schema | 21 |
| Table 3.5 | Suppliers Collection Schema | 21 |
| Table 3.6 | Purchases Collection Schema | 22 |
| Table 3.7 | Sales Collection Schema | 23 |
| Table 3.8 | Adjustments Collection Schema | 23 |
| Table 3.9 | StockLogs Collection Schema | 24 |
| Table 3.10 | Settings Collection Schema | 24 |
| Table 4.1 | Tools and Technologies Used | 29 |
| Table 4.2 | API Endpoints Summary | 30 |
| Table 4.3 | Test Cases — Authentication | 40 |
| Table 4.4 | Test Cases — Product Management | 41 |
| Table 4.5 | Test Cases — Purchase Management | 42 |
| Table 4.6 | Test Cases — Sales Management | 43 |
| Table 4.7 | Test Cases — Stock Adjustment | 44 |
| Table 4.8 | Test Cases — Role-Based Access Control | 44 |
| Table 4.9 | Test Cases — Dashboard | 45 |
| Table A.1 | Minimum Hardware Requirements | 50 |
| Table A.2 | Software Requirements | 50 |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|-------------|-----------|
| API | Application Programming Interface |
| BSON | Binary JavaScript Object Notation |
| BCA | Bachelor of Computer Applications |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| DFD | Data Flow Diagram |
| ER | Entity Relationship |
| HTTP | Hypertext Transfer Protocol |
| IMS | Inventory Management System |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| MERN | MongoDB, Express.js, React.js, Node.js |
| MVC | Model-View-Controller |
| MVP | Minimum Viable Product |
| NoSQL | Not Only SQL |
| NPR | Nepalese Rupee |
| ODM | Object Document Mapper |
| PAN | Permanent Account Number |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SKU | Stock Keeping Unit |
| SMB | Small and Medium-sized Business |
| SPA | Single Page Application |
| TU | Tribhuvan University |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UUID | Universally Unique Identifier |
| VAT | Value Added Tax |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background

In today's rapidly evolving business environment, efficient management of inventory is critical to the success of any organization dealing with physical goods. Traditional paper-based or spreadsheet-based inventory management is prone to errors, delays, and data inconsistencies. As businesses grow, the complexity of managing products, suppliers, purchases, and sales increases exponentially, making manual management impractical and inefficient.

An **Inventory Management System (IMS)** is a software solution designed to track, manage, and organize products and stock levels across a business lifecycle — from procurement through to sale. With the proliferation of internet access and web technologies, web-based inventory systems have become increasingly popular because they provide real-time access from any location, multi-user collaboration, and centralized data management.

Small and medium-sized businesses (SMBs) in Nepal face particular challenges in this area. Many rely on physical registers or spreadsheet tools that lack automation, access controls, and reporting capabilities. The need for an affordable, locally adaptable, web-based solution is clear.

This project presents the development of a **web-based Inventory Management System** built using the **MERN stack** — MongoDB, Express.js, React.js, and Node.js. These are modern, industry-standard technologies widely adopted for building scalable and high-performance web applications. The system was developed to address the real-world operational needs of small-to-medium businesses in Nepal, providing a comprehensive yet user-friendly platform for managing all aspects of inventory operations.

## 1.2 Problem Statement

Many small and medium-sized businesses in Nepal still rely on manual methods — paper registers or spreadsheet tools — for managing their inventory. This approach leads to several critical problems:

1. **Data Inconsistency:** Manually maintained records are prone to human error, duplication, and inconsistency, leading to incorrect stock counts and financial discrepancies.

2. **Lack of Real-Time Information:** Without a centralized system, it is impossible to obtain real-time visibility into current stock levels, purchase history, or sales performance.

3. **Inefficient Supplier Management:** Tracking supplier details, purchase invoices, and payment modes manually is cumbersome and error-prone.

4. **No Role-Based Access Control:** In a multi-user environment, manual systems lack the ability to restrict access based on user roles, leading to potential data misuse or unauthorized modifications.

5. **Poor Reporting Capability:** Generating meaningful reports (e.g., stock summaries, profit/loss analysis, category-wise breakdown) from manual records is time-consuming and frequently inaccurate.

6. **No Audit Trail:** Manual systems do not maintain a detailed transaction history, making it difficult to investigate discrepancies or track who performed which operation.

7. **Risk of Data Loss:** Physical records are vulnerable to physical damage, loss, or theft. Without backups, critical business data can be permanently lost.

This project addresses all of the above problems by developing a fully automated, secure, role-aware, web-based Inventory Management System.

## 1.3 Objectives

The primary objectives of this project are:

1. To develop a web-based inventory management system using the MERN stack (MongoDB, Express.js, React.js, Node.js).
2. To implement a secure, JWT-based user authentication system with Role-Based Access Control (RBAC) for Admin and Staff roles.
3. To provide complete CRUD operations for products, categories, suppliers, purchases, and sales.
4. To implement real-time stock tracking that automatically updates inventory levels upon purchase (stock IN) and sale (stock OUT) transactions.
5. To provide a stock adjustment module for handling discrepancies such as damage, returns, and manual corrections.
6. To generate a detailed stock transaction log for complete auditability of every stock movement.
7. To provide an analytics dashboard with visual charts for sales trends, stock summaries, and key financial metrics.
8. To support PDF invoice generation for purchase and sales transactions using PDFKit.
9. To implement a responsive, modern user interface accessible on desktop and mobile devices.
10. To incorporate real-time notifications using Socket.io for system events and dashboard updates.

## 1.4 Scope of the Project

The **Inventory Management System** covers the following scope:

**Included in Scope:**
- User account management with Admin and Staff roles and role-based access control
- Product and category management (with SKU, pricing, stock levels, reorder-level alerts, and product images)
- Supplier management with contact details, address, and PAN/VAT registration
- Purchase order management with multi-item support, tax and discount calculations, batch number, and expiry date tracking
- Sales management with customer details, product selection, VAT (13%), discount, and profit calculation
- Stock adjustment for manual corrections (Increase/Decrease) with mandatory reason
- Stock transaction log for complete audit trail of all IN, OUT, and ADJUST movements
- Dashboard with KPI cards, monthly sales trend chart, top products, and recent activity feed
- Report generation for sales, purchases, and stock summaries with date range filtering
- Settings management including RBAC toggle, company information, and tax rate defaults
- User profile management with Cloudinary-based profile image upload
- PDF invoice generation for both purchases and sales

**Excluded from Scope:**
- Multi-warehouse or multi-branch inventory management
- Integration with external accounting software (e.g., Tally, QuickBooks)
- Barcode or QR code scanner hardware integration
- Mobile application development (iOS/Android native apps)
- E-commerce customer-facing storefront
- Integration with payment gateways (eSewa, Khalti)
- Bulk CSV/Excel data import and export

## 1.5 Limitations

While the system provides a comprehensive solution for inventory management, the following limitations exist in the current version:

1. The system is designed for single-location business use and does not support multi-warehouse or multi-branch operations.
2. There is no integration with physical barcode scanners or POS (Point of Sale) hardware terminals.
3. The system does not support multi-currency transactions; all monetary values are in Nepalese Rupees (NPR).
4. Advanced demand forecasting or AI-driven stock prediction is not included in the current version.
5. The system does not provide integration with third-party payment gateways.
6. Bulk data import/export via CSV or Excel is not implemented in the current version.
7. The system requires an active internet connection as it relies on a cloud-hosted database (MongoDB Atlas).

## 1.6 Report Organization

This report is organized into the following chapters:

- **Chapter 1 – Introduction:** Background, problem statement, objectives, scope, and limitations of the project.
- **Chapter 2 – Background Study and Literature Review:** Review of related works — existing systems — and the technologies used in the project.
- **Chapter 3 – System Analysis and Design:** Analysis of the existing and proposed system, feasibility study, functional and non-functional requirements, system architecture, database schema, use case diagrams, DFDs, and sequence diagrams.
- **Chapter 4 – Implementation and Testing:** Development tools used, module-by-module implementation description, user interface overview, testing methodology, and test case documentation.
- **Chapter 5 – Conclusion and Recommendations:** Summary of project achievements and proposed future enhancements.

---

# CHAPTER 2: BACKGROUND STUDY AND LITERATURE REVIEW

## 2.1 Related Works

Several inventory management systems and academic research works exist in the domain of web-based inventory tracking. A review of relevant systems is presented below:

**1. Odoo Community Edition (Open Source ERP)**

Odoo is a widely used open-source Enterprise Resource Planning (ERP) solution with comprehensive inventory management capabilities. It provides features including multi-warehouse management, product variants, purchase order tracking, and manufacturer routing. However, Odoo is highly complex to configure and requires significant technical expertise to deploy and maintain. It is better suited for large enterprises with dedicated IT teams. The proposed system differs from Odoo in that it is purpose-built for simplicity, affordability, and ease of use for SMBs in Nepal.

**2. Zoho Inventory**

Zoho Inventory is a cloud-based SaaS inventory management tool offering order management, warehouse management, and e-commerce platform integration. It is a commercial product with monthly subscription costs that may be unaffordable for small Nepali businesses. The proposed system provides similar core functionality in a locally deployable, customizable, and open-source manner without recurring license costs.

**3. Academic Research — Previous TU BCA Projects**

Previous BCA projects at Tribhuvan University have implemented inventory systems using PHP/MySQL or JSP/Servlet technologies. These systems — while functional — lack modern architectural patterns such as RESTful API design, real-time communication, component-based UI, and centralized state management. The proposed system improves upon those designs by adopting the MERN stack and implementing industry-standard practices including JWT authentication, Redux state management, and Socket.io real-time communication.

**4. MERN Stack Research**

Several research papers confirm the suitability of the MERN stack for building real-time web applications. Studies demonstrate that Node.js-based servers outperform traditional PHP servers in handling concurrent API requests due to Node.js's event-driven, non-blocking I/O model (Tilkov & Vinoski, 2010). MongoDB's flexible document model reduces the impedance mismatch between application data structures and persistent storage, making it particularly suitable for evolving business applications.

## 2.2 Review of Technologies

### 2.2.1 MongoDB

MongoDB is a NoSQL, document-oriented database that stores data as BSON (Binary JSON) documents. Unlike relational databases, MongoDB does not enforce a fixed schema, allowing flexible data modeling suited to evolving requirements. Key advantages for this project include:

- **Flexible Schema:** Product, supplier, and sales documents can evolve without requiring database migrations.
- **Embedded Documents:** Purchase items are stored as embedded arrays within purchase documents, eliminating complex JOIN operations.
- **Aggregation Framework:** MongoDB's powerful aggregation pipeline enables complex analytics required for dashboard metrics such as monthly revenue trends and top-performing products.
- **Mongoose ODM:** The Mongoose library provides schema validation, type casting, lifecycle hooks (pre/post middleware), and population (document joining) for MongoDB in Node.js applications.
- **MongoDB Atlas:** The cloud-hosted Atlas service provides managed database backups, replication, and horizontal scalability.

### 2.2.2 Express.js

Express.js is a minimal, unopinionated web application framework for Node.js. It provides a robust feature set for building RESTful API servers. In this project, Express.js is used to:

- Define modular RESTful API routes organized by business domain (auth, product, supplier, sales, purchase, adjustments, stock log, dashboard, reports, settings).
- Apply middleware for JWT authentication verification, request body parsing (JSON), CORS handling, and cookie parsing.
- Structure the application using the Model-View-Controller (MVC) architectural pattern, where controllers contain business logic, models define data structures, and routers define HTTP endpoints.

### 2.2.3 React.js

React.js is a component-based JavaScript library developed by Meta for building user interfaces. It enables the creation of reusable UI components that manage their own state. Key React.js features used in this project:

- **Component Architecture:** Each page (Dashboard, Products, Purchase, Sales, etc.) and UI element (forms, modals, tables, charts) is an independent, reusable React component.
- **React Router DOM v6:** Client-side routing is implemented using React Router, enabling a Single Page Application (SPA) experience without full page reloads.
- **React Hooks:** Functional components with React hooks (`useState`, `useEffect`, `useRef`, `useCallback`) are used throughout for state and lifecycle management.
- **React Hot Toast:** Provides instant, user-friendly notification toasts for all user actions (success, error, loading states).
- **Framer Motion:** Used for smooth UI animations and transitions.

### 2.2.4 Node.js

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that enables server-side JavaScript execution. Its event-driven, non-blocking I/O model makes it highly efficient for handling concurrent requests from multiple users. In this project, Node.js serves as the backend runtime powering the Express.js server, running on port 3003.

### 2.2.5 Redux Toolkit

Redux Toolkit is the official, opinionated toolset for predictable global state management in React applications. It significantly simplifies the standard Redux pattern by providing `createSlice` and `createAsyncThunk` utilities. It is used in this project to manage global application state across 9 separate feature slices:

- `authSlice` — current authenticated user, login/logout status
- `productSlice` — products list, loading states
- `categorySlice` — product categories
- `supplierSlice` — supplier data
- `purchaseSlice` — purchase orders
- `salesSlice` — sales transactions
- `adjustmentSlice` — stock adjustments
- `stocktransactionSlice` — stock log entries
- `settingsSlice` — application settings

### 2.2.6 JSON Web Token (JWT)

JSON Web Token is an open standard (RFC 7519) for securely transmitting information between parties as a compact, self-contained JSON object that is digitally signed. In this system:

- Upon successful login, the server generates a signed JWT containing the user's `_id`, signed using a server-side `SecretKey`.
- The token is stored in an **HTTP-only cookie** (inaccessible to client-side JavaScript, protecting against XSS attacks) named `Inventorymanagmentsystem`.
- Every subsequent protected API request sends this cookie automatically; the `authmiddleware` verifies the token and attaches the user document to `req.user`.
- Token expiry enforces session management without server-side storage (stateless authentication).

### 2.2.7 Socket.io

Socket.io is a JavaScript library for real-time, bidirectional, event-based communication between browser and server. It is built on the WebSocket protocol with automatic fallback support. In this project, Socket.io enables real-time dashboard updates and live activity notifications without requiring page refreshes.

### 2.2.8 Cloudinary

Cloudinary is a cloud-based digital asset management service specializing in image and video storage, transformation, and delivery. It is used in this project for:

- Uploading and securely storing user profile images.
- Uploading and storing product images.
- Returning CDN-optimized, secure HTTPS image URLs for display in the React frontend.

### 2.2.9 PDFKit

PDFKit is a JavaScript PDF generation library for Node.js. It generates PDF documents programmatically using a stream-based API. In this system, PDFKit is used to generate professional, downloadable purchase invoices and sales invoices containing company information, transaction details, itemized tables, tax summaries, and totals.

### 2.2.10 Bcrypt.js

Bcrypt.js is a library for hashing passwords using the bcrypt adaptive hashing algorithm. All user passwords are hashed with **10 salt rounds** before being stored in MongoDB. This ensures plaintext passwords are never persisted and that the hashes are computationally expensive to brute-force.

### 2.2.11 Tailwind CSS and DaisyUI

Tailwind CSS is a utility-first CSS framework that provides low-level CSS utility classes for rapid UI development. DaisyUI extends Tailwind CSS with pre-built component classes (buttons, forms, modals, badges). Together, they are used to create the responsive, modern user interface of the frontend.

---

# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

## 3.1 Existing System

The existing methods of inventory management commonly used by small businesses in Nepal typically include:

1. **Manual Registers (Physical Ledgers):** Physical books used to record stock-in and stock-out transactions by hand. These are highly prone to human error, difficult to search, impossible to aggregate analytically, and carry a risk of data loss due to physical damage.

2. **Spreadsheets (MS Excel / Google Sheets):** A step above paper registers, spreadsheets allow basic arithmetic calculations but fundamentally lack multi-user concurrent access, role-based access control, automated stock updates, real-time features, and proper audit trails.

3. **Generic Accounting Software (e.g., Tally):** Some businesses use accounting tools like Tally ERP. However, these are primarily designed for financial accounting, not inventory-specific operations. They are expensive to license, require significant training, and do not provide a modern web-based interface accessible from any device.

**Key Drawbacks of the Existing System:**

- No centralized, web-accessible data storage — files reside on individual machines
- No user authentication or role-based access control
- High risk of data loss from hardware failure or physical damage
- No support for real-time analytics, charts, or KPI dashboards
- No mechanism to track who performed which operation (no audit trail)
- No automated stock level updates upon sale or purchase
- Inefficient management of multiple product categories and suppliers simultaneously
- Manual invoice creation is time-consuming and prone to calculation errors

## 3.2 Proposed System

The proposed **web-based Inventory Management System** overcomes all identified limitations of the existing system:

- **Centralized Cloud Database:** All data is stored in MongoDB Atlas, accessible securely from any device with an internet connection.
- **Secure Authentication:** JWT-based login system with Bcrypt password hashing.
- **Role-Based Access Control:** Admin users have full system access; Staff users have operational access only. RBAC is enforced at both the API middleware level and the frontend route level.
- **Automated Stock Management:** Stock levels are automatically incremented when purchases are recorded and decremented when sales are created — no manual intervention required.
- **Complete Audit Trail:** Every stock movement (IN, OUT, ADJUST) is automatically logged in the `StockLogs` collection with full details of who performed it, when, and why.
- **Comprehensive Reporting:** Pre-built reports for sales, purchases, and stock summaries with date range filtering.
- **Real-Time Dashboard:** KPI cards, interactive charts (Chart.js), and recent activity feed.
- **PDF Invoice Generation:** Professional, downloadable PDF invoices for both purchases and sales.
- **Modern Web Interface:** Fully responsive React.js UI with Tailwind CSS, accessible from desktop, tablet, and mobile browsers.

**Table 3.1: Comparison of Existing vs. Proposed System**

| Feature | Existing System | Proposed System |
|---------|----------------|-----------------|
| Data Storage | Paper ledgers / Excel | MongoDB Atlas (Cloud) |
| Multi-user Access | Not supported | Yes — concurrent users |
| Role-Based Access Control | Not supported | Yes — Admin / Staff |
| Real-time Stock Update | Manual | Automatic (on purchase/sale) |
| Analytics & Reports | Not supported | Charts + Downloadable PDF reports |
| Remote Access | Not available | Yes — any browser, any device |
| Invoice Generation | Manual / paper | Automated PDF generation |
| Audit Trail | Not supported | Yes — complete Stock Log |
| Data Backup | Manual / none | Automatic (MongoDB Atlas) |
| Search & Filter | Not available | Yes — all modules |

## 3.3 Feasibility Study

### 3.3.1 Technical Feasibility

The MERN stack (MongoDB, Express.js, React.js, Node.js) is a mature, extensively documented, and industry-proven technology stack. All components are open-source with large active communities and extensive learning resources. The development environment requires only Node.js and npm installed on the developer's machine. Deployment is achievable on free-tier cloud platforms: Vercel for the frontend, Render for the backend, and MongoDB Atlas for the database. No proprietary or paid development tools are required. The project is **technically feasible**.

### 3.3.2 Economic Feasibility

All primary technologies and hosting platforms used in this project are available at no cost for development and low-scale production:

- **MongoDB Atlas (Free Tier):** 512 MB shared storage — sufficient for project scale
- **Cloudinary (Free Tier):** 25 GB storage and bandwidth
- **Node.js, Express.js, React.js:** Open-source, free to use
- **Vercel / Render Hosting:** Free hobby tier available
- **Tailwind CSS, Socket.io, PDFKit, JWT:** All open-source

Total estimated development cost: **NPR 0 – 2,000** (optional domain registration only). The project is **economically feasible**.

### 3.3.3 Operational Feasibility

The system is designed with a clean, intuitive user interface guided by modern UX principles. Staff members with basic computer literacy can learn to use the operational modules (purchase entry, sales entry, adjustments) within a short onboarding period. The Admin panel provides comprehensive management features that are accessed infrequently by authorized personnel. Context-sensitive client-side form validation and real-time toast notifications provide immediate feedback, reducing user error. The system is **operationally feasible**.

### 3.3.4 Schedule Feasibility

The project was developed over approximately **three months**, covering the phases of requirement analysis, system design, backend API development, frontend development, integration, testing, and documentation. This timeline is achievable within the BCA 6th semester project schedule. The project is **schedule feasible**.

## 3.4 Functional Requirements

Functional requirements define what the system shall do:

### FR-01: User Authentication and Account Management
- The system shall allow new users to register with full name, email, password, and role assignment.
- The system shall authenticate users by verifying their email and hashed password.
- The system shall generate a signed JWT token stored in an HTTP-only cookie upon successful login.
- The system shall support profile image upload and name update via the Profile page.
- The system shall allow Admin users to view all user accounts and toggle user status (Active/Inactive).
- Inactive users shall be blocked from accessing the system at the middleware level.

### FR-02: Product Management
- The system shall allow adding products with name, SKU, category, description, cost price, selling price, reorder level, and an optional product image.
- The system shall display the current stock quantity for each product.
- The system shall allow editing product details (price, description, reorder level, etc.).
- The system shall support soft deletion (deactivation) of products.
- The system shall display a low-stock visual warning when a product's `total_stock` falls at or below its `reorderLevel`.

### FR-03: Category Management
- The system shall allow creating, editing, and deactivating product categories.
- Each category shall have a name, description, and active/inactive status.
- Deletion of categories with associated products shall be prevented.

### FR-04: Supplier Management
- The system shall allow adding suppliers with name, contact person, phone, email, address, PAN/VAT number, and an auto-generated unique supplier ID (format: `SUP-XXXX`).
- The system shall allow editing and deactivating supplier records.
- Deletion of suppliers linked to existing purchase records shall be prevented.

### FR-05: Purchase Management
- The system shall allow recording multi-item purchase orders, each linked to a supplier.
- Each purchase shall capture: invoice number, items (product, quantity, cost price, batch number, expiry date), discount percentage, tax percentage, total amount, payment type, notes, and purchase date.
- Upon saving a purchase, the system shall automatically:
  - Increment `total_stock` for each purchased product.
  - Update `current_cost_price` of each product with the latest purchase price.
  - Create a **StockLog entry** (type: `IN`) for each item.
- The system shall support generating and downloading a PDF invoice for each purchase.
- Admin users shall be able to delete a purchase, which reverses all stock changes.

### FR-06: Sales Management
- The system shall allow recording sales transactions with: customer name, selected products and quantities, discount percentage, VAT (default 13%), payment type, and notes.
- The system shall validate that sufficient stock exists before allowing a sale to be saved.
- Upon saving a sale, the system shall automatically:
  - Decrement `total_stock` for each sold product.
  - Create a **StockLog entry** (type: `OUT`) for each item.
- Price and cost price snapshots shall be stored at the time of sale for historical accuracy.
- The system shall support generating and downloading a PDF invoice for each sale.
- Profit per sale shall be calculated as: `(selling_price − cost_price) × quantity` for each item.

### FR-07: Stock Adjustment
- The system shall allow authorized users to manually adjust stock (INCREASE or DECREASE) with a mandatory reason and optional remarks.
- Upon saving an adjustment, the system shall update `total_stock` on the product and create a **StockLog entry** (type: `ADJUST`).

### FR-08: Stock Transaction Log
- The system shall maintain a complete, immutable log of all stock movements.
- Each log entry shall record: product name, movement type (IN/OUT/ADJUST), quantity, reason, previous stock, current stock, performed by, associated supplier (for IN), and date.
- The log shall be generated automatically by the system — it shall not be editable by users.

### FR-09: Dashboard and Analytics
- The system shall display KPI metric cards: Total Revenue, Total Active Products, Total Active Suppliers, and Low Stock Alert count.
- The system shall display a monthly sales trend bar/line chart using Chart.js.
- The system shall display a top-selling products chart.
- The system shall display a recent activities feed (last 10 stock log entries).
- The system shall display the net profit for the current month.

### FR-10: Reports
- The system shall provide a Sales Report with total revenue, number of transactions, and average sale value, filterable by date range.
- The system shall provide a Purchase Report with total purchase cost and number of orders, filterable by date range.
- The system shall provide a Stock Report showing current stock levels and low-stock warnings.

### FR-11: Settings
- Admin shall be able to configure: RBAC enable/disable toggle, company information (name, address, phone), default tax percentage, and default discount percentage.
- Settings shall be seeded with default values on server startup.

## 3.5 Non-Functional Requirements

### NFR-01: Security
- All passwords must be hashed using Bcrypt with 10 salt rounds before storage.
- Authentication tokens must be signed with a secret key and stored in HTTP-only, SameSite-strict cookies.
- All protected API routes must verify the JWT before processing any request.
- Role-based middleware must restrict Admin-only operations from Staff-role users.

### NFR-02: Performance
- Standard CRUD API requests shall respond within 2 seconds under normal network conditions.
- The dashboard page shall load all analytics data within 3 seconds on a standard broadband connection.
- MongoDB aggregation queries shall be optimized with appropriate indexed fields.

### NFR-03: Usability
- The user interface shall be fully responsive — usable on desktops, tablets, and mobile devices.
- The system shall provide immediate visual feedback via toast notifications for all user-initiated actions.
- Client-side and server-side form validation shall be implemented throughout.

### NFR-04: Reliability
- The system shall use MongoDB Atlas with built-in replication for data durability.
- The API server shall handle errors gracefully and return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- JWT handling shall gracefully manage expired or malformed tokens without crashing the server.

### NFR-05: Maintainability
- The backend shall follow a strict MVC architecture with one Model, Controller, and Router file per business entity.
- The frontend shall use Redux Toolkit slices for predictable, centralized state management — one slice per business entity.
- Code shall be organized in clearly named, purpose-specific files and directories.

### NFR-06: Scalability
- The RESTful API design allows future clients (mobile apps, third-party integrations) to connect without requiring backend changes.
- MongoDB's horizontal scalability (sharding) supports future growth in data volume.

## 3.6 System Architecture

The Inventory Management System follows a **3-Tier Client-Server Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION TIER                           │
│                     React.js Frontend                            │
│   Redux Toolkit | React Router v6 | Chart.js | Tailwind CSS     │
│              Deployed on: Vercel (localhost:3000)                │
└──────────────────────────┬──────────────────────────────────────┘
                            │  HTTP REST API + Socket.io (WebSocket)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION TIER                             │
│               Node.js v18 + Express.js v4                        │
│    JWT Middleware | RBAC | PDFKit | Cloudinary | Socket.io       │
│              Deployed on: Render (localhost:3003)                │
└──────────────────────────┬──────────────────────────────────────┘
                            │  Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                 │
│                 MongoDB Atlas (Cloud)                            │
│  Collections: users, products, categories, suppliers,            │
│               purchases, sales, adjustments, stocklogs,         │
│               settings                                           │
└─────────────────────────────────────────────────────────────────┘
```
**Figure 3.1: Three-Tier System Architecture**

### 3.6.1 Backend Architecture — MVC Pattern

The backend strictly follows the **Model-View-Controller (MVC)** architectural pattern:

| Layer | Folder | Description |
|-------|--------|-------------|
| **Model** | `/backend/models/` | 9 Mongoose schemas defining all database collections and their fields, types, and validation rules |
| **Controller** | `/backend/controller/` | 11 controller files containing all business logic — query execution, stock updates, PDF generation |
| **Router (View)** | `/backend/Routers/` | Express route definitions mapping HTTP method + URL to the appropriate controller function |
| **Middleware** | `/backend/middleware/` | JWT auth verification (`authmiddleware`), Admin-only guard (`adminmiddleware`), Staff guard (`staffmiddleware`) |
| **Utils** | `/backend/utils/` | Shared utility functions reused across controllers (e.g., stock update helper) |
| **Libs** | `/backend/libs/` | External service configurations (MongoDB Atlas connection, Cloudinary setup) |

**Figure 3.2: Backend MVC Architecture**

### 3.6.2 Frontend Architecture — Feature-Based Structure

| Folder | Description |
|--------|-------------|
| `/src/pages/` | 18 page-level React components (one per business module/page) |
| `/src/features/` | 9 Redux Toolkit slice files for global state management |
| `/src/Components/` | Shared layout components (Sidebar, TopNavbar, Notification Bell) |
| `/src/lib/` | Utility code (ProtectedRoute HOC, Axios API base config) |
| `/src/store/` | Redux store configuration combining all slices |

### 3.6.3 API Endpoints Summary

**Table 4.2: API Endpoints Summary**

| Module | Base URL | Supported Methods |
|--------|----------|-------------------|
| Authentication | `/api/auth` | POST /login, POST /signup, POST /logout, GET /checkAuth, PUT /update-profile |
| Products | `/api/product` | GET /, POST /, PUT /:id, DELETE /:id |
| Categories | `/api/category` | GET /, POST /, PUT /:id, DELETE /:id |
| Suppliers | `/api/supplier` | GET /, POST /, PUT /:id, DELETE /:id |
| Purchases | `/api/purchase` | GET /, POST /, GET /:id, DELETE /:id, GET /invoice/:id |
| Sales | `/api/sales` | GET /, POST /, GET /:id, DELETE /:id, GET /invoice/:id |
| Adjustments | `/api/adjustments` | GET /, POST /, DELETE /:id |
| Stock Log | `/api/stock` | GET /, GET /:productId |
| Dashboard | `/api/dashboard` | GET /summary, GET /charts, GET /recent |
| Reports | `/api/reports` | GET /sales, GET /purchases, GET /stock |
| Settings | `/api/settings` | GET /, PUT /:key |

### 3.6.4 Authentication Flow

```
Client (Browser)               Express Server              MongoDB Atlas
       │                              │                           │
       │── POST /api/auth/login ─────>│                           │
       │   Body: {email, password}    │── User.findOne({email}) ─>│
       │                              │<── User document ─────────│
       │                              │── bcrypt.compare()        │
       │                              │── jwt.sign({userId})      │
       │<── Set-Cookie: JWT ──────────│                           │
       │    200 OK + user data        │                           │
       │                              │                           │
       │── GET /api/product ─────────>│                           │
       │   (Cookie sent automatically)│── jwt.verify(token)       │
       │                              │── User.findById() ────────>│
       │                              │<── User doc ──────────────│
       │<── 200 OK + products ────────│                           │
```
**Figure 4.1: JWT Authentication Flow**

## 3.7 Database Design

The system uses **MongoDB** with **9 collections**. MongoDB uses a document-based data model, where related data is either **referenced** via ObjectId (similar to foreign keys) or **embedded** as sub-documents within a parent document.

### Table 3.2: Users Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| full_name | String | Required | User's full name |
| email | String | Required, Unique | Login email address |
| password | String | Required | Bcrypt-hashed password (never plaintext) |
| role | String | Enum: ADMIN, STAFF | Access role (default: STAFF) |
| status | String | Enum: ACTIVE, INACTIVE | Account status (default: ACTIVE) |
| profile_image | String | Nullable | Cloudinary hosted image URL |
| createdAt | Date | Auto (Mongoose) | Record creation timestamp |
| updatedAt | Date | Auto (Mongoose) | Last modification timestamp |

### Table 3.3: Products Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required, Unique | Product name |
| sku | String | Required, Unique | Stock Keeping Unit identifier |
| category | ObjectId | Ref: Category, Required | Category reference |
| description | String | Required | Product description |
| image | String | Default: "" | Cloudinary product image URL |
| current_cost_price | Number | Required, min: 0 | Latest purchase cost price |
| selling_price | Number | Required, min: 0 | Retail selling price |
| total_stock | Number | Default: 0, min: 0 | Current available quantity |
| reorderLevel | Number | Default: 0, min: 0 | Minimum stock threshold for alerts |
| status | String | Enum: Active, Inactive | Product status |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Update timestamp |

### Table 3.4: Categories Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required, Unique | Category name |
| description | String | Optional | Category description |
| status | String | Enum: Active, Inactive | Category status |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Update timestamp |

### Table 3.5: Suppliers Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| name | String | Required | Supplier company name |
| contact_person | String | Required | Primary contact name |
| phone | String | Required | Contact phone number |
| email | String | Unique, Sparse | Email address (optional) |
| supplier_id | String | Required, Unique | Auto-generated code (SUP-XXXX) |
| address | String | Required | Business address |
| pan_vat | String | Required, Unique | PAN/VAT registration number |
| status | String | Enum: Active, Inactive | Supplier status |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Update timestamp |

### Table 3.6: Purchases Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| invoiceNumber | String | Unique, Sparse | Purchase invoice reference |
| supplier | ObjectId | Ref: Supplier, Required | Supplying company |
| items | Array | Sub-documents | Array of purchased items |
| items[].product | ObjectId | Ref: Product | Product reference |
| items[].quantity | Number | min: 1 | Quantity purchased |
| items[].costPrice | Number | min: 0 | Unit cost price at purchase time |
| items[].batchNumber | String | Optional | Batch/lot number |
| items[].expiryDate | Date | Optional | Product expiry date |
| subtotal | Number | Default: 0 | Total before discount and tax |
| discountPercentage | Number | Default: 0 | Applied discount percentage |
| discountAmount | Number | Default: 0 | Computed discount amount |
| taxPercentage | Number | Default: 0 | Applied tax percentage |
| taxAmount | Number | Default: 0 | Computed tax amount |
| totalAmount | Number | Required | Final payable amount |
| paymentType | String | Enum: Cash, Credit | Payment method used |
| notes | String | Optional | Additional purchase notes |
| purchaseDate | Date | Default: now | Date of purchase |
| createdAt | Date | Auto | Creation timestamp |

### Table 3.7: Sales Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| invoiceNumber | String | Required, Unique | Sale invoice reference |
| customerName | String | Default: "Walking Customer" | Customer name |
| products | Array | Sub-documents | Array of sold items |
| products[].product | ObjectId | Ref: Product | Product reference |
| products[].name | String | Snapshot | Product name at time of sale |
| products[].quantity | Number | min: 1 | Quantity sold |
| products[].price | Number | min: 0 | Selling price snapshot |
| products[].costPrice | Number | min: 0 | Cost price snapshot (for profit) |
| subtotal | Number | Required | Before discount and tax |
| discountPercentage | Number | Default: 10 | Applied discount percentage |
| discountAmount | Number | Default: 0 | Computed discount amount |
| taxPercentage | Number | Default: 13 | VAT rate (Nepal standard) |
| taxAmount | Number | Default: 0 | Computed VAT amount |
| totalAmount | Number | Required | Final billed amount |
| paymentType | String | Enum: Cash, Credit | Payment method |
| notes | String | Optional | Sale remarks |
| soldBy | ObjectId | Ref: User, Required | User who processed the sale |
| saleDate | Date | Default: now | Date of sale |
| createdAt | Date | Auto | Creation timestamp |

### Table 3.8: Adjustments Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| product | ObjectId | Ref: Product, Required | Product being adjusted |
| type | String | Enum: INCREASE, DECREASE | Direction of adjustment |
| quantity | Number | Required | Quantity adjusted |
| reason | String | Required | Mandatory reason for adjustment |
| remarks | String | Default: '' | Additional optional remarks |
| adjustedBy | ObjectId | Ref: User, Required | User who performed the adjustment |
| date | Date | Default: now | Date of adjustment |
| createdAt | Date | Auto | Creation timestamp |

### Table 3.9: StockLogs Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| product | ObjectId | Ref: Product, Required | Product concerned |
| type | String | Enum: IN, OUT, ADJUST | Stock movement type |
| quantity | Number | Required, min: 1 | Quantity moved |
| reason | String | Default: '' | Movement reason |
| performedBy | ObjectId | Ref: User, Required | User responsible |
| supplier | ObjectId | Ref: Supplier | Linked supplier (for IN logs) |
| previousStock | Number | Default: 0 | Stock level before this movement |
| currentStock | Number | Default: 0 | Stock level after this movement |
| date | Date | Default: now | Transaction date |
| createdAt | Date | Auto | Creation timestamp |

### Table 3.10: Settings Collection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Auto-generated MongoDB ID |
| key | String | Required, Unique | Setting identifier (e.g., "enable_rbac") |
| value | Mixed | Required | Setting value (any BSON type) |
| updated_at | Date | Auto | Last modification timestamp |

### 3.7.1 Entity Relationship Overview

```
         ┌──────────┐         ┌─────────────┐
         │ Category │ 1──────<│   Product   │
         └──────────┘         └──────┬──────┘
                                     │ 1
                          ┌──────────┼──────────┐
                          │          │          │
                         many       many       many
                          │          │          │
                   ┌──────┴──┐  ┌───┴───┐  ┌──┴────────┐
                   │Purchase │  │ Sale  │  │Adjustment │
                   │  Item   │  │ Item  │  └──────┬────┘
                   └──────┬──┘  └───┬───┘         │
                          │         │             User
                   ┌──────┴─────────┴──────────────┐
                   │          StockLog              │
                   │  (IN from Purchase, OUT from   │
                   │   Sale, ADJUST from Adjustment)│
                   └────────────────────────────────┘

         ┌──────────┐    1
         │ Supplier │────────< Purchase
         └──────────┘
```
**Figure 3.6: Complete Entity Relationship Overview**

## 3.8 Use Case Diagram

### Actors

- **Admin:** Full system access — can manage users, products, categories, suppliers, purchases, sales, adjustments, reports, and settings.
- **Staff:** Operational access — can view products/categories/suppliers, record purchases, record sales, make adjustments, view stock log, and view own profile.
- **System (Automated):** Performs automatic stock updates and stock log creation on every purchase, sale, and adjustment.

### Admin Use Cases

```
Admin ──> Login / Logout
      ──> Manage Products (Add / Edit / Deactivate / Upload Image)
      ──> Manage Categories (Add / Edit / Deactivate)
      ──> Manage Suppliers (Add / Edit / Deactivate)
      ──> Record Purchase ──> [System: Increment Stock, Create Log]
      ──> Record Sale ──> [System: Decrement Stock, Create Log]
      ──> Make Stock Adjustment ──> [System: Update Stock, Create Log]
      ──> View Stock Transaction Log
      ──> View & Download Reports (Sales / Purchase / Stock)
      ──> Manage User Accounts (Activate / Deactivate)
      ──> Configure System Settings (RBAC, Company Info, Tax)
      ──> View Dashboard Analytics and Charts
      ──> Manage Own Profile (Update Name & Image)
      ──> Download PDF Invoices (Purchase & Sales)
```

### Staff Use Cases

```
Staff ──> Login / Logout
      ──> View Products / Categories / Suppliers
      ──> Record Purchase ──> [System: Increment Stock, Create Log]
      ──> Record Sale ──> [System: Decrement Stock, Create Log]
      ──> Make Stock Adjustment ──> [System: Update Stock, Create Log]
      ──> View Stock Transaction Log
      ──> View Dashboard
      ──> Manage Own Profile
      ──> Download PDF Invoices
```

## 3.9 Data Flow Diagram (DFD)

### Level 0 — Context Diagram

```
                 ┌──────────────────────────────────────────┐
                 │                                          │
  [Admin] ──────>│                                          │──> [PDF Invoices]
  [Staff] ──────>│   INVENTORY MANAGEMENT SYSTEM           │──> [Reports]
                 │                                          │
                 │                                          │<── [Cloudinary (Images)]
                 │                                          │<── [MongoDB Atlas (Data)]
                 └──────────────────────────────────────────┘
```
**Figure 3.9: Level 0 DFD (Context Diagram)**

### Level 1 — DFD

```
[User Input] ─> │ 1.0 Authentication  │ ──> [JWT Cookie (Session)]

[Auth'd User] ─┬─> │ 2.0 Product Mgmt    │ <──> [Products Collection]
               ├─> │ 3.0 Category Mgmt   │ <──> [Categories Collection]
               ├─> │ 4.0 Supplier Mgmt   │ <──> [Suppliers Collection]
               │
               ├─> │ 5.0 Purchase Mgmt   │ <──> [Purchases Collection]
               │         │                       │
               │         └───────────────────────>│ 8.0 Stock Engine
               │                                  │     ──> [Products (stock++)]
               │                                  │     ──> [StockLogs (IN)]
               │
               ├─> │ 6.0 Sales Mgmt      │ <──> [Sales Collection]
               │         │                       │
               │         └───────────────────────>│ 8.0 Stock Engine
               │                                  │     ──> [Products (stock--)]
               │                                  │     ──> [StockLogs (OUT)]
               │
               ├─> │ 7.0 Adjustment      │ <──> [Adjustments Collection]
               │         │                       │
               │         └───────────────────────>│ 8.0 Stock Engine
               │                                  │     ──> [Products (stock±)]
               │                                  │     ──> [StockLogs (ADJUST)]
               │
               ├─> │ 9.0 Dashboard       │ <──> [All Collections (Aggregation)]
               └─> │ 10.0 Reports        │ <──> [Sales + Purchase + Stock]
```
**Figure 3.10: Level 1 DFD**

## 3.10 Sequence Diagram: Recording a Sale

```
Client (React)     Redux Slice       Express API         MongoDB Atlas
      │                 │                 │                    │
      │─ User fills ──> │                 │                    │
      │  sales form     │                 │                    │
      │─ dispatch(      │                 │                    │
      │  addSale(data)) │                 │                    │
      │                 │─ POST ─────────>│                    │
      │                 │  /api/sales     │── jwt.verify() ──  │
      │                 │                 │── Find products ──>│
      │                 │                 │<── Product docs ───│
      │                 │                 │── Validate stock   │
      │                 │                 │   (sufficient?)    │
      │                 │                 │── Create Sale ────>│
      │                 │                 │── Decrement stock─>│
      │                 │                 │── Create StockLog─>│
      │                 │                 │<── 201 Created ────│
      │                 │<── Success ─────│                    │
      │<── State ───────│                 │                    │
      │    Updated      │                 │                    │
      │── Toast: "Sale recorded successfully"                  │
```
**Figure 3.11: Sequence Diagram — Recording a Sale**
