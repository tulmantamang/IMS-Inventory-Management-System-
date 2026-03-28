const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, PageBreak, Footer, convertInchesToTwip,
  ExternalHyperlink, UnderlineType,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── FORMATTING CONSTANTS ────────────────────────────────────────────────────
const FONT        = "Times New Roman";
const SIZE_BODY   = 24;   // 12pt (half-points)
const SIZE_H1     = 28;   // 14pt
const SIZE_H2     = 26;   // 13pt
const SIZE_H3     = 24;   // 12pt
const SPACING_15  = { line: 360, lineRule: "auto" };

const PAGE_MARGIN = {
  top:    convertInchesToTwip(1.0),
  right:  convertInchesToTwip(1.0),
  bottom: convertInchesToTwip(1.0),
  left:   convertInchesToTwip(1.5),
};

// ─── HELPER: parse inline **bold** and `code` ───────────────────────────────
function parseInline(text, size) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    if (m[2]) parts.push({ text: m[2], bold: true });
    if (m[3]) parts.push({ text: m[3], mono: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });

  return parts.map(p => new TextRun({
    text: p.text,
    font: p.mono ? "Courier New" : FONT,
    size: p.mono ? 18 : (size || SIZE_BODY),
    bold: p.bold || false,
  }));
}

// ─── HELPER: Normal body paragraph ──────────────────────────────────────────
function P(text, opts = {}) {
  const children = text ? parseInline(text, opts.size || SIZE_BODY) : [new TextRun({ text: "", font: FONT, size: SIZE_BODY })];
  return new Paragraph({
    children,
    alignment: opts.center ? AlignmentType.CENTER : (opts.left ? AlignmentType.LEFT : AlignmentType.JUSTIFIED),
    spacing: { ...SPACING_15, before: opts.before ?? 80, after: opts.after ?? 80 },
    indent: opts.indent ? { left: 720 } : undefined,
  });
}

// ─── HELPER: Headings ───────────────────────────────────────────────────────
function H(level, text) {
  const cfgs = {
    1: { size: SIZE_H1, bold: true, center: true,  before: 480, after: 200 },
    2: { size: SIZE_H2, bold: true, center: false, before: 320, after: 160 },
    3: { size: SIZE_H3, bold: true, center: false, before: 200, after: 120 },
    4: { size: SIZE_BODY, bold: true, italics: true, center: false, before: 160, after: 80 },
  };
  const c = cfgs[level] || cfgs[3];
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: c.size, bold: c.bold, italics: c.italics || false })],
    alignment: c.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { ...SPACING_15, before: c.before, after: c.after },
    border: level === 1 ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 4 } } : undefined,
  });
}

// ─── HELPER: Page break ──────────────────────────────────────────────────────
function PB() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── HELPER: Blank line ──────────────────────────────────────────────────────
function BL(before = 120) {
  return new Paragraph({ children: [new TextRun({ text: "", font: FONT, size: SIZE_BODY })], spacing: { before, after: 0 } });
}

// ─── HELPER: Horizontal rule ─────────────────────────────────────────────────
function HR() {
  return new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE_BODY })],
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } },
  });
}

// ─── HELPER: Bullet item ─────────────────────────────────────────────────────
function B(text, lvl = 0) {
  const cleaned = text.replace(/^[\s\-\*]+/, "");
  return new Paragraph({
    children: parseInline(cleaned, SIZE_BODY),
    bullet: { level: lvl },
    spacing: { ...SPACING_15, before: 60, after: 60 },
  });
}

// ─── HELPER: Code line ───────────────────────────────────────────────────────
function CODE(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18 })],
    spacing: { before: 30, after: 30 },
    indent: { left: 720 },
    shading: { type: "clear", fill: "F2F2F2" },
    alignment: AlignmentType.LEFT,
  });
}

// ─── HELPER: Table from markdown rows ────────────────────────────────────────
function makeTable(mdLines) {
  const dataRows = mdLines
    .filter(l => !/^\|[\s\-\|]+\|$/.test(l.trim()))
    .map(l => l.split("|").slice(1, -1).map(c => c.trim()));

  if (!dataRows.length) return null;

  const colCount = dataRows[0].length;
  const colWidths = Array(colCount).fill(Math.floor(9000 / colCount));

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: dataRows.map((cells, ri) => {
      const isHeader = ri === 0;
      return new TableRow({
        tableHeader: isHeader,
        children: cells.map((cell, ci) =>
          new TableCell({
            width: { size: colWidths[ci], type: WidthType.DXA },
            shading: isHeader ? { type: "clear", fill: "D0D0D0" } : undefined,
            children: [new Paragraph({
              children: parseInline(cell, SIZE_BODY),
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
          })
        ),
      });
    }),
    borders: {
      top:          { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      bottom:       { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      left:         { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      right:        { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      insideH:      { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      insideV:      { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
  });
}

// ─── MARKDOWN PARSER ──────────────────────────────────────────────────────────
function parseMd(md) {
  const elements = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  let inCode = false;
  let codeLines = [];
  let inTable = false;
  let tableLines = [];
  let numCounter = 0;

  const flushTable = () => {
    if (tableLines.length) {
      const tbl = makeTable(tableLines);
      if (tbl) { elements.push(tbl); elements.push(BL(80)); }
      tableLines = [];
    }
    inTable = false;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw;

    // ── code block ──
    if (line.trimStart().startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        codeLines.forEach(cl => elements.push(CODE(cl)));
        elements.push(BL(60));
        inCode = false;
        codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }

    // ── table ──
    if (line.trimStart().startsWith("|")) {
      inTable = true;
      tableLines.push(line);
      i++; continue;
    }
    if (inTable) flushTable();

    // ── headings ──
    if (line.startsWith("#### ")) { numCounter = 0; elements.push(H(4, line.slice(5).trim())); }
    else if (line.startsWith("### ")) { numCounter = 0; elements.push(H(3, line.slice(4).trim())); }
    else if (line.startsWith("## "))  { numCounter = 0; elements.push(H(2, line.slice(3).trim())); }
    else if (line.startsWith("# "))   { numCounter = 0; elements.push(PB()); elements.push(H(1, line.slice(2).trim())); }
    // ── horizontal rule ──
    else if (/^---+$/.test(line.trim())) { elements.push(HR()); }
    // ── blank line ──
    else if (line.trim() === "") { elements.push(BL(80)); }
    // ── numbered list ──
    else if (/^\d+\.\s/.test(line)) {
      numCounter++;
      const txt = line.replace(/^\d+\.\s*/, "");
      elements.push(new Paragraph({
        children: [new TextRun({ text: `${numCounter}.\t`, font: FONT, size: SIZE_BODY }), ...parseInline(txt, SIZE_BODY)],
        spacing: { ...SPACING_15, before: 60, after: 60 },
        indent: { left: 360, hanging: 360 },
      }));
    }
    // ── sub-bullet (2+ spaces) ──
    else if (/^\s{2,}[-*]/.test(line)) { elements.push(B(line.trim(), 1)); }
    // ── bullet ──
    else if (/^[-*]\s/.test(line)) { numCounter = 0; elements.push(B(line)); }
    // ── normal paragraph ──
    else { elements.push(P(line)); }

    i++;
  }
  if (inTable) flushTable();

  return elements;
}

// ─── FRONT MATTER BUILDER ─────────────────────────────────────────────────────
function buildFrontMatter() {
  const els = [];

  // ── Cover Page ──────────────────────────────────────────────────
  const big  = (t, sz, bold=false) => new Paragraph({ children:[new TextRun({text:t,font:FONT,size:sz,bold})], alignment:AlignmentType.CENTER, spacing:{before:100,after:80} });
  const mid  = (t, bold=false)     => new Paragraph({ children:[new TextRun({text:t,font:FONT,size:SIZE_BODY,bold})], alignment:AlignmentType.CENTER, spacing:{before:60,after:60} });

  els.push(
    BL(600),
    big("TRIBHUVAN UNIVERSITY", 36, true),
    big("Faculty of Humanities and Social Sciences", 26, true),
    big("Bachelor of Computer Applications (BCA)", 24, false),
    big("6th Semester — Project II (CAPJ356)", 22, false),
    BL(300),
    big("INVENTORY MANAGEMENT SYSTEM", 38, true),
    BL(120),
    new Paragraph({
      children:[new TextRun({text:"A Project Report Submitted in Partial Fulfillment of the Requirements for the", font:FONT, size:22, italics:true})],
      alignment:AlignmentType.CENTER, spacing:{before:80,after:60},
    }),
    new Paragraph({
      children:[new TextRun({text:"Degree of Bachelor in Computer Application", font:FONT, size:22, italics:true})],
      alignment:AlignmentType.CENTER, spacing:{before:60,after:300},
    }),
    mid("Submitted by:", true),
    mid("[Student Full Name]"),
    mid("TU Registration No: [Registration Number]"),
    mid("Roll No: [Roll Number]"),
    BL(200),
    mid("Submitted to:", true),
    mid("Department of Computer Science and Information Technology"),
    mid("[College Name]"),
    mid("[College Address], Kathmandu, Nepal"),
    BL(200),
    big("March, 2026", 24, true),
    PB(),
  );

  // ── Certificate of Approval ─────────────────────────────────────
  els.push(
    H(1, "CERTIFICATE OF APPROVAL"),
    P('This project report entitled "Inventory Management System" submitted by [Student Full Name], TU Registration No. [Registration Number], Roll No. [Roll Number] in partial fulfillment of the requirements for the Degree of Bachelor of Computer Applications (BCA) has been examined and approved.'),
    BL(500),
    P("________________________", {left:true}), P("Head of Department", {left:true}), P("Name: ___________________________", {left:true}), P("Signature: _______________________", {left:true}), P("Date: ___________________________", {left:true}),
    BL(300),
    P("________________________", {left:true}), P("External Examiner", {left:true}), P("Name: ___________________________", {left:true}), P("Signature: _______________________", {left:true}), P("Date: ___________________________", {left:true}),
    BL(300),
    P("________________________", {left:true}), P("Supervisor", {left:true}), P("Name: ___________________________", {left:true}), P("Designation: _____________________", {left:true}), P("Signature: _______________________", {left:true}), P("Date: ___________________________", {left:true}),
    PB(),
  );

  // ── Supervisor's Recommendation ─────────────────────────────────
  els.push(
    H(1, "SUPERVISOR'S RECOMMENDATION"),
    P('This is to certify that the project report entitled "Inventory Management System" submitted by [Student Full Name], TU Registration No. [Registration Number], for the degree of Bachelor of Computer Applications (BCA) has been carried out under my supervision. This project work is found to be original and ready for submission.'),
    BL(400),
    P("[Supervisor Name]", {left:true}), P("Designation: [Designation]", {left:true}), P("Department of Computer Science", {left:true}), P("[College Name]", {left:true}),
    BL(200),
    P("Date: March 2026", {left:true}),
    PB(),
  );

  // ── Declaration ─────────────────────────────────────────────────
  els.push(
    H(1, "DECLARATION"),
    P('I hereby declare that the project work entitled "Inventory Management System" submitted as partial fulfillment of the requirement for the degree of Bachelor of Computer Applications (BCA) under Tribhuvan University is an original work done by me and has not been submitted earlier to any university or institution for the award of any degree or diploma. All sources of information used in this report have been duly acknowledged.'),
    BL(500),
    P("Signature: ___________________________", {left:true}),
    P("Name: [Student Full Name]", {left:true}),
    P("Roll No: [Roll Number]", {left:true}),
    P("Date: March 2026", {left:true}),
    P("Place: Kathmandu, Nepal", {left:true}),
    PB(),
  );

  // ── Acknowledgement ─────────────────────────────────────────────
  els.push(
    H(1, "ACKNOWLEDGEMENT"),
    P("First and foremost, I would like to express my deep gratitude to Tribhuvan University and my college for providing this opportunity to develop a real-world project as part of the BCA curriculum."),
    P("I am sincerely grateful to my project supervisor, [Supervisor Name], for providing constant guidance, encouragement, and support throughout the development of this project. His/her invaluable suggestions and technical insights greatly helped in bringing this project to fruition."),
    P("I would also like to extend my heartfelt thanks to the Head of the Department and all the faculty members of the Department of Computer Science for their continuous support and motivation."),
    P("I am also thankful to my classmates and friends who provided valuable feedback during the testing phase of the system."),
    P("Finally, I express my sincere gratitude to my family for their moral support and encouragement throughout the project period."),
    BL(300),
    P("[Student Full Name]", {left:true}),
    P("BCA 6th Semester", {left:true}),
    P("[College Name]", {left:true}),
    P("March 2026", {left:true}),
    PB(),
  );

  // ── Abstract ────────────────────────────────────────────────────
  els.push(
    H(1, "ABSTRACT"),
    P("The Inventory Management System is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The system is designed to streamline and automate the core business operations of a small-to-medium business, covering product management, supplier management, purchase tracking, sales processing, stock adjustment, and comprehensive reporting."),
    P("The system implements Role-Based Access Control (RBAC) with two user roles — Admin and Staff — ensuring each user accesses only the functionality relevant to their responsibility. Real-time updates are delivered using Socket.io, while JWT (JSON Web Token)-based authentication with HTTP-only cookies ensures secure user sessions. Passwords are stored securely using the Bcrypt hashing algorithm."),
    P("Key features include an interactive analytics dashboard with Chart.js visualizations, automated PDF invoice generation using PDFKit, Cloudinary-based product image management, stock-level monitoring with reorder-level alerts, and a complete stock transaction log for audit traceability."),
    P("This documentation covers the complete software development lifecycle — from requirement analysis and system design to implementation, testing, and deployment — following the standards of a Tribhuvan University BCA 6th Semester Project Report."),
    PB(),
  );

  return els;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Reading markdown files...");
  const md1 = fs.readFileSync(path.join(__dirname, "FULL_PROJECT_REPORT_PART1.md"), "utf8");
  const md2 = fs.readFileSync(path.join(__dirname, "FULL_PROJECT_REPORT_PART2.md"), "utf8");

  const ch1Start  = md1.indexOf("# CHAPTER 1");
  const bodyMd    = md1.slice(ch1Start);

  console.log("Parsing markdown content...");
  const bodyElements = parseMd(bodyMd);
  const part2Elements = parseMd(md2);

  console.log("Building document...");
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY, color: "000000" },
          paragraph: {
            spacing: { ...SPACING_15 },
            alignment: AlignmentType.JUSTIFIED,
          },
        },
      },
    },
    sections: [{
      properties: {
        page: { margin: PAGE_MARGIN },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ children: [""], font: FONT, size: SIZE_BODY }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children: [
        ...buildFrontMatter(),
        ...bodyElements,
        ...part2Elements,
      ],
    }],
  });

  console.log("Generating .docx file...");
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "TU_BCA_Inventory_Management_System_Report.docx");
  fs.writeFileSync(outPath, buffer);
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`\n✅ Word document generated successfully! (${sizeKB} KB)`);
  console.log("📄 File:", outPath);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
