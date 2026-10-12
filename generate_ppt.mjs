import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "Mahlet Yimenu & Kidist Getaneh";
pptx.company = "Woldia University - School of Computing";
pptx.title = "Ethiopian Pharmacy Inventory Management System (EPIMS)";

// Path to the user's provided medical Caduceus background image
const BG_IMAGE_PATH = "c:\\Users\\rukn alzmarad\\Desktop\\kidist-recovery\\medical_bg.png";

// Palette aligned with the medical Caduceus blue aesthetic
const PRIMARY_NAVY = "0B3C5D"; // Deep clinical navy for primary headings & text
const CYAN_BLUE    = "0284C7"; // Caduceus electric cyan
const CYAN_LIGHT   = "E0F2FE"; // Soft icy cyan tint
const CARD_WHITE   = "FFFFFF"; // Crisp elevated white card
const TEXT_DARK    = "0F172A"; // High contrast text
const TEXT_MUTED   = "334155"; // Slate for body copy
const BORDER_COLOR = "BAE6FD"; // Subtle cyan-tinted border
const GREEN_ACCENT = "0D9488"; // Medical emerald
const GREEN_BG     = "CCFBF1";
const AMBER_ACCENT = "D97706";
const AMBER_BG     = "FEF3C7";
const RED_ACCENT   = "E11D48";
const RED_BG       = "FFE4E6";

// Header Helper for standard slides
function addHeader(slide, title, category = "EPIMS DEFENSE") {
  // Medical Background
  slide.background = { path: BG_IMAGE_PATH };

  // Semi-transparent frosted header strip for perfect readability
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 0.35,
    w: 12.13,
    h: 1.05,
    rectRadius: 0.08,
    fill: { color: "FFFFFF", transparency: 10 },
    line: { color: BORDER_COLOR, width: 1 }
  });

  // Category Tag Pill
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.45,
    w: 2.8,
    h: 0.28,
    rectRadius: 0.06,
    fill: { color: CYAN_LIGHT },
    line: { color: BORDER_COLOR, width: 1 }
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.45,
    w: 2.8,
    h: 0.28,
    fontSize: 9,
    fontFace: "Segoe UI",
    bold: true,
    color: CYAN_BLUE,
    align: "center",
    valign: "middle"
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.78,
    w: 11.5,
    h: 0.55,
    fontSize: 21,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY,
    valign: "middle"
  });

  // Footer bar
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 7.02,
    w: 12.13,
    h: 0.38,
    rectRadius: 0.05,
    fill: { color: "FFFFFF", transparency: 15 },
    line: { color: BORDER_COLOR, width: 0.8 }
  });
  slide.addText("EPIMS  |  Department of Computer Science  |  Woldia University  |  August 2026", {
    x: 0.8,
    y: 7.04,
    w: 11.5,
    h: 0.32,
    fontSize: 9,
    fontFace: "Segoe UI",
    color: TEXT_MUTED
  });
}

// =============================================================
// SLIDE 1: COVER SLIDE (CLEAN, ELEGANT MEDICAL THEME)
// =============================================================
{
  const slide = pptx.addSlide();
  slide.background = { path: BG_IMAGE_PATH };

  // Frosted Glass Main Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.8,
    w: 11.73,
    h: 5.9,
    rectRadius: 0.12,
    fill: { color: "FFFFFF", transparency: 8 },
    line: { color: BORDER_COLOR, width: 1.5 }
  });

  // University Pill
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2,
    y: 1.15,
    w: 5.4,
    h: 0.38,
    rectRadius: 0.08,
    fill: { color: CYAN_LIGHT },
    line: { color: BORDER_COLOR, width: 1 }
  });
  slide.addText("WOLDIA UNIVERSITY  •  INSTITUTE OF TECHNOLOGY", {
    x: 1.2,
    y: 1.15,
    w: 5.4,
    h: 0.38,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY,
    align: "center",
    valign: "middle"
  });

  slide.addText("DEPARTMENT OF COMPUTER SCIENCE  •  SENIOR DEFENSE PROJECT", {
    x: 1.2,
    y: 1.65,
    w: 9.0,
    h: 0.3,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: CYAN_BLUE
  });

  // Main Title
  slide.addText("Ethiopian Pharmacy Inventory\nManagement System (EPIMS)", {
    x: 1.2,
    y: 2.1,
    w: 10.5,
    h: 1.6,
    fontSize: 34,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY,
    lineSpacingMultiple: 1.15
  });

  // Subtitle
  slide.addText("A Decoupled Full-Stack Architecture for Clinical Dispensing, FEFO Batch Control & Auditable Procurement", {
    x: 1.2,
    y: 3.85,
    w: 10.5,
    h: 0.45,
    fontSize: 13,
    fontFace: "Segoe UI",
    color: TEXT_MUTED
  });

  // Team Members Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2,
    y: 4.55,
    w: 5.2,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: "F0F9FF" },
    line: { color: BORDER_COLOR, width: 1 }
  });
  slide.addText("PROJECT TEAM MEMBERS", {
    x: 1.45,
    y: 4.7,
    w: 4.7,
    h: 0.25,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: CYAN_BLUE
  });
  slide.addText([
    { text: "• Mahlet Yimenu   ", options: { bold: true, fontSize: 13, color: PRIMARY_NAVY } },
    { text: "(ID: 160805)\n\n", options: { fontSize: 11, color: TEXT_MUTED } },
    { text: "• Kidist Getaneh   ", options: { bold: true, fontSize: 13, color: PRIMARY_NAVY } },
    { text: "(ID: 160785)", options: { fontSize: 11, color: TEXT_MUTED } }
  ], {
    x: 1.45,
    y: 5.05,
    w: 4.7,
    h: 1.2,
    fontFace: "Segoe UI"
  });

  // Specifications Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 4.55,
    w: 5.3,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: "F0F9FF" },
    line: { color: BORDER_COLOR, width: 1 }
  });
  slide.addText("PROJECT SPECIFICATIONS", {
    x: 7.05,
    y: 4.7,
    w: 4.8,
    h: 0.25,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: CYAN_BLUE
  });
  slide.addText([
    { text: "• Tech Stack: ", options: { bold: true, fontSize: 11, color: PRIMARY_NAVY } },
    { text: "Laravel 12 API + React 18 SPA (Vite)\n", options: { fontSize: 11, color: TEXT_MUTED } },
    { text: "• Database: ", options: { bold: true, fontSize: 11, color: PRIMARY_NAVY } },
    { text: "MySQL (23 Tables, 3NF Schema)\n", options: { fontSize: 11, color: TEXT_MUTED } },
    { text: "• Date & Venue: ", options: { bold: true, fontSize: 11, color: PRIMARY_NAVY } },
    { text: "August 2026  |  Woldia, Ethiopia", options: { fontSize: 11, color: TEXT_MUTED } }
  ], {
    x: 7.05,
    y: 5.05,
    w: 4.8,
    h: 1.2,
    fontFace: "Segoe UI"
  });
}

// =============================================================
// SLIDE 2: PRESENTATION AGENDA
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Presentation Roadmap", "Outline");

  const topics = [
    { num: "01", t: "Introduction & Context", d: "Healthcare environment and the pharmacy distribution lifecycle" },
    { num: "02", t: "Problem Statement", d: "Manual bin card errors, expiry losses, and audit bottlenecks" },
    { num: "03", t: "Project Objectives", d: "General objective and four specific engineering milestones" },
    { num: "04", t: "Functional Scope", d: "Core functional inclusions across all user domains" },
    { num: "05", t: "Project Delimitations", d: "Architectural boundaries and future expansion phases" },
    { num: "06", t: "Methodology & Sprints", d: "Data gathering in Woldia and 5 Agile development sprints" },
    { num: "07", t: "Existing vs. Proposed System", d: "Traditional limitations and core Business Rules (BR1-BR5)" },
    { num: "08", t: "System Architecture & Stack", d: "Decoupled React 18 SPA + Laravel 12 REST API + MySQL" },
    { num: "09", t: "Clinical Dispensing & POS", d: "Segregated pharmacist staging and cashier payment workflows" },
    { num: "10", t: "Inventory & FEFO Engine", d: "Automated batch allocation and immutable stock movements" },
    { num: "11", t: "Procurement & State Machine", d: "5-Stage Purchase Order lifecycle preventing duplicate entries" },
    { num: "12", t: "Conclusion & Future Work", d: "Key achievements, testing results, and future enhancements" }
  ];

  topics.forEach((top, i) => {
    const col = i < 6 ? 0 : 1;
    const row = i % 6;
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.6 + row * 0.86;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 0.74,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.12,
      y: y + 0.12,
      w: 0.5,
      h: 0.5,
      rectRadius: 0.06,
      fill: { color: CYAN_BLUE },
      line: { color: CYAN_BLUE }
    });
    slide.addText(top.num, {
      x: x + 0.12,
      y: y + 0.12,
      w: 0.5,
      h: 0.5,
      fontSize: 11,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText([
      { text: top.t + "  —  ", options: { bold: true, fontSize: 11, color: PRIMARY_NAVY } },
      { text: top.d, options: { fontSize: 9.5, color: TEXT_MUTED } }
    ], {
      x: x + 0.72,
      y: y + 0.12,
      w: 4.85,
      h: 0.5,
      fontFace: "Segoe UI",
      valign: "middle"
    });
  });
}

// =============================================================
// SLIDE 3: BACKGROUND OF THE PROJECT
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Background: Pharmacy Distribution & Care", "Chapter 1 • Introduction");

  const cols = [
    {
      title: "Foundational Healthcare Pillar",
      badge: "NATIONAL CONTEXT",
      color: CYAN_BLUE,
      bg: CYAN_LIGHT,
      items: [
        "Pharmaceutical distribution is vital in Ethiopian dispensaries (Woldia, Dessie, Addis Ababa).",
        "Consistent drug availability and timely replenishment directly impact patient clinical recovery.",
        "Ensuring affordable access while upholding strict safety protocols is essential for public health."
      ]
    },
    {
      title: "The Pharmacy Lifecycle",
      badge: "END-TO-END FLOW",
      color: GREEN_ACCENT,
      bg: GREEN_BG,
      items: [
        "Procurement: Supplier requisitioning, purchase orders, and lead time tracking.",
        "Warehousing: Multi-batch logging, manufacturing/expiry dates, and shelf coordinates.",
        "Clinical Dispensing: Prescription dosage validation and patient safety checks.",
        "Point of Sale & Audit: Financial checkout, thermal receipting, and EFDA regulatory reporting."
      ]
    },
    {
      title: "The Digital Imperative",
      badge: "MODERNIZATION",
      color: PRIMARY_NAVY,
      bg: "E0F2FE",
      items: [
        "Rapid population growth overwhelms traditional paper bin cards and spreadsheets.",
        "Dispensaries require real-time stock counts and instant generic name/barcode search.",
        "A centralized web system prevents medication stock-outs and avoids expiration waste."
      ]
    }
  ];

  cols.forEach((c, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 5.2,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 1.8,
      w: 2.2,
      h: 0.3,
      rectRadius: 0.05,
      fill: { color: c.bg },
      line: { color: c.bg }
    });
    slide.addText(c.badge, {
      x: x + 0.25,
      y: 1.8,
      w: 2.2,
      h: 0.3,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: c.color,
      align: "center",
      valign: "middle"
    });

    slide.addText(c.title, {
      x: x + 0.25,
      y: 2.2,
      w: 3.25,
      h: 0.65,
      fontSize: 13.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    const bList = c.items.map(it => ({ text: "•  " + it + "\n\n", options: { fontSize: 10, color: TEXT_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.95,
      w: 3.25,
      h: 3.65,
      fontFace: "Segoe UI",
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 4: PROBLEM STATEMENT
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Statement of the Problem", "Chapter 1 • Problem Analysis");

  const cards = [
    { title: "Stock Inaccuracies", tag: "DISCREPANCIES", desc: "Manual paper bin cards diverge from physical shelf counts, creating unrecorded inventory discrepancies and untraceable shrinkage." },
    { title: "Medication Expiry Waste", tag: "FINANCIAL LOSS", desc: "Absence of automated First Expiry, First Out (FEFO) sorting causes older drug batches to expire unnoticed on dispensary shelves." },
    { title: "Disconnected Purchasing", tag: "UNVERIFIED ORDERS", desc: "Informal verbal/paper orders prevent tracking supplier delivery lead times and reconciling physical stock against approved orders." },
    { title: "Checkout Bottlenecks", tag: "LONG QUEUES", desc: "Conflating clinical dispensing with cashier payment collection causes counter delays, long patient queues, and reconciliation errors." },
    { title: "Lack of EFDA Traceability", tag: "AUDIT DEFICIT", desc: "Traditional paper registries fail to provide immutable, chronological audit trails legally mandated by the Ethiopian Food and Drug Authority." }
  ];

  cards.forEach((c, idx) => {
    const x = idx < 3 ? 0.8 + idx * 3.95 : (idx === 3 ? 0.8 : 6.8);
    const y = idx < 3 ? 1.6 : 4.4;
    const w = idx < 3 ? 3.75 : 5.75;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: w,
      h: 2.45,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: "FECDD3", width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: y + 0.2,
      w: 1.6,
      h: 0.28,
      rectRadius: 0.05,
      fill: { color: RED_BG },
      line: { color: "FECDD3" }
    });
    slide.addText(c.tag, {
      x: x + 0.25,
      y: y + 0.2,
      w: 1.6,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: RED_ACCENT,
      align: "center",
      valign: "middle"
    });

    slide.addText(c.title, {
      x: x + 0.25,
      y: y + 0.58,
      w: w - 0.5,
      h: 0.35,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(c.desc, {
      x: x + 0.25,
      y: y + 1.0,
      w: w - 0.5,
      h: 1.25,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 5: GENERAL & SPECIFIC OBJECTIVES
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Project Objectives: General & Specific", "Chapter 1 • Objectives");

  // General Objective Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.6,
    w: 11.73,
    h: 1.35,
    rectRadius: 0.1,
    fill: { color: PRIMARY_NAVY },
    line: { color: CYAN_BLUE, width: 1.5 }
  });
  slide.addText("GENERAL OBJECTIVE", {
    x: 1.1,
    y: 1.75,
    w: 3.5,
    h: 0.25,
    fontSize: 10,
    fontFace: "Segoe UI",
    bold: true,
    color: "38BDF8"
  });
  slide.addText("To design, develop, test, and document a secure, automated, full-stack web-based Ethiopian Pharmacy Inventory Management System (EPIMS) that centralizes inventory control, procurement workflows, two-stage prescription and retail dispensing, financial checkout, and role-based auditing.", {
    x: 1.1,
    y: 2.05,
    w: 11.1,
    h: 0.75,
    fontSize: 12,
    fontFace: "Segoe UI",
    color: "FFFFFF",
    lineSpacingMultiple: 1.15
  });

  // Specific Objectives
  const objs = [
    { num: "01", t: "Relational Modeling & FEFO", d: "Design a 3NF relational database schema modeling medicine catalogs, multi-batch records, dynamic reorder thresholds, and strict First Expiry, First Out (FEFO) dispensing algorithms." },
    { num: "02", t: "Procurement PO State Machine", d: "Develop an automated multi-stage Purchase Order lifecycle (Draft → Pending → Sent → Received → Completed) to eliminate duplicate stock entries and generate vendor PDF purchase orders." },
    { num: "03", t: "Two-Stage Dispensing & POS", d: "Build a segregated clinical prescription dispensing queue for pharmacists and a high-speed cashier POS interface supporting cash, Telebirr, and CBE Birr payments." },
    { num: "04", t: "Security RBAC & Automated Exports", d: "Enforce Sanctum bearer token security with fine-grained RBAC permission middleware, automated DOMPDF thermal receipts/invoices, and Laravel Excel report streams." }
  ];

  objs.forEach((o, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 3.15 + row * 1.85;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 1.65,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.55,
      h: 0.55,
      rectRadius: 0.06,
      fill: { color: CYAN_BLUE },
      line: { color: CYAN_BLUE }
    });
    slide.addText(o.num, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.55,
      h: 0.55,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText(o.t, {
      x: x + 0.9,
      y: y + 0.2,
      w: 4.6,
      h: 0.35,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(o.d, {
      x: x + 0.9,
      y: y + 0.58,
      w: 4.6,
      h: 0.95,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 6: FUNCTIONAL SCOPE (DEDICATED FULL SLIDE)
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Functional Scope of EPIMS", "Chapter 1 • Scope");

  const scopes = [
    { title: "Authentication & Security Governance", desc: "User registration, Admin approval gates, Sanctum bearer tokens, and granular Role-Based Access Control (RBAC)." },
    { title: "Medicine & Retail Product Catalog", desc: "Full CRUD cataloging with generic/brand names, dosage forms, therapeutic classes, shelf codes, and barcode lookup." },
    { title: "Multi-Batch & Expiry Monitoring", desc: "Tracking batch numbers, manufacturing/expiration dates, purchase costs, automated low-stock warnings, and FEFO allocation." },
    { title: "Procurement Order Lifecycle", desc: "Supplier registry, requisition draft-to-completed state transitions, vendor PDF generation, and atomic stock incrementation." },
    { title: "Two-Stage Dispensing & POS Terminal", desc: "Pharmacist clinical staging queue, cashier retail POS, and support for Telebirr, CBE Birr mobile banking, and Cash." },
    { title: "Administrative Analytics & Audit Logs", desc: "Chart.js revenue visualizations, DOMPDF thermal receipts and invoices, Excel data streams, and immutable user audit trails." }
  ];

  scopes.forEach((sc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.6 + row * 1.78;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 1.6,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: "BAE6FD", width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.4,
      h: 0.4,
      rectRadius: 0.06,
      fill: { color: GREEN_BG },
      line: { color: "A7F3D0" }
    });
    slide.addText("✔", {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.4,
      h: 0.4,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: GREEN_ACCENT,
      align: "center",
      valign: "middle"
    });

    slide.addText(sc.title, {
      x: x + 0.75,
      y: y + 0.2,
      w: 4.75,
      h: 0.35,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(sc.desc, {
      x: x + 0.75,
      y: y + 0.58,
      w: 4.75,
      h: 0.9,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 7: PROJECT DELIMITATIONS (DEDICATED FULL SLIDE)
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Project Delimitations & Architectural Boundaries", "Chapter 1 • Delimitations");

  const delims = [
    {
      num: "01",
      title: "Public Patient E-Commerce & Home Delivery",
      desc: "Direct public consumer web storefronts, online shopping carts, and courier shipping dispatch integrations are excluded.",
      reason: "Rationale: The system is engineered to solve internal dispensary workflows, physical counter queuing, and institutional stock controls first."
    },
    {
      num: "02",
      title: "Automated Robotic Dispensing Hardware",
      desc: "Direct physical integration with robotic pick-and-pack machines or hospital pneumatic tube transport systems is delimited.",
      reason: "Rationale: Ethiopian community and hospital pharmacies operate primarily with human pharmacist clinical verification and manual shelf retrieval."
    },
    {
      num: "03",
      title: "National Electronic Health Record (EHR) Telecommunication",
      desc: "Live bidirectional integration with nationwide health databases and central hospital EHR systems is deferred to future iterations.",
      reason: "Rationale: Requires national FHIR/HL7 standard compliance protocols which are currently evolving across regional health bureaus."
    }
  ];

  delims.forEach((d, idx) => {
    const y = 1.6 + idx * 1.75;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 1.58,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: "FDE68A", width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.05,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      rectRadius: 0.06,
      fill: { color: AMBER_BG },
      line: { color: "FDE68A" }
    });
    slide.addText(d.num, {
      x: 1.05,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: AMBER_ACCENT,
      align: "center",
      valign: "middle"
    });

    slide.addText(d.title, {
      x: 1.85,
      y: y + 0.18,
      w: 10.4,
      h: 0.35,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(d.desc, {
      x: 1.85,
      y: y + 0.55,
      w: 10.4,
      h: 0.45,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });

    slide.addText(d.reason, {
      x: 1.85,
      y: y + 1.02,
      w: 10.4,
      h: 0.42,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      italic: true,
      color: CYAN_BLUE
    });
  });
}

// =============================================================
// SLIDE 8: DATA GATHERING METHODOLOGY
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Data Gathering & Requirements Elicitation", "Chapter 1 • Methodology");

  const methods = [
    {
      title: "Stakeholder Interviews",
      badge: "PRIMARY RESEARCH",
      color: CYAN_BLUE,
      desc: "Conducted structured and semi-structured interview sessions with practicing licensed pharmacists, pharmacy branch managers, and cashier staff in Woldia town.",
      key: "Key Findings: Identified major pain points around manual bin card math, cashier queue delays during peak hours, and stock loss from unmonitored expiration dates."
    },
    {
      title: "Direct Operational Observation",
      badge: "FIELD STUDY",
      color: PRIMARY_NAVY,
      desc: "Performed direct on-site observation of dispensary operations to map customer queuing patterns, shelf bin card updates, and cashier payment handoffs.",
      key: "Key Findings: Revealed severe bottlenecks caused when dispensing pharmacists handle both medicine verification and cash collection simultaneously."
    },
    {
      title: "Document & Regulatory Analysis",
      badge: "COMPLIANCE",
      color: GREEN_ACCENT,
      desc: "Systematically reviewed physical paper artifacts including paper bin cards, supplier delivery invoices, manual prescription slips, and daily balance ledgers.",
      key: "Key Findings: Integrated mandatory data fields required by Ethiopian Food and Drug Authority (EFDA) Good Dispensing Practice guidelines."
    }
  ];

  methods.forEach((m, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 5.2,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 1.8,
      w: 2.2,
      h: 0.3,
      rectRadius: 0.05,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(m.badge, {
      x: x + 0.25,
      y: 1.8,
      w: 2.2,
      h: 0.3,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: m.color,
      align: "center",
      valign: "middle"
    });

    slide.addText(m.title, {
      x: x + 0.25,
      y: 2.25,
      w: 3.25,
      h: 0.6,
      fontSize: 14,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(m.desc, {
      x: x + 0.25,
      y: 2.95,
      w: 3.25,
      h: 1.8,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 4.95,
      w: 3.25,
      h: 1.65,
      rectRadius: 0.06,
      fill: { color: "F0F9FF" },
      line: { color: BORDER_COLOR }
    });
    slide.addText(m.key, {
      x: x + 0.35,
      y: 5.05,
      w: 3.05,
      h: 1.45,
      fontSize: 9,
      fontFace: "Segoe UI",
      italic: true,
      color: PRIMARY_NAVY,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 9: AGILE DEVELOPMENT SPRINTS
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Agile SDLC: 5 Functional Development Sprints", "Chapter 1 • Methodology");

  slide.addText("An Iterative and Incremental Agile Development Model was adopted across five progressive sprints:", {
    x: 0.8,
    y: 1.55,
    w: 11.73,
    h: 0.35,
    fontSize: 11,
    fontFace: "Segoe UI",
    color: PRIMARY_NAVY
  });

  const sprints = [
    { sp: "Sprint 1", t: "Core Architecture", d: "Database migrations, user authentication, Sanctum token engine, and dynamic Role-Based Access Control (RBAC)." },
    { sp: "Sprint 2", t: "Medicine Catalog", d: "Medicine master data CRUD, multi-batch tracking, shelf location mapping, and wholesale supplier directory." },
    { sp: "Sprint 3", t: "Procurement Lifecycle", d: "Purchase order state machine, supplier PDF generation, and automated stock movement audit ledgers." },
    { sp: "Sprint 4", t: "Dispensing & POS", d: "Clinical prescription staging queue, cashier retail POS, Telebirr & CBE Birr payment options, and receipt generation." },
    { sp: "Sprint 5", t: "Analytics & UAT", d: "Chart.js executive dashboards, audit trail logging, four-tier testing hierarchy, and user acceptance evaluations." }
  ];

  sprints.forEach((sp, idx) => {
    const x = 0.8 + idx * 2.38;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 2.1,
      w: 2.25,
      h: 4.8,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: CYAN_BLUE, width: 1.2 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x,
      y: 2.1,
      w: 2.25,
      h: 0.5,
      fill: { color: CYAN_BLUE },
      line: { color: CYAN_BLUE }
    });
    slide.addText(sp.sp, {
      x: x,
      y: 2.1,
      w: 2.25,
      h: 0.5,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText(sp.t, {
      x: x + 0.1,
      y: 2.8,
      w: 2.05,
      h: 0.5,
      fontSize: 11,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY,
      align: "center"
    });

    slide.addText(sp.d, {
      x: x + 0.15,
      y: 3.5,
      w: 1.95,
      h: 3.1,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 10: FEASIBILITY STUDY
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "System Feasibility Analysis", "Chapter 1 • Feasibility Study");

  const feas = [
    {
      title: "Technical Feasibility",
      badge: "EXCELLENT",
      color: GREEN_ACCENT,
      bg: GREEN_BG,
      bullets: [
        "Proven modern web technologies: Laravel 12 on PHP 8.2+ and React 18 SPA.",
        "Stateless RESTful API ensures low server resource consumption and horizontal scalability.",
        "Native Sanctum token issuance and Eloquent ORM ensure rapid, reliable data modeling."
      ]
    },
    {
      title: "Operational Feasibility",
      badge: "SEAMLESS",
      color: CYAN_BLUE,
      bg: CYAN_LIGHT,
      bullets: [
        "Tailwind CSS delivers clean, role-tailored dashboards minimizing staff training time.",
        "High-speed barcode scanner listener reduces cashier checkout clicks dramatically.",
        "Integrated localized payment options (Telebirr & CBE Birr) mirror everyday customer behavior."
      ]
    },
    {
      title: "Economic Feasibility",
      badge: "HIGH ROI",
      color: GREEN_ACCENT,
      bg: GREEN_BG,
      bullets: [
        "100% open-source software stack with zero proprietary vendor licensing fees.",
        "Drastically curtails financial losses by preventing unmonitored medication expiration.",
        "Eliminates recurring physical paper stationery, ledger books, and bin card printing costs."
      ]
    },
    {
      title: "Scheduling Feasibility",
      badge: "COMPLETED",
      color: PRIMARY_NAVY,
      bg: "E0F2FE",
      bullets: [
        "Project planned and structured across a 4-month senior academic capstone timeline.",
        "Iterative sprint milestones ensured progressive validation of database, API, and UI.",
        "All software features, test suites, and documentation delivered on schedule."
      ]
    }
  ];

  feas.forEach((f, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.6 + row * 2.65;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 2.45,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 4.1,
      y: y + 0.2,
      w: 1.4,
      h: 0.28,
      rectRadius: 0.05,
      fill: { color: f.bg },
      line: { color: f.color }
    });
    slide.addText(f.badge, {
      x: x + 4.1,
      y: y + 0.2,
      w: 1.4,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: f.color,
      align: "center",
      valign: "middle"
    });

    slide.addText(f.title, {
      x: x + 0.3,
      y: y + 0.2,
      w: 3.7,
      h: 0.35,
      fontSize: 13.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    const bList = f.bullets.map(b => ({ text: "•  " + b + "\n", options: { fontSize: 10, color: TEXT_MUTED } }));
    slide.addText(bList, {
      x: x + 0.3,
      y: y + 0.65,
      w: 5.15,
      h: 1.65,
      fontFace: "Segoe UI",
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 11: EXISTING PROCESS & BOTTLENECKS
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Existing Traditional Process & Limitations", "Chapter 2 • Existing System");

  const tableData = [
    [
      { text: "No.", options: { bold: true, color: "FFFFFF", fill: { color: PRIMARY_NAVY } } },
      { text: "Traditional Process Limitation", options: { bold: true, color: "FFFFFF", fill: { color: PRIMARY_NAVY } } },
      { text: "Direct Operational & Financial Consequence", options: { bold: true, color: "FFFFFF", fill: { color: PRIMARY_NAVY } } }
    ],
    [
      { text: "1", options: { bold: true, color: CYAN_BLUE } },
      { text: "Fragmented Paper Records", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "No unified single source of truth; persistent discrepancies between shelf counts & ledgers." }
    ],
    [
      { text: "2", options: { bold: true, color: CYAN_BLUE } },
      { text: "Manual Stock Tracking", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "High human calculation errors; unrecorded stock shrinkage and theft cannot be traced." }
    ],
    [
      { text: "3", options: { bold: true, color: CYAN_BLUE } },
      { text: "Absence of Automated FEFO", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "Expired medicines remain undetected on shelves; severe financial losses & patient health hazards." }
    ],
    [
      { text: "4", options: { bold: true, color: CYAN_BLUE } },
      { text: "Uncontrolled Staff Access", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "Lack of role segregation; unauthorized staff may modify medicine prices or alter inventory counts." }
    ],
    [
      { text: "5", options: { bold: true, color: CYAN_BLUE } },
      { text: "Informal Procurement", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "Verbal/paper purchase orders prevent tracking supplier delivery lead times and verifying quantities." }
    ],
    [
      { text: "6", options: { bold: true, color: CYAN_BLUE } },
      { text: "Dispensing & Checkout Bottlenecks", options: { bold: true, color: PRIMARY_NAVY } },
      { text: "Conflating dispensing and payment causes queue delays; lacks auditable digital receipts for EFDA." }
    ]
  ];

  slide.addTable(tableData, {
    x: 0.8,
    y: 1.7,
    w: 11.73,
    colW: [0.6, 4.0, 7.13],
    fontSize: 10,
    fontFace: "Segoe UI",
    rowH: 0.74,
    border: { pt: 0.5, color: BORDER_COLOR },
    valign: "middle"
  });
}

// =============================================================
// SLIDE 12: PROPOSED BUSINESS RULES (BR-1 TO BR-5)
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "System Business Rules (BR-1 to BR-5)", "Chapter 2 • Business Rules");

  const rules = [
    { rule: "BR-1", title: "Authentication & Admin Approval Gate", desc: "All users authenticate via Sanctum tokens. Newly registered accounts remain inactive until an Administrator explicitly reviews and activates the account." },
    { rule: "BR-2", title: "Granular Role-Based Access Control (RBAC)", desc: "Critical mutations (medicine CRUD, user approvals, role configurations, audit trail inspection) are protected by strict route middleware permissions." },
    { rule: "BR-3", title: "First Expiry, First Out (FEFO) Inventory Deduction", desc: "Prescription dispensing and retail POS sales automatically allocate stock from active batches possessing the earliest expiration date to minimize waste." },
    { rule: "BR-4", title: "Purchase Order Lifecycle & Stock Integrity", desc: "Stock quantities increment atomically ONLY when a Purchase Order transitions to 'COMPLETED' status after QC inspection, preventing duplicate counts." },
    { rule: "BR-5", title: "Segregated Clinical & Financial Dispensing", desc: "Pharmacists validate prescriptions and stage orders in a PENDING queue; Cashiers retrieve the order, collect payments, and finalize the transaction." }
  ];

  rules.forEach((r, idx) => {
    const y = 1.6 + idx * 1.04;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: y + 0.16,
      w: 1.2,
      h: 0.58,
      rectRadius: 0.06,
      fill: { color: CYAN_BLUE },
      line: { color: CYAN_BLUE }
    });
    slide.addText(r.rule, {
      x: 1.0,
      y: y + 0.16,
      w: 1.2,
      h: 0.58,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText(r.title, {
      x: 2.4,
      y: y + 0.12,
      w: 9.9,
      h: 0.32,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(r.desc, {
      x: 2.4,
      y: y + 0.44,
      w: 9.9,
      h: 0.4,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
  });
}

// =============================================================
// SLIDE 13: FULL-STACK ARCHITECTURE
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Decoupled Client-Server System Architecture", "Chapter 3 • Architecture");

  const layers = [
    {
      title: "Frontend Single Page App",
      badge: "REACT 18 + VITE",
      color: CYAN_BLUE,
      items: [
        "React 18 SPA: Reusable component hierarchy with virtual DOM rendering.",
        "Tailwind CSS: Utility-first responsive design for desktop & POS terminals.",
        "Vite & NPM: Rapid Hot Module Replacement and production bundling.",
        "Axios HTTP Client: Intercepts Sanctum tokens and dispatches API calls.",
        "Chart.js & Recharts: Visual revenue trends and inventory stock charts."
      ]
    },
    {
      title: "RESTful API Backend",
      badge: "LARAVEL 12 (PHP 8.2+)",
      color: PRIMARY_NAVY,
      items: [
        "MVC Architecture: Modular controllers, FormRequest validation layers.",
        "Laravel Sanctum: Cryptographically signed Bearer API tokens.",
        "Eloquent ORM: Object-relational mapping with pessimistic row locks.",
        "Middleware Security: EnsureApproved & EnsureHasPermission filters.",
        "ACID Transactions: Automatic DB rollback upon transaction failure."
      ]
    },
    {
      title: "Database & Output Layer",
      badge: "MYSQL + EXPORTS",
      color: GREEN_ACCENT,
      items: [
        "MySQL 8.0: 23 normalized tables adhering to 3NF schema constraints.",
        "barryvdh/laravel-dompdf: Formatted thermal slips and A4 invoices.",
        "maatwebsite/excel: Multi-sheet inventory valuation exports.",
        "Immutable Audit Logs: User ID, event type, IP address, and timestamps.",
        "Redis / Cache Store: Optimized performance for dashboard KPIs."
      ]
    }
  ];

  layers.forEach((l, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 5.2,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: l.color, width: 1.5 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 0.65,
      fill: { color: l.color },
      line: { color: l.color }
    });
    slide.addText(l.title, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 0.65,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.8,
      y: 2.4,
      w: 2.15,
      h: 0.28,
      rectRadius: 0.05,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(l.badge, {
      x: x + 0.8,
      y: 2.4,
      w: 2.15,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: l.color,
      align: "center",
      valign: "middle"
    });

    const bList = l.items.map(it => ({ text: "•  " + it + "\n\n", options: { fontSize: 10, color: TEXT_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.85,
      w: 3.25,
      h: 3.8,
      fontFace: "Segoe UI",
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 14: SYSTEM ACTORS & RESPONSIBILITIES
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "System Actors & Operational Responsibilities", "Chapter 4 • System Actors");

  const actors = [
    { role: "Administrator", area: "Full System Governance", desc: "Approves newly registered user accounts, assigns roles & dynamic permissions, monitors branch analytics, audits sensitive logs, and manages system categories." },
    { role: "Pharmacist", area: "Clinical Dispensing & Inventory", desc: "Maintains medicine catalog, validates doctor prescriptions, allocates FEFO batches, stages pending orders for cashiers, and monitors expiration dates." },
    { role: "Cashier", area: "Point of Sale & Payments", desc: "Retrieves staged prescription orders, scans OTC retail barcodes, accepts payments (Telebirr, CBE Birr, Cash), prints thermal receipts, and audits sales." },
    { role: "Purchasing Staff", area: "Procurement & Suppliers", desc: "Registers wholesale pharmaceutical suppliers, drafts purchase requisitions, submits POs for manager approval, and dispatches PDF orders to vendors." },
    { role: "Warehouse Clerk", area: "Physical Stock Receiving & QC", desc: "Inspects incoming shipments, records batch numbers and manufacturing/expiry dates, executes inter-branch stock transfers, and logs damaged items." }
  ];

  actors.forEach((a, idx) => {
    const y = 1.6 + idx * 1.04;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: y + 0.15,
      w: 2.2,
      h: 0.6,
      rectRadius: 0.06,
      fill: { color: "F0F9FF" },
      line: { color: BORDER_COLOR }
    });
    slide.addText(a.role, {
      x: 1.0,
      y: y + 0.15,
      w: 2.2,
      h: 0.32,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY,
      align: "center"
    });
    slide.addText(a.area, {
      x: 1.0,
      y: y + 0.45,
      w: 2.2,
      h: 0.25,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      color: CYAN_BLUE,
      align: "center"
    });

    slide.addText(a.desc, {
      x: 3.4,
      y: y + 0.12,
      w: 8.9,
      h: 0.68,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 15: TWO-STAGE DISPENSING WORKFLOW
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Two-Stage Dispensing: Clinical Staging & POS Checkout", "Chapter 4 • Operational Workflow");

  // Pharmacist Column (Left)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.6,
    w: 5.73,
    h: 5.2,
    rectRadius: 0.1,
    fill: { color: CARD_WHITE, transparency: 8 },
    line: { color: CYAN_BLUE, width: 1.5 }
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 1.6,
    w: 5.73,
    h: 0.55,
    fill: { color: CYAN_BLUE },
    line: { color: CYAN_BLUE }
  });
  slide.addText("STAGE 1: PHARMACIST (CLINICAL STAGING)", {
    x: 0.8,
    y: 1.6,
    w: 5.73,
    h: 0.55,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle"
  });

  const pSteps = [
    { num: "01", t: "Prescription & Dosage Review", d: "Pharmacist verifies physician prescription, dosage instructions, contraindications, and patient info." },
    { num: "02", t: "Automated FEFO Batch Allocation", d: "System engine queries inventory and automatically binds units from earliest expiring active batches." },
    { num: "03", t: "Stage to Cashier Queue (PENDING)", d: "Order is registered with status 'PENDING_PAYMENT'. Stock is temporarily reserved to prevent collisions." }
  ];

  pSteps.forEach((s, idx) => {
    const y = 2.35 + idx * 1.45;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1,
      y: y,
      w: 5.13,
      h: 1.25,
      rectRadius: 0.08,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(`${s.num}.  ${s.t}`, {
      x: 1.25,
      y: y + 0.12,
      w: 4.8,
      h: 0.3,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });
    slide.addText(s.d, {
      x: 1.25,
      y: y + 0.42,
      w: 4.8,
      h: 0.75,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
  });

  // Cashier Column (Right)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.6,
    w: 5.73,
    h: 5.2,
    rectRadius: 0.1,
    fill: { color: CARD_WHITE, transparency: 8 },
    line: { color: PRIMARY_NAVY, width: 1.5 }
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.8,
    y: 1.6,
    w: 5.73,
    h: 0.55,
    fill: { color: PRIMARY_NAVY },
    line: { color: PRIMARY_NAVY }
  });
  slide.addText("STAGE 2: CASHIER (FINANCIAL POS CHECKOUT)", {
    x: 6.8,
    y: 1.6,
    w: 5.73,
    h: 0.55,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle"
  });

  const cSteps = [
    { num: "04", t: "Retrieve Staged Order / Scan Barcode", d: "Cashier pulls patient order from queue or scans retail health/OTC items with the barcode listener." },
    { num: "05", t: "Collect Payment (Telebirr / CBE / Cash)", d: "Payment modal supports popular Ethiopian channels: Telebirr, CBE Birr mobile banking, or Cash." },
    { num: "06", t: "Atomic Deduction & Receipt Printing", d: "ACID transaction finalizes: inventory decrements, ledger updates, and thermal receipt prints instantly." }
  ];

  cSteps.forEach((s, idx) => {
    const y = 2.35 + idx * 1.45;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1,
      y: y,
      w: 5.13,
      h: 1.25,
      rectRadius: 0.08,
      fill: { color: "F0F9FF" },
      line: { color: BORDER_COLOR }
    });
    slide.addText(`${s.num}.  ${s.t}`, {
      x: 7.25,
      y: y + 0.12,
      w: 4.8,
      h: 0.3,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });
    slide.addText(s.d, {
      x: 7.25,
      y: y + 0.42,
      w: 4.8,
      h: 0.75,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
  });
}

// =============================================================
// SLIDE 16: FEFO ENGINE & STOCK MOVEMENT LEDGER
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "FEFO Batch Allocation & Immutable Stock Ledger", "Chapter 4 • Inventory Engine");

  // Left Column: FEFO
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.6,
    w: 5.73,
    h: 5.2,
    rectRadius: 0.1,
    fill: { color: CARD_WHITE, transparency: 8 },
    line: { color: BORDER_COLOR, width: 1.2 }
  });

  slide.addText("FEFO DISPENSING ENGINE", {
    x: 1.1,
    y: 1.8,
    w: 5.1,
    h: 0.3,
    fontSize: 12,
    fontFace: "Segoe UI",
    bold: true,
    color: CYAN_BLUE
  });

  const fefoItems = [
    { step: "1. Trigger Event", desc: "Prescription sale or retail barcode checkout initiated." },
    { step: "2. Active Batch Query", desc: "System queries batches table for non-zero stock (quantity > 0)." },
    { step: "3. Ascending Expiry Sort", desc: "Sorts ORDER BY expiry_date ASC; expired items automatically filtered out." },
    { step: "4. Waterfall Deduction", desc: "Deducts quantity from earliest batch; cascades to next batch if needed." },
    { step: "5. Threshold Alert", desc: "Calculates total remaining stock; flags low-stock alert if below reorder level." }
  ];

  let fy = 2.2;
  fefoItems.forEach(item => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1,
      y: fy,
      w: 5.13,
      h: 0.75,
      rectRadius: 0.06,
      fill: { color: "F0F9FF" },
      line: { color: BORDER_COLOR }
    });
    slide.addText(item.step, {
      x: 1.25,
      y: fy + 0.08,
      w: 4.8,
      h: 0.25,
      fontSize: 10.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });
    slide.addText(item.desc, {
      x: 1.25,
      y: fy + 0.32,
      w: 4.8,
      h: 0.38,
      fontSize: 9,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
    fy += 0.85;
  });

  // Right Column: Ledger
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.6,
    w: 5.73,
    h: 5.2,
    rectRadius: 0.1,
    fill: { color: CARD_WHITE, transparency: 8 },
    line: { color: BORDER_COLOR, width: 1.2 }
  });

  slide.addText("IMMUTABLE STOCK LEDGER (`stock_movements`)", {
    x: 7.1,
    y: 1.8,
    w: 5.1,
    h: 0.3,
    fontSize: 12,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY
  });

  slide.addText("To eliminate untracked stock leakage and satisfy EFDA audits, every inventory mutation appends an immutable transaction record:", {
    x: 7.1,
    y: 2.15,
    w: 5.1,
    h: 0.55,
    fontSize: 9.5,
    fontFace: "Segoe UI",
    color: TEXT_MUTED
  });

  const ledgerTypes = [
    { type: "IN (Receipt)", col: GREEN_ACCENT, desc: "Stock incremented automatically upon PO Completion." },
    { type: "OUT (Dispensed)", col: CYAN_BLUE, desc: "Stock decremented upon finalized cashier POS checkout." },
    { type: "TRANSFER", col: PRIMARY_NAVY, desc: "Stock transferred between warehouse and dispensary." },
    { type: "ADJUSTMENT", col: AMBER_ACCENT, desc: "Damaged vial write-off or expired batch disposal with reason." }
  ];

  let ly = 2.8;
  ledgerTypes.forEach(lt => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1,
      y: ly,
      w: 5.13,
      h: 0.8,
      rectRadius: 0.06,
      fill: { color: "F8FAFC" },
      line: { color: BORDER_COLOR }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.25,
      y: ly + 0.2,
      w: 1.4,
      h: 0.4,
      rectRadius: 0.04,
      fill: { color: lt.col },
      line: { color: lt.col }
    });
    slide.addText(lt.type, {
      x: 7.25,
      y: ly + 0.2,
      w: 1.4,
      h: 0.4,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText(lt.desc, {
      x: 8.8,
      y: ly + 0.15,
      w: 3.25,
      h: 0.5,
      fontSize: 9,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
    ly += 0.95;
  });
}

// =============================================================
// SLIDE 17: PURCHASE ORDER STATE MACHINE
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Procurement State Machine & Lifecycle Control", "Chapter 4 • Procurement");

  slide.addText("To eliminate inventory discrepancies and prevent premature or duplicate stock additions, EPIMS enforces a strict multi-stage state machine:", {
    x: 0.8,
    y: 1.55,
    w: 11.73,
    h: 0.4,
    fontSize: 11,
    fontFace: "Segoe UI",
    color: PRIMARY_NAVY
  });

  const states = [
    { st: "DRAFT", col: "64748B", role: "Purchasing Staff", desc: "Select supplier, specify medicines, requested batch quantities, and negotiated unit costs." },
    { st: "PENDING", col: AMBER_ACCENT, role: "Manager Review", desc: "Requisition is locked against unauthorized edits awaiting administrative review." },
    { st: "SENT", col: CYAN_BLUE, role: "Dispatched", desc: "System auto-generates professional PDF purchase order and dispatches it via email to vendor." },
    { st: "DELIVERED", col: PRIMARY_NAVY, role: "Warehouse QC", desc: "Goods arrive physically; warehouse clerk inspects lot numbers, expiries, and packaging integrity." },
    { st: "COMPLETED", col: GREEN_ACCENT, role: "Stock Credited", desc: "QC verified: system ATOMICALLY increments batch stock and writes immutable stock ledger." }
  ];

  states.forEach((s, idx) => {
    const x = 0.8 + idx * 2.38;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 2.15,
      w: 2.25,
      h: 4.4,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: s.col, width: 1.2 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x,
      y: 2.15,
      w: 2.25,
      h: 0.45,
      fill: { color: s.col },
      line: { color: s.col }
    });
    slide.addText(s.st, {
      x: x,
      y: 2.15,
      w: 2.25,
      h: 0.45,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addText(s.role, {
      x: x + 0.1,
      y: 2.75,
      w: 2.05,
      h: 0.35,
      fontSize: 10,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY,
      align: "center"
    });

    slide.addText(s.desc, {
      x: x + 0.15,
      y: 3.2,
      w: 1.95,
      h: 2.5,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });

    if (idx < 4) {
      slide.addText("➔", {
        x: x + 2.15,
        y: 2.2,
        w: 0.4,
        h: 0.4,
        fontSize: 13,
        fontFace: "Segoe UI",
        bold: true,
        color: PRIMARY_NAVY
      });
    }
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 6.75,
    w: 11.73,
    h: 0.45,
    rectRadius: 0.06,
    fill: { color: RED_BG },
    line: { color: "FECDD3" }
  });
  slide.addText("🛡️ Duplicate Stock Prevention: The system checks existing completion logs before crediting inventory. Rejected orders transition to CANCELLED.", {
    x: 1.0,
    y: 6.75,
    w: 11.3,
    h: 0.45,
    fontSize: 9.5,
    fontFace: "Segoe UI",
    bold: true,
    color: RED_ACCENT,
    valign: "middle"
  });
}

// =============================================================
// SLIDE 18: DATABASE DESIGN (23 TABLES)
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Relational Database Specification (23 Tables, 3NF)", "Chapter 4 • Database Design");

  const tables = [
    { mod: "Security & RBAC", list: "users, roles, permissions, role_permission, personal_access_tokens, password_reset_tokens, sessions", d: "User credentials (Bcrypt), approval gates, Sanctum tokens, and dynamic role matrices." },
    { mod: "Catalog & Shelves", list: "categories, shelves, medicines, batches, retail_products", d: "Therapeutic categories, physical shelf codes, medicine attributes, batch expiries, barcodes." },
    { mod: "Procurement", list: "suppliers, purchase_orders, purchase_order_items", d: "Wholesale vendor profiles (TIN, contact), PO state transitions, line-item batch costs." },
    { mod: "Clinical & POS", list: "sales, sale_items, stock_movements, stock_transfers, branches", d: "Prescription/retail orders, payment channels, immutable stock ledgers, and branches." },
    { mod: "Infrastructure", list: "audit_logs, cache, jobs, failed_jobs", d: "Immutable administrative audit trail, dashboard KPI cache, and queued email notifications." }
  ];

  tables.forEach((t, idx) => {
    const y = 1.6 + idx * 1.04;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addText(t.mod, {
      x: 1.1,
      y: y + 0.15,
      w: 2.8,
      h: 0.3,
      fontSize: 11.5,
      fontFace: "Segoe UI",
      bold: true,
      color: CYAN_BLUE
    });

    slide.addText(t.list, {
      x: 1.1,
      y: y + 0.45,
      w: 11.0,
      h: 0.35,
      fontSize: 9,
      fontFace: "Courier New",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(t.d, {
      x: 4.2,
      y: y + 0.15,
      w: 8.0,
      h: 0.3,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
  });
}

// =============================================================
// SLIDE 19: SYSTEM SECURITY ARCHITECTURE
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "System Security, Sanctum & RBAC Pipeline", "Chapter 4 • Security Architecture");

  const secPillars = [
    {
      t: "Sanctum Token Auth",
      badge: "AUTHENTICATION",
      col: CYAN_BLUE,
      points: [
        "User authenticates with email & password via /api/login.",
        "Bcrypt hash verification via Hash::check().",
        "Administrative account approval gate (is_approved flag).",
        "Cryptographically signed Bearer API token issued.",
        "Tokens passed asynchronously in Axios headers."
      ]
    },
    {
      t: "Middleware Barriers",
      badge: "AUTHORIZATION",
      col: PRIMARY_NAVY,
      points: [
        "EnsureUserApproved: Blocks unapproved user accounts with 403.",
        "EnsureHasRole: Validates user operational role boundary.",
        "EnsureHasPermission: Verifies granular route permission.",
        "CSRF Protection: Shields state-changing API mutations.",
        "Rate Limiting: Prevents brute-force authentication attempts."
      ]
    },
    {
      t: "Transaction & Audit",
      badge: "INTEGRITY",
      col: GREEN_ACCENT,
      points: [
        "Pessimistic Locking: lockForUpdate() prevents batch overselling.",
        "ACID DB Transactions: DB::transaction() auto-rollbacks failures.",
        "audit_logs Table: Logs user ID, action, model, IP, timestamp.",
        "Immutable stock ledger records prevent tampering.",
        "PDO parameterized queries defend against SQL injection."
      ]
    }
  ];

  secPillars.forEach((sp, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 5.2,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: sp.col, width: 1.5 }
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 0.65,
      fill: { color: sp.col },
      line: { color: sp.col }
    });
    slide.addText(sp.t, {
      x: x,
      y: 1.6,
      w: 3.75,
      h: 0.65,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.9,
      y: 2.4,
      w: 1.95,
      h: 0.28,
      rectRadius: 0.05,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(sp.badge, {
      x: x + 0.9,
      y: 2.4,
      w: 1.95,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: sp.col,
      align: "center",
      valign: "middle"
    });

    const bList = sp.points.map(pt => ({ text: "•  " + pt + "\n\n", options: { fontSize: 10, color: TEXT_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.85,
      w: 3.25,
      h: 3.8,
      fontFace: "Segoe UI",
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 20: TESTING & VERIFICATION HIERARCHY
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "System Verification & 4-Tier Testing Hierarchy", "Chapter 5 • Verification");

  const tiers = [
    { name: "Tier 1: Unit Testing (PHPUnit)", tag: "BACKEND ALGORITHMS", col: CYAN_BLUE, bg: CYAN_LIGHT, desc: "Automated test cases validating core calculations, batch deduction logic, FEFO expiration date sorting, and Bcrypt security hashing." },
    { name: "Tier 2: API Integration Testing", tag: "REST ENDPOINTS", col: PRIMARY_NAVY, bg: "E0F2FE", desc: "Validation of JSON API payloads, FormRequest error responses (HTTP 422), foreign key constraints, and database transaction rollbacks." },
    { name: "Tier 3: Security & RBAC Boundary Tests", tag: "ACCESS BARRIERS", col: GREEN_ACCENT, bg: GREEN_BG, desc: "Rigorous verification of route middleware gates preventing unapproved user logins, cross-role tampering, and SQL injection exploits." },
    { name: "Tier 4: User Acceptance Testing (UAT)", tag: "CLINICAL EVALUATION", col: CYAN_BLUE, bg: CYAN_LIGHT, desc: "Conducted with practicing pharmacists and cashiers in Woldia pharmacies to evaluate POS checkout speed, FEFO clarity, and report export usability." }
  ];

  tiers.forEach((t, idx) => {
    const y = 1.6 + idx * 1.34;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 1.18,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: y + 0.18,
      w: 2.1,
      h: 0.32,
      rectRadius: 0.05,
      fill: { color: t.bg },
      line: { color: t.col }
    });
    slide.addText(t.tag, {
      x: 1.0,
      y: y + 0.18,
      w: 2.1,
      h: 0.32,
      fontSize: 8.5,
      fontFace: "Segoe UI",
      bold: true,
      color: t.col,
      align: "center",
      valign: "middle"
    });

    slide.addText(t.name, {
      x: 3.3,
      y: y + 0.18,
      w: 8.0,
      h: 0.32,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addText(t.desc, {
      x: 1.0,
      y: y + 0.6,
      w: 11.3,
      h: 0.48,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED
    });
  });
}

// =============================================================
// SLIDE 21: KEY INNOVATIONS & STAKEHOLDER IMPACT
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Key Software Innovations & Stakeholder Impact", "Chapter 5 • Project Impact");

  const impacts = [
    { who: "Pharmacy Owners & Managers", icon: "📈", benefit: "Total real-time inventory valuation visibility, eradication of stock pilferage, and data-driven procurement through automated sales analytics." },
    { who: "Dispensing Pharmacists", icon: "💊", benefit: "Zero manual bin card tallying, automated FEFO batch allocation suggestions, immediate alerts for near-expiry drugs (< 90 days), and dedicated clinical focus." },
    { who: "Cashiers & Counter Personnel", icon: "⚡", benefit: "High-speed barcode scanner POS shopping cart, dedicated staged prescription queue, native Telebirr/CBE Birr support, and automated thermal printing." },
    { who: "Patients & Consumers", icon: "🛡️", benefit: "Significant reduction in counter waiting times, 100% protection against receiving expired pharmaceuticals, and transparent itemized receipts." },
    { who: "Regulatory Bodies (EFDA)", icon: "📜", benefit: "Strict batch number lot traceability, permanent audit trail logs for controlled medications, and standardized electronic compliance reporting." }
  ];

  impacts.forEach((imp, idx) => {
    const y = 1.6 + idx * 1.04;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: BORDER_COLOR, width: 1 }
    });

    slide.addText(`${imp.icon}  ${imp.who}`, {
      x: 1.1,
      y: y + 0.15,
      w: 3.5,
      h: 0.35,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: CYAN_BLUE
    });

    slide.addText(imp.benefit, {
      x: 4.6,
      y: y + 0.12,
      w: 7.7,
      h: 0.68,
      fontSize: 10,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 22: CONCLUSION
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Conclusion & Project Summary", "Chapter 5 • Conclusion");

  const concCards = [
    {
      title: "Elimination of Manual Bottlenecks",
      icon: "🏥",
      points: [
        "Replaced error-prone paper bin cards, ledger books, and verbal purchasing with an integrated digital workflow.",
        "Established a centralized single source of truth for stock quantities, batch expiries, and customer transactions."
      ]
    },
    {
      title: "Modern Decoupled Architecture",
      icon: "⚡",
      points: [
        "Delivered a responsive React 18 SPA coupled with a high-throughput Laravel 12 REST API backend.",
        "Sub-second POS checkout transactions and robust concurrency locking prevent stock overselling."
      ]
    },
    {
      title: "Clinical Safety & Institutional Governance",
      icon: "🛡️",
      points: [
        "First Expiry, First Out (FEFO) dispensing systematically eliminates expired medication hazards.",
        "Sanctum token authentication, dynamic RBAC matrices, and immutable audit logs ensure EFDA regulatory compliance."
      ]
    }
  ];

  concCards.forEach((cc, idx) => {
    const y = 1.6 + idx * 1.75;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 1.58,
      rectRadius: 0.08,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: "BAE6FD", width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.05,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      rectRadius: 0.06,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(cc.icon, {
      x: 1.05,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      fontSize: 14,
      fontFace: "Segoe UI",
      align: "center",
      valign: "middle"
    });

    slide.addText(cc.title, {
      x: 1.85,
      y: y + 0.18,
      w: 10.4,
      h: 0.35,
      fontSize: 13,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    const pList = cc.points.map(p => ({ text: "•  " + p + "\n", options: { fontSize: 10.5, color: TEXT_MUTED } }));
    slide.addText(pList, {
      x: 1.85,
      y: y + 0.55,
      w: 10.4,
      h: 0.9,
      fontFace: "Segoe UI",
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 23: FUTURE RECOMMENDATIONS (DEDICATED FULL SLIDE)
// =============================================================
{
  const slide = pptx.addSlide();
  addHeader(slide, "Future Work & Technical Recommendations", "Chapter 5 • Future Work");

  const future = [
    {
      num: "01",
      title: "Direct Payment Gateway Webhooks",
      badge: "FINTECH INTEGRATION",
      desc: "Implement server-to-server API webhooks with Ethio Telecom (Telebirr SuperApp API) and Commercial Bank of Ethiopia (CBE Birr API) for automated real-time transaction verification without manual cashier confirmation."
    },
    {
      num: "02",
      title: "Predictive Demand Forecasting via Machine Learning",
      badge: "AI / DATA SCIENCE",
      desc: "Deploy time-series machine learning models (e.g., ARIMA or Random Forest) to analyze seasonal disease trends (e.g., malaria, respiratory infections) and automatically generate proactive purchase order requisitions."
    },
    {
      num: "03",
      title: "National EFDA Portal & Hospital EHR Interoperability",
      badge: "STANDARDS COMPLIANCE",
      desc: "Establish secure FHIR and HL7 compliant API bridges with the Ethiopian Food and Drug Authority verification portal and regional hospital Electronic Health Record (EHR) databases for electronic prescription transfers."
    },
    {
      num: "04",
      title: "Offline Progressive Web App (PWA) Mode",
      badge: "RELIABILITY",
      desc: "Enhance the React frontend with service workers and IndexedDB caching to enable uninterrupted cashier checkout and receipt generation during intermittent internet outages common in regional towns."
    }
  ];

  future.forEach((fu, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.6 + row * 2.65;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 2.45,
      rectRadius: 0.1,
      fill: { color: CARD_WHITE, transparency: 8 },
      line: { color: "BAE6FD", width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: y + 0.2,
      w: 0.5,
      h: 0.5,
      rectRadius: 0.06,
      fill: { color: CYAN_LIGHT },
      line: { color: BORDER_COLOR }
    });
    slide.addText(fu.num, {
      x: x + 0.25,
      y: y + 0.2,
      w: 0.5,
      h: 0.5,
      fontSize: 12,
      fontFace: "Segoe UI",
      bold: true,
      color: CYAN_BLUE,
      align: "center",
      valign: "middle"
    });

    slide.addText(fu.title, {
      x: x + 0.88,
      y: y + 0.18,
      w: 4.6,
      h: 0.35,
      fontSize: 12.5,
      fontFace: "Segoe UI",
      bold: true,
      color: PRIMARY_NAVY
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.88,
      y: y + 0.55,
      w: 1.9,
      h: 0.25,
      rectRadius: 0.04,
      fill: { color: "F0F9FF" },
      line: { color: BORDER_COLOR }
    });
    slide.addText(fu.badge, {
      x: x + 0.88,
      y: y + 0.55,
      w: 1.9,
      h: 0.25,
      fontSize: 7.5,
      fontFace: "Segoe UI",
      bold: true,
      color: CYAN_BLUE,
      align: "center",
      valign: "middle"
    });

    slide.addText(fu.desc, {
      x: x + 0.25,
      y: y + 0.9,
      w: 5.23,
      h: 1.45,
      fontSize: 9.5,
      fontFace: "Segoe UI",
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 24: Q&A / THANK YOU (BALANCED & CLEAN)
// =============================================================
{
  const slide = pptx.addSlide();
  slide.background = { path: BG_IMAGE_PATH };

  // Frosted Glass Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.0,
    y: 1.2,
    w: 9.33,
    h: 5.2,
    rectRadius: 0.12,
    fill: { color: "FFFFFF", transparency: 8 },
    line: { color: BORDER_COLOR, width: 1.5 }
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 3.5,
    y: 1.5,
    w: 6.33,
    h: 0.42,
    rectRadius: 0.08,
    fill: { color: CYAN_LIGHT },
    line: { color: BORDER_COLOR }
  });
  slide.addText("WOLDIA UNIVERSITY  •  FACULTY OF COMPUTING", {
    x: 3.5,
    y: 1.5,
    w: 6.33,
    h: 0.42,
    fontSize: 11,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY,
    align: "center",
    valign: "middle"
  });

  slide.addText("Thank You!", {
    x: 2.0,
    y: 2.2,
    w: 9.33,
    h: 1.2,
    fontSize: 48,
    fontFace: "Segoe UI",
    bold: true,
    color: PRIMARY_NAVY,
    align: "center"
  });

  slide.addText("Questions & Discussion", {
    x: 2.0,
    y: 3.4,
    w: 9.33,
    h: 0.6,
    fontSize: 22,
    fontFace: "Segoe UI",
    color: CYAN_BLUE,
    align: "center"
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.8,
    y: 4.25,
    w: 7.73,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: "F0F9FF" },
    line: { color: BORDER_COLOR }
  });

  slide.addText([
    { text: "Ethiopian Pharmacy Inventory Management System (EPIMS)\n", options: { bold: true, fontSize: 13, color: PRIMARY_NAVY } },
    { text: "Senior Undergraduate Internship Defense Project\n\n", options: { fontSize: 11, color: TEXT_MUTED } },
    { text: "Presenters: Mahlet Yimenu (160805) & Kidist Getaneh (160785)\n", options: { bold: true, fontSize: 12, color: PRIMARY_NAVY } },
    { text: "Department of Computer Science  |  August, 2026", options: { fontSize: 11, color: CYAN_BLUE } }
  ], {
    x: 3.0,
    y: 4.45,
    w: 7.33,
    h: 1.5,
    fontFace: "Segoe UI",
    align: "center"
  });
}

// Generate file with the custom medical background template
const outputPath = "c:\\Users\\rukn alzmarad\\Desktop\\kidist-recovery\\EPIMS_Medical_Template_Presentation.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log("Successfully generated medical template presentation: " + outputPath);
}).catch(err => {
  console.error("Error creating presentation:", err);
  process.exit(1);
});
