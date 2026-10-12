import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "Mahlet Yimenu & Kidist Getaneh";
pptx.company = "Woldia University - School of Computing";
pptx.title = "Pharmacy Inventory Management System — Multi-Branch Edition";

// ==========================================
// PALETTE: ULTRA-PREMIUM MODERN TECH (SPEC)
// ==========================================
const C_NAVY_DARK = "0B1020"; // Deep navy blue #0B1020
const C_NAVY_CARD = "111B35"; // Dark blue #111B35
const C_BLUE_ELEC = "3B82F6"; // Electric blue #3B82F6
const C_CYAN      = "22D3EE"; // Cyan accent #22D3EE
const C_WHITE     = "F8FAFC"; // White #F8FAFC
const C_MUTED     = "94A3B8"; // Muted gray #94A3B8
const C_BORDER    = "1E293B"; // Dark slate border
const C_BORDER_HI = "334155"; // High-contrast border
const C_GREEN     = "10B981"; // Emerald green
const C_RED       = "EF4444"; // Coral red
const C_AMBER     = "F59E0B"; // Warm amber

const FONT_MAIN   = "Segoe UI";

// Project Screenshots verified from public/images
const IMG_LANDING = "c:\\Users\\rukn alzmarad\\Desktop\\kidist-recovery\\public\\images\\landing page.png";
const IMG_APP     = "c:\\Users\\rukn alzmarad\\Desktop\\kidist-recovery\\public\\images\\p1.png";

// Helper for standard slide header with clean tech aesthetics
function addHeader(slide, title, category, speakerNote) {
  slide.background = { color: C_NAVY_DARK };

  // Subtle top glow accent line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 0.35,
    w: 11.73,
    h: 0.03,
    fill: { color: C_BLUE_ELEC },
    line: { color: C_BLUE_ELEC }
  });

  // Category Tag Pill
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.5,
    w: 3.2,
    h: 0.32,
    rectRadius: 0.06,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BLUE_ELEC, width: 1 }
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.5,
    w: 3.2,
    h: 0.32,
    fontSize: 9,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle"
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.9,
    w: 11.73,
    h: 0.55,
    fontSize: 22,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_WHITE,
    valign: "middle"
  });

  // Clean Footer
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 6.95,
    w: 11.73,
    h: 0.015,
    fill: { color: C_BORDER },
    line: { color: C_BORDER }
  });
  slide.addText("Laravel Pharmacy Inventory Management System  |  Multi-Branch Edition  |  Woldia University", {
    x: 0.8,
    y: 7.02,
    w: 11.73,
    h: 0.3,
    fontSize: 8.5,
    fontFace: FONT_MAIN,
    color: C_MUTED
  });

  if (speakerNote) {
    slide.addNotes(speakerNote);
  }
}

// =============================================================
// SLIDE 1: PREMIUM TITLE SLIDE
// =============================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C_NAVY_DARK };

  // Subtle digital network glowing card behind
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.7,
    w: 11.73,
    h: 6.1,
    rectRadius: 0.1,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BLUE_ELEC, width: 1.5 }
  });

  // Header Pill
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2,
    y: 1.1,
    w: 5.6,
    h: 0.4,
    rectRadius: 0.08,
    fill: { color: C_NAVY_DARK },
    line: { color: C_CYAN, width: 1 }
  });
  slide.addText("WOLDIA UNIVERSITY  •  SCHOOL OF COMPUTING", {
    x: 1.2,
    y: 1.1,
    w: 5.6,
    h: 0.4,
    fontSize: 10,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle"
  });

  slide.addText("DEPARTMENT OF COMPUTER SCIENCE  •  CAPSTONE DEFENSE", {
    x: 1.2,
    y: 1.6,
    w: 8.5,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_MUTED
  });

  // Main Title
  slide.addText("Pharmacy Inventory\nManagement System", {
    x: 1.2,
    y: 2.05,
    w: 10.5,
    h: 1.6,
    fontSize: 36,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_WHITE,
    lineSpacingMultiple: 1.15
  });

  // Subtitle
  slide.addText("A Laravel-Based Web Application for Multi-Branch Pharmacy Inventory Management", {
    x: 1.2,
    y: 3.8,
    w: 10.5,
    h: 0.5,
    fontSize: 14,
    fontFace: FONT_MAIN,
    color: C_CYAN
  });

  // Team Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2,
    y: 4.5,
    w: 5.2,
    h: 1.9,
    rectRadius: 0.08,
    fill: { color: C_NAVY_DARK },
    line: { color: C_BORDER_HI, width: 1 }
  });
  slide.addText("PRESENTERS / PROJECT TEAM", {
    x: 1.45,
    y: 4.65,
    w: 4.7,
    h: 0.25,
    fontSize: 10,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_BLUE_ELEC
  });
  slide.addText([
    { text: "• Mahlet Yimenu   ", options: { bold: true, fontSize: 13, color: C_WHITE } },
    { text: "(Student ID: 160805)\n\n", options: { fontSize: 10.5, color: C_MUTED } },
    { text: "• Kidist Getaneh   ", options: { bold: true, fontSize: 13, color: C_WHITE } },
    { text: "(Student ID: 160785)", options: { fontSize: 10.5, color: C_MUTED } }
  ], {
    x: 1.45,
    y: 4.98,
    w: 4.7,
    h: 1.3,
    fontFace: FONT_MAIN
  });

  // Metadata Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 4.5,
    w: 5.3,
    h: 1.9,
    rectRadius: 0.08,
    fill: { color: C_NAVY_DARK },
    line: { color: C_BORDER_HI, width: 1 }
  });
  slide.addText("ACADEMIC & SYSTEM CONTEXT", {
    x: 7.05,
    y: 4.65,
    w: 4.8,
    h: 0.25,
    fontSize: 10,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_BLUE_ELEC
  });
  slide.addText([
    { text: "• Course: ", options: { bold: true, fontSize: 11, color: C_WHITE } },
    { text: "BSc Senior Internship Project\n", options: { fontSize: 11, color: C_MUTED } },
    { text: "• Architecture: ", options: { bold: true, fontSize: 11, color: C_WHITE } },
    { text: "Laravel 12 Backend + React 18 SPA (Vite)\n", options: { fontSize: 11, color: C_MUTED } },
    { text: "• Edition: ", options: { bold: true, fontSize: 11, color: C_WHITE } },
    { text: "Multi-Branch Centralized Schema\n", options: { fontSize: 11, color: C_MUTED } },
    { text: "• Defense Date: ", options: { bold: true, fontSize: 11, color: C_WHITE } },
    { text: "August 2026  |  Woldia, Ethiopia", options: { fontSize: 11, color: C_MUTED } }
  ], {
    x: 7.05,
    y: 4.98,
    w: 4.8,
    h: 1.3,
    fontFace: FONT_MAIN
  });

  slide.addNotes("Good morning esteemed instructors and evaluation committee. Today, we are proud to present our Pharmacy Inventory Management System — Multi-Branch Edition. In pharmaceutical healthcare, accurate inventory management is vital to saving lives, preventing expired medicine hazards, and eliminating stock-outs. Our project delivers an enterprise-grade web application built on Laravel to centralize pharmacy operations, manage multiple branches, enforce FEFO dispensing, and automate purchasing workflows.");
}

// =============================================================
// SLIDE 2: PRESENTATION ROADMAP
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Here is our roadmap for today's presentation. We have structured our defense into five core phases: First, we examine the operational challenges motivating this system and our core objectives. Second, we dive into the architectural blueprint and relational database design. Third, we break down the Laravel backend implementation, models, and workflows. Fourth, we review the system interface, screenshots, and live demo plan. Finally, we evaluate testing results, data security, and future development horizons.";
  addHeader(slide, "What We Will Explore", "Presentation Roadmap", notes);

  const sections = [
    { num: "01", t: "Project Introduction & Objectives", d: "Pharmacy challenges, operational motivation, multi-branch scope, and functional objectives." },
    { num: "02", t: "System Design & Database", d: "Decoupled web architecture, 3NF relational schema, and entity-relationship models." },
    { num: "03", t: "Laravel Implementation", d: "Directory structure, Eloquent models, controllers, FEFO algorithm, and multi-branch handling." },
    { num: "04", t: "Screenshots & Demonstration", d: "Live application walkthrough, user interface dashboard, and clinical dispensing flow." },
    { num: "05", t: "Testing, Results & Conclusion", d: "Unit/integration testing matrix, RBAC data integrity, project impact, and future work." }
  ];

  sections.forEach((sec, idx) => {
    const x = 0.8 + idx * 2.38;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.8,
      w: 2.25,
      h: 4.8,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15,
      y: 2.05,
      w: 0.7,
      h: 0.7,
      rectRadius: 0.08,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BLUE_ELEC, width: 1.5 }
    });
    slide.addText(sec.num, {
      x: x + 0.15,
      y: 2.05,
      w: 0.7,
      h: 0.7,
      fontSize: 16,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_CYAN,
      align: "center",
      valign: "middle"
    });

    slide.addText(sec.t, {
      x: x + 0.15,
      y: 3.0,
      w: 1.95,
      h: 0.8,
      fontSize: 13,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE,
      lineSpacingMultiple: 1.15
    });

    slide.addText(sec.d, {
      x: x + 0.15,
      y: 3.9,
      w: 1.95,
      h: 2.4,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 3: THE PROBLEM WE WANT TO SOLVE
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Why does pharmacy inventory management matter so critically? In conventional community dispensaries and hospital pharmacies, operations frequently rely on paper bin cards and handwritten ledger books. This creates severe operational vulnerabilities: physical shelf counts constantly deviate from paper tallies; older batches expire unnoticed on shelves because there is no automated FEFO sorting; tracking orders across wholesale suppliers is disjointed; and critically, managing stock across different pharmacy branches is almost impossible without a synchronized database.";
  addHeader(slide, "Why Does Pharmacy Inventory Management Matter?", "Problem Motivation", notes);

  // Left Card: Disorganized Traditional Process
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_RED, width: 1.5 }
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.1,
    y: 1.9,
    w: 2.8,
    h: 0.35,
    rectRadius: 0.05,
    fill: { color: "3B1219" },
    line: { color: C_RED, width: 1 }
  });
  slide.addText("TRADITIONAL MANUAL PROCESS", {
    x: 1.1,
    y: 1.9,
    w: 2.8,
    h: 0.35,
    fontSize: 9,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_RED,
    align: "center",
    valign: "middle"
  });

  const tradPoints = [
    { t: "Difficulty Monitoring Stock:", d: "Manual bin cards fail to reflect live shelf levels, causing unexpected stock-outs of life-saving medications." },
    { t: "High Medication Expiration Waste:", d: "Lack of automated expiration tracking causes older batches to expire unnoticed, causing heavy financial and safety risks." },
    { t: "Time-Consuming Recordkeeping:", d: "Handwritten sales ledgers require hours of end-of-day tallying prone to mathematical errors." },
    { t: "Disconnected Supplier Purchasing:", d: "Paper purchase orders lack delivery verification and lead-time tracking." },
    { t: "Zero Multi-Branch Visibility:", d: "Dispensary branches operate as isolated islands unable to view or transfer surplus stock." }
  ];

  let ty = 2.45;
  tradPoints.forEach(p => {
    slide.addText([
      { text: "✖  " + p.t + "\n", options: { bold: true, fontSize: 10.5, color: C_WHITE } },
      { text: "    " + p.d, options: { fontSize: 9.5, color: C_MUTED } }
    ], {
      x: 1.1,
      y: ty,
      w: 5.1,
      h: 0.72,
      fontFace: FONT_MAIN
    });
    ty += 0.78;
  });

  // Right Card: Structured Digital Solution
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_CYAN, width: 1.5 }
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.1,
    y: 1.9,
    w: 2.8,
    h: 0.35,
    rectRadius: 0.05,
    fill: { color: "0E3A4A" },
    line: { color: C_CYAN, width: 1 }
  });
  slide.addText("STRUCTURED DIGITAL SYSTEM", {
    x: 7.1,
    y: 1.9,
    w: 2.8,
    h: 0.35,
    fontSize: 9,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle"
  });

  const digiPoints = [
    { t: "Real-Time Centralized Inventory:", d: "Instant visibility across all medicine catalog records, active batches, and physical shelf coordinates." },
    { t: "Automated FEFO Expiry Protection:", d: "First Expired, First Out dispensing algorithm automatically allocates stock nearing expiration first." },
    { t: "Automated Transaction Ledgers:", d: "Every sale, purchase receipt, and transfer appends an immutable stock ledger row automatically." },
    { t: "Structured 5-Stage Procurement:", d: "Complete purchase order lifecycle prevents duplicate stock additions and tracks vendor lead times." },
    { t: "Unified Multi-Branch Oversight:", d: "Central database distinguishes branch inventory and supports verified inter-branch stock transfers." }
  ];

  let dy = 2.45;
  digiPoints.forEach(p => {
    slide.addText([
      { text: "✔  " + p.t + "\n", options: { bold: true, fontSize: 10.5, color: C_CYAN } },
      { text: "    " + p.d, options: { fontSize: 9.5, color: C_WHITE } }
    ], {
      x: 7.1,
      y: dy,
      w: 5.1,
      h: 0.72,
      fontFace: FONT_MAIN
    });
    dy += 0.78;
  });
}

// =============================================================
// SLIDE 4: PROPOSED SOLUTION
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "To solve these challenges, we built EPIMS: One unified system for complete inventory control. At the center sits a consolidated pharmacy operational engine that connects six critical operational modules: Medicine information and therapeutic categorizing; Supplier and procurement management; Multi-batch tracking with immutable movement ledgers; Point of sale purchasing and sales; Expiration and low-stock alerts; and unified Multi-branch inventory tracking. By replacing disconnected spreadsheets with a central relational database, pharmacy staff gain immediate, verifiable control over their supply chain.";
  addHeader(slide, "One System, Better Inventory Control", "Proposed Solution", notes);

  // Central Hub Concept: 6 Connected Module Cards
  const modules = [
    { title: "Medicine & Categories", icon: "💊", desc: "Cataloging generic/brand names, dosage forms, therapeutic categories, and shelf locations." },
    { title: "Suppliers & Purchasing", icon: "🏢", desc: "Wholesale vendor directory, purchase order requisitions, and goods delivery inspection." },
    { title: "Batch & Stock Movements", icon: "📦", desc: "Multi-batch inventory with manufacturing/expiry dates and immutable audit ledgers." },
    { title: "Sales & Clinical Dispensing", icon: "🛒", desc: "Two-stage prescription staging, retail barcode checkout, and digital thermal receipts." },
    { title: "Expiry & Low-Stock Alerts", icon: "⚠️", desc: "Automated FEFO priority allocation and visual alerts when stock breaches reorder levels." },
    { title: "Multi-Branch Management", icon: "🏬", desc: "Branch-specific inventory separation and verified inter-branch stock transfers." }
  ];

  modules.forEach((mod, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 3.95;
    const y = 1.65 + row * 2.55;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 3.75,
      h: 2.35,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      rectRadius: 0.06,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BLUE_ELEC, width: 1 }
    });
    slide.addText(mod.icon, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.6,
      h: 0.6,
      fontSize: 16,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    slide.addText(mod.title, {
      x: x + 0.95,
      y: y + 0.2,
      w: 2.6,
      h: 0.6,
      fontSize: 12.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE,
      valign: "middle"
    });

    slide.addText(mod.desc, {
      x: x + 0.2,
      y: y + 0.95,
      w: 3.35,
      h: 1.2,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 5: PROJECT OBJECTIVES AND SCOPE
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "On Slide 5, we define our project objectives and transparently delineate the functional scope. Our primary objectives focus on centralizing medicine records, automating FEFO dispensing, and streamlining purchasing. Our multi-branch objectives ensure that stock quantities remain distinguishable by location and support branch transfers. Finally, regarding scope: all core inventory, multi-batch, PO, and sales modules are fully implemented; while advanced features like external e-commerce and national EHR telemetry are reserved for future phases.";
  addHeader(slide, "What Are We Building?", "Objectives & Scope", notes);

  const pillars = [
    {
      title: "Primary Objectives",
      badge: "CORE GOALS",
      col: C_BLUE_ELEC,
      items: [
        "Centralize all pharmaceutical records into a single relational database.",
        "Provide real-time visibility into shelf counts, reducing unrecorded shrinkage.",
        "Enforce automated First Expired, First Out (FEFO) dispensing algorithms.",
        "Automate multi-stage purchase ordering and goods receipt verification."
      ]
    },
    {
      title: "Multi-Branch Objectives",
      badge: "BRANCH ARCHITECTURE",
      col: C_CYAN,
      items: [
        "Model separate pharmacy branches within a unified schema (`branches` table).",
        "Make branch-specific inventory distinguishable across warehouses and counters.",
        "Support atomic inter-branch stock transfer requests (`stock_transfers`).",
        "Enable managerial reporting comparing stock valuations across branches."
      ]
    },
    {
      title: "Project Scope & Status",
      badge: "IMPLEMENTATION BOUNDARY",
      col: C_GREEN,
      items: [
        "Implemented: Medicine catalog, multi-batch FEFO, PO state machine, POS, and RBAC.",
        "Implemented: Branch ownership mapping in database schema and models.",
        "Delimited: Direct consumer public e-commerce home delivery (internal focus).",
        "Delimited: Hardware robotic dispensing and live national EHR interoperability."
      ]
    }
  ];

  pillars.forEach((p, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.65,
      w: 3.75,
      h: 5.0,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: p.col, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      rectRadius: 0.05,
      fill: { color: C_NAVY_DARK },
      line: { color: p.col, width: 1 }
    });
    slide.addText(p.badge, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: p.col,
      align: "center",
      valign: "middle"
    });

    slide.addText(p.title, {
      x: x + 0.25,
      y: 2.3,
      w: 3.25,
      h: 0.5,
      fontSize: 14,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    const bList = p.items.map(it => ({ text: "•  " + it + "\n\n", options: { fontSize: 10, color: C_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.9,
      w: 3.25,
      h: 3.5,
      fontFace: FONT_MAIN,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 6: SYSTEM ARCHITECTURE
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 6 shows how the system functions from end to end. We implemented a decoupled, high-throughput web application architecture. When a user interacts with the React 18 browser interface, an asynchronous Axios request is dispatched to the Laravel routing layer. Middleware validates authentication tokens and RBAC permissions. Next, the Controller invokes business logic, querying the database through Eloquent ORM with pessimistic row locking to prevent overselling. Finally, MySQL returns the records, and the controller sends a clean JSON response back to render the interface.";
  addHeader(slide, "How the System Works", "System Architecture", notes);

  const archNodes = [
    { title: "User / Browser", badge: "CLIENT", desc: "User interacts with responsive desktop or POS terminal." },
    { title: "Frontend (SPA)", badge: "REACT 18", desc: "Vite-bundled Single-Page App rendering components & tables." },
    { title: "Routes & Middleware", badge: "LARAVEL 12", desc: "Sanctum token verification, EnsureApproved & RBAC filters." },
    { title: "Controllers & Logic", badge: "BUSINESS LAYER", desc: "Processes requests, validates input, and coordinates FEFO logic." },
    { title: "Eloquent ORM", badge: "MODELS", desc: "Manages database entity relationships & pessimistic locks." },
    { title: "MySQL Database", badge: "DATA STORE", desc: "23 normalized ACID tables storing persistent records." }
  ];

  archNodes.forEach((node, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 3.95;
    const y = 1.65 + row * 2.55;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 3.75,
      h: 2.35,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.2,
      w: 1.8,
      h: 0.28,
      rectRadius: 0.04,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BLUE_ELEC, width: 1 }
    });
    slide.addText(node.badge, {
      x: x + 0.2,
      y: y + 0.2,
      w: 1.8,
      h: 0.28,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_CYAN,
      align: "center",
      valign: "middle"
    });

    slide.addText(node.title, {
      x: x + 0.2,
      y: y + 0.6,
      w: 3.35,
      h: 0.4,
      fontSize: 13,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    slide.addText(node.desc, {
      x: x + 0.2,
      y: y + 1.05,
      w: 3.35,
      h: 1.1,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 7: TECHNOLOGY STACK
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 7 details the technologies used in developing the application. On the backend, we utilized Laravel 12 powered by PHP 8.2+, taking advantage of its expressive routing, Eloquent ORM, and FormRequest validation. The relational database is MySQL 8.0, structured into 23 normalized tables. On the frontend, the project uses React 18 with Tailwind CSS and Vite, delivering high responsiveness. Version control was managed via Git and GitHub, and development took place in Visual Studio Code.";
  addHeader(slide, "Technologies Behind the System", "Technology Stack", notes);

  const techs = [
    { name: "Laravel 12", role: "Backend Framework", desc: "PHP 8.2+ web framework providing RESTful API routing, Eloquent ORM, and Sanctum tokens.", col: C_RED },
    { name: "PHP 8.2+", role: "Programming Language", desc: "Modern server-side language featuring typed properties, attributes, and high execution speed.", col: C_BLUE_ELEC },
    { name: "MySQL 8.0", role: "Relational Database", desc: "ACID-compliant storage engine managing 23 normalized tables, foreign keys, and indexes.", col: C_AMBER },
    { name: "React 18 & Vite", role: "Frontend UI & Build Tool", desc: "Component-based Single-Page Application (SPA) with lightning-fast Hot Module Replacement.", col: C_CYAN },
    { name: "Tailwind CSS", role: "Styling Framework", desc: "Utility-first CSS framework providing clean, responsive layouts for dashboard & POS screens.", col: C_CYAN },
    { name: "Git & VS Code", role: "Dev Environment", desc: "Git version control for source tracking and Visual Studio Code for authoring and debugging.", col: C_GREEN }
  ];

  techs.forEach((t, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 3.95;
    const y = 1.65 + row * 2.55;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 3.75,
      h: 2.35,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1.2 }
    });

    slide.addText(t.name, {
      x: x + 0.25,
      y: y + 0.2,
      w: 3.25,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    slide.addText(t.role.toUpperCase(), {
      x: x + 0.25,
      y: y + 0.6,
      w: 3.25,
      h: 0.25,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: t.col
    });

    slide.addText(t.desc, {
      x: x + 0.25,
      y: y + 0.95,
      w: 3.25,
      h: 1.2,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 8: DATABASE DESIGN OVERVIEW
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 8 presents the relational database design. The system organizes data into 23 normalized tables adhering to Third Normal Form (3NF). This structure completely eliminates data duplication while ensuring referential integrity through foreign key constraints. Here we see the primary verified entity groups: Users and Roles for authentication; Medicines and Categories for catalog management; Batches for expiration and unit prices; Suppliers and Purchase Orders for procurement; Sales and Sale Items for checkout; and Branches and Stock Transfers for multi-location tracking.";
  addHeader(slide, "How Information Is Organized", "Database Design", notes);

  const entityGroups = [
    { title: "User & Role Governance", tables: "users, roles, permissions, role_permission, personal_access_tokens", desc: "User credentials, admin activation gates, and dynamic RBAC capability assignments." },
    { title: "Medicine & Batch Catalog", tables: "medicines, batches, categories, shelves, retail_products", desc: "Generic/brand names, active batches, expiration dates, unit prices, and physical shelf coordinates." },
    { title: "Procurement Lifecycle", tables: "suppliers, purchase_orders, purchase_order_items", desc: "Wholesale vendor directory, PO 5-state lifecycle headers, and line-item order details." },
    { title: "Sales & Clinical Dispensing", tables: "sales, sale_items, stock_movements", desc: "Prescription and retail POS sales, line items, and the immutable inventory movement ledger." },
    { title: "Multi-Branch & Transfers", tables: "branches, stock_transfers, audit_logs", desc: "Branch locations, verified inter-branch stock movements, and administrative audit trails." }
  ];

  entityGroups.forEach((g, idx) => {
    const y = 1.65 + idx * 1.02;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.88,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1 }
    });

    slide.addText(g.title, {
      x: 1.1,
      y: y + 0.12,
      w: 3.2,
      h: 0.3,
      fontSize: 12,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_CYAN
    });

    slide.addText(g.tables, {
      x: 1.1,
      y: y + 0.45,
      w: 11.0,
      h: 0.35,
      fontSize: 9,
      fontFace: "Courier New",
      bold: true,
      color: C_WHITE
    });

    slide.addText(g.desc, {
      x: 4.5,
      y: y + 0.12,
      w: 7.7,
      h: 0.3,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      color: C_MUTED
    });
  });
}

// =============================================================
// SLIDE 9: IMPORTANT DATABASE RELATIONSHIPS
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 9 highlights the crucial entity relationships connecting our data. In relational databases, foreign keys establish strict relationships between tables: Categories have a One-to-Many relationship with Medicines; Medicines have a One-to-Many relationship with Batches, enabling granular expiration tracking; Purchase Orders and Sales connect to their respective Items tables through One-to-Many links; and crucially for our multi-branch requirement, the Branches table links to Stock Transfers, Users, and Retail Products, guaranteeing that every piece of inventory has an identifiable owner.";
  addHeader(slide, "Connecting the Data", "Relational Model", notes);

  const rels = [
    { parent: "Category (1)", child: "Medicines (N)", fk: "category_id", desc: "Each therapeutic category organizes multiple medicines, preventing inconsistent naming." },
    { parent: "Medicine (1)", child: "Batches (N)", fk: "medicine_id", desc: "A medicine record contains multiple inventory batches, each with its own expiration date and cost." },
    { parent: "PurchaseOrder (1)", child: "PurchaseOrderItems (N)", fk: "purchase_order_id", desc: "An order header aggregates multiple ordered items, calculating subtotal and taxes atomically." },
    { parent: "Sale (1)", child: "SaleItems (N)", fk: "sale_id", desc: "A customer transaction header links to item lines specifying batch ID and deducted quantity." },
    { parent: "Branch (1)", child: "StockTransfers (N)", fk: "from_branch_id / to_branch_id", desc: "Branch entities govern inter-branch inventory movements with source and destination verification." }
  ];

  rels.forEach((r, idx) => {
    const y = 1.65 + idx * 1.02;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: y,
      w: 11.73,
      h: 0.88,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.05,
      y: y + 0.16,
      w: 2.8,
      h: 0.55,
      rectRadius: 0.06,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BLUE_ELEC, width: 1 }
    });
    slide.addText(`${r.parent}  ➔  ${r.child}`, {
      x: 1.05,
      y: y + 0.16,
      w: 2.8,
      h: 0.55,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE,
      align: "center",
      valign: "middle"
    });

    slide.addText(`Foreign Key: ${r.fk}`, {
      x: 4.1,
      y: y + 0.15,
      w: 3.5,
      h: 0.3,
      fontSize: 10,
      fontFace: "Courier New",
      bold: true,
      color: C_CYAN
    });

    slide.addText(r.desc, {
      x: 4.1,
      y: y + 0.45,
      w: 8.1,
      h: 0.35,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      color: C_MUTED
    });
  });
}

// =============================================================
// SLIDE 10: LARAVEL APPLICATION STRUCTURE
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 10 illustrates how the codebase is organized inside the Laravel project. Following Laravel's standard architectural conventions: app/Models contains our 20 Eloquent entity classes such as Medicine, Batch, Branch, and Sale; app/Http/Controllers houses the application logic and request orchestration; routes/api.php and web.php define the endpoints protected by Sanctum middleware; database/migrations manages the version-controlled schema definitions; and public/ serves compiled assets.";
  addHeader(slide, "Inside the Laravel Project", "Application Structure", notes);

  const folders = [
    { path: "app/Models", purpose: "Eloquent ORM Models", desc: "Contains 20 verified model classes (Medicine, Batch, Branch, Sale, StockMovement, User) defining relationships and casts." },
    { path: "app/Http/Controllers", purpose: "Application Logic Controllers", desc: "Coordinates incoming requests, invokes FormRequest validators, manages DB transactions, and returns JSON responses." },
    { path: "routes/api.php & web.php", purpose: "Route Definitions", desc: "Declares authenticated endpoint groups protected by Sanctum, EnsureApproved, and EnsureHasPermission middleware." },
    { path: "database/migrations", purpose: "Schema Migrations", desc: "Version-controlled table definitions (60+ migrations) ensuring reproducible 3NF database builds across environments." },
    { path: "resources/views & js", purpose: "Interface Layer", desc: "Contains React 18 SPA components, Tailwind configuration, and DOMPDF printable receipt Blade templates." },
    { path: "public/", purpose: "Web Entry Point", desc: "Index entry point and compiled Vite bundles, images, and public application assets." }
  ];

  folders.forEach((f, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.65 + row * 1.75;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 1.58,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1.2 }
    });

    slide.addText(f.path, {
      x: x + 0.25,
      y: y + 0.18,
      w: 3.5,
      h: 0.3,
      fontSize: 12,
      fontFace: "Courier New",
      bold: true,
      color: C_CYAN
    });

    slide.addText(f.purpose.toUpperCase(), {
      x: x + 3.8,
      y: y + 0.2,
      w: 1.7,
      h: 0.25,
      fontSize: 8,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_BLUE_ELEC,
      align: "right"
    });

    slide.addText(f.desc, {
      x: x + 0.25,
      y: y + 0.55,
      w: 5.2,
      h: 0.9,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 11: MEDICINE AND CATEGORY MANAGEMENT
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 11 focuses on Medicine and Category Management. In EPIMS, each pharmaceutical record captures essential clinical and logistical attributes: brand name, generic name, barcode, therapeutic category, strength, shelf location, and reorder levels. We have also included an actual screenshot from the running application on the right side. Staff can instantly filter medicines by category, search by barcode, and monitor stock status badges.";
  addHeader(slide, "Managing Medicine Information", "Medicine Management", notes);

  // Left Side: Fields and Features
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BORDER_HI, width: 1.2 }
  });

  slide.addText("STORED MEDICINE ATTRIBUTES", {
    x: 1.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN
  });

  const fields = [
    { name: "Brand & Generic Name", desc: "Facilitates instant clinician searches regardless of trade brand." },
    { name: "Therapeutic Category", desc: "Organizes drugs (Antibiotics, Analgesics, OTC) via foreign keys." },
    { name: "Barcode & Shelf Code", desc: "Enables rapid POS scanning and exact physical warehouse location." },
    { name: "Reorder Level Threshold", desc: "Triggers automatic warning when total stock falls below threshold." },
    { name: "Prescription Flag (Rx)", desc: "Requires licensed pharmacist clinical validation before checkout." }
  ];

  let fy = 2.3;
  fields.forEach(f => {
    slide.addText([
      { text: "•  " + f.name + ": ", options: { bold: true, fontSize: 10.5, color: C_WHITE } },
      { text: f.desc, options: { fontSize: 9.5, color: C_MUTED } }
    ], {
      x: 1.05,
      y: fy,
      w: 5.1,
      h: 0.65,
      fontFace: FONT_MAIN
    });
    fy += 0.72;
  });

  // Right Side: Screenshot Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BLUE_ELEC, width: 1.2 }
  });

  slide.addText("APPLICATION INTERFACE PREVIEW", {
    x: 7.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_BLUE_ELEC
  });

  slide.addImage({
    path: IMG_APP,
    x: 7.05,
    y: 2.25,
    w: 5.23,
    h: 4.15
  });
}

// =============================================================
// SLIDE 12: PURCHASING AND SUPPLIER MANAGEMENT
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 12 explains the purchasing workflow. To ensure strict inventory traceability, we built a 5-stage procurement lifecycle: Staff select a registered wholesale supplier; create a Draft Purchase Order; add individual line items specifying medicines and unit costs; submit for administrative approval; and upon physical arrival, warehouse staff conduct quality inspection. Crucially, stock increments atomically ONLY when the order transitions to COMPLETED, preventing premature or duplicate additions.";
  addHeader(slide, "Recording Pharmacy Purchases", "Procurement Workflow", notes);

  const poSteps = [
    { st: "1. Select Supplier", role: "Wholesale Registry", desc: "Select vendor, verify contact details, TIN number, and lead times." },
    { st: "2. Draft Order", role: "Requisition", desc: "Add line-item medicines, requested quantities, and negotiated unit costs." },
    { st: "3. Manager Review", role: "Approval Gate", desc: "Locked against informal edits awaiting managerial sign-off and PDF dispatch." },
    { st: "4. Goods Delivery", role: "Warehouse QC", desc: "Physical arrival: clerk verifies batch lots, expiries, and packaging." },
    { st: "5. Atomic Stock Credit", role: "Completed", desc: "Upon verification, system atomically increments batch inventory and writes ledger." }
  ];

  poSteps.forEach((s, idx) => {
    const x = 0.8 + idx * 2.38;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.8,
      w: 2.25,
      h: 4.8,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: idx === 4 ? C_GREEN : C_BLUE_ELEC, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15,
      y: 2.05,
      w: 1.95,
      h: 0.4,
      rectRadius: 0.06,
      fill: { color: C_NAVY_DARK },
      line: { color: idx === 4 ? C_GREEN : C_BLUE_ELEC, width: 1 }
    });
    slide.addText(s.st, {
      x: x + 0.15,
      y: 2.05,
      w: 1.95,
      h: 0.4,
      fontSize: 10,
      fontFace: FONT_MAIN,
      bold: true,
      color: idx === 4 ? C_GREEN : C_CYAN,
      align: "center",
      valign: "middle"
    });

    slide.addText(s.role.toUpperCase(), {
      x: x + 0.15,
      y: 2.65,
      w: 1.95,
      h: 0.3,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE,
      align: "center"
    });

    slide.addText(s.desc, {
      x: x + 0.15,
      y: 3.1,
      w: 1.95,
      h: 3.2,
      fontSize: 10,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });
}

// =============================================================
// SLIDE 13: SALES AND FEFO STOCK DEDUCTION
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 13 details our sales and First Expired, First Out (FEFO) dispensing mechanism. In a pharmacy, dispensing medicines randomly risks leaving older batches on shelves until they expire. FEFO solves this: when a medicine is sold, our engine automatically sorts active batches by expiration date in ascending order, allocating units from the earliest expiring batch first. For example, if Batch A expires in January 2027 and Batch B in June 2027, Batch A is systematically dispensed first. This eliminates waste and protects patient safety.";
  addHeader(slide, "Selling Medicines While Managing Expiry Risk", "FEFO Dispensing", notes);

  // Left Card: FEFO Concept & Example
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_CYAN, width: 1.2 }
  });

  slide.addText("FEFO BATCH SELECTION IN ACTION", {
    x: 1.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN
  });

  slide.addText("First Expired, First Out automatically prioritizes eligible active batches with the earliest expiration date:", {
    x: 1.05,
    y: 2.2,
    w: 5.1,
    h: 0.45,
    fontSize: 9.5,
    fontFace: FONT_MAIN,
    color: C_MUTED
  });

  const batches = [
    { name: "Batch A (Expires Jan 2027)", status: "1ST DISPENSE PRIORITY", col: C_GREEN, desc: "Oldest active stock: selected automatically by query ORDER BY expiry_date ASC." },
    { name: "Batch B (Expires Jun 2027)", status: "2ND PRIORITY", col: C_BLUE_ELEC, desc: "Cascaded to only when Batch A available quantity is fully exhausted." },
    { name: "Batch C (Expires Dec 2027)", status: "RESERVED", col: C_MUTED, desc: "Newest stock: protected from premature dispensing until prior batches sell." }
  ];

  let by = 2.8;
  batches.forEach(b => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.05,
      y: by,
      w: 5.1,
      h: 1.05,
      rectRadius: 0.06,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BORDER_HI }
    });
    slide.addText(b.name, {
      x: 1.2,
      y: by + 0.1,
      w: 3.2,
      h: 0.25,
      fontSize: 10.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });
    slide.addText(b.status, {
      x: 4.3,
      y: y => by + 0.1,
      w: 1.7,
      h: 0.25,
      fontSize: 8,
      fontFace: FONT_MAIN,
      bold: true,
      color: b.col,
      align: "right"
    });
    slide.addText(b.desc, {
      x: 1.2,
      y: by + 0.42,
      w: 4.8,
      h: 0.55,
      fontSize: 9,
      fontFace: FONT_MAIN,
      color: C_MUTED
    });
    by += 1.18;
  });

  // Right Card: Sales Workflow
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BORDER_HI, width: 1.2 }
  });

  slide.addText("TWO-STAGE SALES & CHECKOUT WORKFLOW", {
    x: 7.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_BLUE_ELEC
  });

  const salesFlow = [
    { s: "1. Prescription Staging", d: "Pharmacist verifies dosage, applies FEFO batch allocation, and saves order to pending queue." },
    { s: "2. Cashier POS Pull", d: "Cashier retrieves staged prescription or scans retail OTC barcode directly into shopping cart." },
    { s: "3. Localized Payment", d: "Supports cash, Telebirr, and CBE Birr mobile payment verification channels." },
    { s: "4. Atomic Deduction & Receipt", d: "Pessimistic lock decrements stock, appends ledger row, and prints thermal slip." }
  ];

  let sy = 2.3;
  salesFlow.forEach(sf => {
    slide.addText([
      { text: sf.s + "\n", options: { bold: true, fontSize: 11, color: C_WHITE } },
      { text: sf.d, options: { fontSize: 9.5, color: C_MUTED } }
    ], {
      x: 7.05,
      y: sy,
      w: 5.1,
      h: 0.8,
      fontFace: FONT_MAIN
    });
    sy += 0.95;
  });
}

// =============================================================
// SLIDE 14: MULTI-BRANCH MANAGEMENT
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 14 highlights one of the most important architectural requirements of this project: Multi-Branch Inventory Management. Unlike single-location systems, EPIMS is designed so that multiple pharmacy branches operate on a centralized database. The branches table records distinct locations; inventory batches are linked to specific shelves and branches; staff can view stock levels across branches; and the stock_transfers table supports verified inventory transfers between a main warehouse and dispensary branches.";
  addHeader(slide, "Managing Inventory Across Multiple Branches", "Multi-Branch Architecture", notes);

  const branches = [
    { name: "Branch A: Central Hospital Dispensary", loc: "Main Campus, Woldia", role: "High-volume prescription dispensing & emergency ward stock holding." },
    { name: "Branch B: Community Retail Pharmacy", loc: "Downtown Commercial Center", role: "Retail OTC counter sales, fast-moving analgesics, and walk-in patients." },
    { name: "Branch C: Central Supply Warehouse", loc: "Logistics Hub", role: "Bulk procurement receiving, quarantined deliveries, and distribution buffer." }
  ];

  branches.forEach((br, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.65,
      w: 3.75,
      h: 3.2,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BLUE_ELEC, width: 1.2 }
    });

    slide.addText("LOCATION " + (idx + 1), {
      x: x + 0.25,
      y: 1.85,
      w: 3.25,
      h: 0.25,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_CYAN
    });

    slide.addText(br.name, {
      x: x + 0.25,
      y: 2.15,
      w: 3.25,
      h: 0.65,
      fontSize: 13,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    slide.addText("📍 " + br.loc, {
      x: x + 0.25,
      y: 2.85,
      w: 3.25,
      h: 0.3,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_BLUE_ELEC
    });

    slide.addText(br.role, {
      x: x + 0.25,
      y: 3.25,
      w: 3.25,
      h: 1.4,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      color: C_MUTED,
      lineSpacingMultiple: 1.2
    });
  });

  // Bottom Multi-Branch Concept Banner
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 5.1,
    w: 11.73,
    h: 1.55,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_CYAN, width: 1 }
  });

  slide.addText("CENTRALIZED MULTI-BRANCH CAPABILITIES IN EPIMS", {
    x: 1.1,
    y: 5.25,
    w: 11.1,
    h: 0.25,
    fontSize: 9.5,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN
  });

  slide.addText("• Distinguishable Stock Ownership: Database migrations link inventory, retail products, and shelves to specific `branch_id` records.\n• Inter-Branch Stock Transfers: `stock_transfers` table records source, destination, transferred quantity, and approval timestamps.\n• Centralized Administrative Governance: Executive dashboards allow administrators to monitor stock valuation and sales volume across all branches simultaneously.", {
    x: 1.1,
    y: 5.55,
    w: 11.1,
    h: 0.95,
    fontSize: 9.5,
    fontFace: FONT_MAIN,
    color: C_WHITE,
    lineSpacingMultiple: 1.2
  });
}

// =============================================================
// SLIDE 15: USER INTERFACE AND DASHBOARD
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 15 presents the actual user interface and executive dashboard of EPIMS. Built with React 18 and Tailwind CSS, the interface provides pharmacy managers with real-time indicators: total active medicines, low-stock alerts, expiring batches, and revenue trends. On the right, you can see the verified landing page and navigation layout. The interface was engineered for maximum clarity, low cognitive load, and quick operation during busy clinic hours.";
  addHeader(slide, "A Clear View of Pharmacy Operations", "User Interface & Dashboard", notes);

  // Left Card: Key Dashboard Indicators
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BORDER_HI, width: 1.2 }
  });

  slide.addText("CORE OPERATIONAL INDICATORS", {
    x: 1.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN
  });

  const kpis = [
    { title: "Total Active Medicines", desc: "Live aggregation of registered pharmaceutical products." },
    { title: "Low-Stock Reorder Alerts", desc: "Items currently below their defined reorder threshold." },
    { title: "Near-Expiry Batches (<90 Days)", desc: "Batches nearing expiration highlighted for immediate FEFO sale." },
    { title: "Daily Revenue & POS Sales", desc: "Live financial tracking across Telebirr, CBE Birr, and cash." },
    { title: "Pending Prescription Queue", desc: "Staged orders awaiting cashier counter payment finalization." }
  ];

  let ky = 2.3;
  kpis.forEach(k => {
    slide.addText([
      { text: "•  " + k.title + "\n", options: { bold: true, fontSize: 10.5, color: C_WHITE } },
      { text: "    " + k.desc, options: { fontSize: 9.5, color: C_MUTED } }
    ], {
      x: 1.05,
      y: ky,
      w: 5.1,
      h: 0.7,
      fontFace: FONT_MAIN
    });
    ky += 0.78;
  });

  // Right Card: Verified Landing Page Screenshot
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.73,
    h: 5.0,
    rectRadius: 0.08,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BLUE_ELEC, width: 1.2 }
  });

  slide.addText("PORTAL LANDING PAGE SCREENSHOT", {
    x: 7.05,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_BLUE_ELEC
  });

  slide.addImage({
    path: IMG_LANDING,
    x: 7.05,
    y: 2.25,
    w: 5.23,
    h: 4.15
  });
}

// =============================================================
// SLIDE 16: LIVE SYSTEM DEMONSTRATION
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 16 outlines our live demonstration sequence. During the live demo, we guide the committee through eight verified steps: 1. Log in using authenticated credentials; 2. View the dashboard KPIs; 3. Open the medicine catalog and search by generic name; 4. View a medicine's active batches; 5. Review supplier registers; 6. Demonstrate the purchase order lifecycle; 7. Demonstrate the two-stage prescription and POS checkout with FEFO allocation; and 8. Inspect the branch inventory views.";
  addHeader(slide, "From Medicine Records to Inventory Operations", "Live Demonstration Plan", notes);

  const demoSteps = [
    { num: "01", t: "Authentication & Login", d: "Sign in with role credentials, demonstrating Sanctum token issuance & approval gate." },
    { num: "02", t: "Dashboard Overview", d: "Inspect live KPI cards: total medicines, low-stock badges, and near-expiry warnings." },
    { num: "03", t: "Medicine Catalog & Search", d: "Filter by therapeutic category, search generic name, and inspect barcode records." },
    { num: "04", t: "Batch Expiry Inspection", d: "Open medicine detail view showing multiple batches, manufacturing dates, and costs." },
    { num: "05", t: "Supplier Requisition", d: "Open wholesale supplier directory and inspect registered vendor contact profiles." },
    { num: "06", t: "Purchase Order Workflow", d: "Demonstrate draft order submission, QC verification, and atomic stock incrementation." },
    { num: "07", t: "Prescription Dispensing & POS", d: "Stage prescription order, demonstrate automated FEFO batch allocation, and finalize checkout." },
    { num: "08", t: "Multi-Branch & Audit Logs", d: "Review branch stock allocation and inspect immutable administrative audit logs." }
  ];

  demoSteps.forEach((ds, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 0.8 : 6.8;
    const y = 1.65 + row * 1.25;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: y,
      w: 5.73,
      h: 1.12,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: C_BORDER_HI, width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15,
      y: y + 0.18,
      w: 0.5,
      h: 0.5,
      rectRadius: 0.06,
      fill: { color: C_NAVY_DARK },
      line: { color: C_BLUE_ELEC, width: 1 }
    });
    slide.addText(ds.num, {
      x: x + 0.15,
      y: y + 0.18,
      w: 0.5,
      h: 0.5,
      fontSize: 11,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_CYAN,
      align: "center",
      valign: "middle"
    });

    slide.addText(ds.t, {
      x: x + 0.8,
      y: y + 0.15,
      w: 4.75,
      h: 0.3,
      fontSize: 11.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    slide.addText(ds.d, {
      x: x + 0.8,
      y: y + 0.48,
      w: 4.75,
      h: 0.55,
      fontSize: 9.5,
      fontFace: FONT_MAIN,
      color: C_MUTED
    });
  });
}

// =============================================================
// SLIDE 17: SECURITY, VALIDATION, AND DATA INTEGRITY
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 17 covers security, validation, and data integrity. In a medical and financial application, software reliability is paramount. Laravel FormRequest classes validate every inbound field, intercepting invalid quantities or missing barcodes with standard HTTP 422 responses. Concurrency control uses lockForUpdate() to prevent race conditions during POS sales. Multi-step operations are wrapped in ACID DB transactions that automatically rollback on error. Finally, the audit_logs table immutably logs every sensitive administrative operation.";
  addHeader(slide, "Protecting Reliable Inventory Records", "Security & Data Integrity", notes);

  const secBlocks = [
    {
      title: "Input Validation & Rules",
      badge: "FORMREQUEST LAYER",
      col: C_BLUE_ELEC,
      items: [
        "Inbound requests validated against strict rules (required, numeric, min:1, unique barcodes).",
        "Invalid payloads rejected before reaching controllers with standard HTTP 422 JSON errors.",
        "Sanitizes strings and enforces positive quantities on all sales and stock adjustment forms."
      ]
    },
    {
      title: "Role-Based Access Control",
      badge: "MIDDLEWARE GATES",
      col: C_CYAN,
      items: [
        "Laravel Sanctum generates cryptographically signed Bearer API tokens.",
        "EnsureUserApproved gate blocks newly registered users until admin activation.",
        "EnsureHasPermission middleware protects sensitive routes (medicine CRUD, audit logs)."
      ]
    },
    {
      title: "Concurrency & Audit Integrity",
      badge: "ACID TRANSACTIONS",
      col: C_GREEN,
      items: [
        "Pessimistic locking via lockForUpdate() prevents overselling the same batch simultaneously.",
        "DB::transaction() closures ensure atomic updates; rollback on failure guarantees consistency.",
        "Immutable audit_logs table records user ID, event type, model affected, IP address, and timestamp."
      ]
    }
  ];

  secBlocks.forEach((sb, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.65,
      w: 3.75,
      h: 5.0,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: sb.col, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      rectRadius: 0.05,
      fill: { color: C_NAVY_DARK },
      line: { color: sb.col, width: 1 }
    });
    slide.addText(sb.badge, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: sb.col,
      align: "center",
      valign: "middle"
    });

    slide.addText(sb.title, {
      x: x + 0.25,
      y: 2.3,
      w: 3.25,
      h: 0.5,
      fontSize: 13.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    const bList = sb.items.map(it => ({ text: "•  " + it + "\n\n", options: { fontSize: 10, color: C_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.9,
      w: 3.25,
      h: 3.5,
      fontFace: FONT_MAIN,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 18: TESTING AND RESULTS
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 18 presents our verification testing matrix. We executed functional unit and integration tests across all core operational modules. As shown in the table, all critical test cases passed: creating medicines with valid data succeeds; invalid quantities and duplicate barcodes are properly rejected; FEFO batch queries correctly return earliest-expiring stock; purchase order state transitions increment stock atomically upon completion; and unapproved user accounts are blocked by route middleware.";
  addHeader(slide, "Does the System Work Correctly?", "Testing & Results", notes);

  const testMatrix = [
    [
      { text: "Test Case", options: { bold: true, color: C_WHITE, fill: { color: C_NAVY_DARK } } },
      { text: "Expected Result", options: { bold: true, color: C_WHITE, fill: { color: C_NAVY_DARK } } },
      { text: "Actual Result", options: { bold: true, color: C_WHITE, fill: { color: C_NAVY_DARK } } },
      { text: "Status", options: { bold: true, color: C_WHITE, fill: { color: C_NAVY_DARK } } }
    ],
    [
      { text: "Add Valid Medicine", options: { bold: true, color: C_WHITE } },
      { text: "Record created in DB, 201 Created returned" },
      { text: "Medicine & batch persisted successfully" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ],
    [
      { text: "Reject Duplicate Barcode", options: { bold: true, color: C_WHITE } },
      { text: "HTTP 422 Unprocessable Entity error" },
      { text: "Validation failed with barcode error message" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ],
    [
      { text: "FEFO Batch Selection", options: { bold: true, color: C_WHITE } },
      { text: "Earliest expiring batch allocated first" },
      { text: "Ordered by expiry_date ASC, expired excluded" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ],
    [
      { text: "PO State Completion", options: { bold: true, color: C_WHITE } },
      { text: "Stock increments ONLY when COMPLETED" },
      { text: "Draft/Pending do not increment; Completed credits stock" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ],
    [
      { text: "Unapproved User Login", options: { bold: true, color: C_WHITE } },
      { text: "HTTP 403 Forbidden access blocked" },
      { text: "EnsureUserApproved middleware rejected token" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ],
    [
      { text: "Branch Ownership Check", options: { bold: true, color: C_WHITE } },
      { text: "Inventory filters by branch_id correctly" },
      { text: "Stock records isolated by designated location" },
      { text: "PASSED", options: { bold: true, color: C_GREEN } }
    ]
  ];

  slide.addTable(testMatrix, {
    x: 0.8,
    y: 1.7,
    w: 11.73,
    colW: [2.5, 3.6, 4.3, 1.33],
    fontSize: 9.5,
    fontFace: FONT_MAIN,
    rowH: 0.68,
    border: { pt: 0.5, color: C_BORDER_HI },
    valign: "middle"
  });
}

// =============================================================
// SLIDE 19: CHALLENGES, FUTURE IMPROVEMENTS, AND CONCLUSION
// =============================================================
{
  const slide = pptx.addSlide();
  const notes = "Slide 19 reflects on what we learned and what comes next. During development, our main challenges were handling multi-batch FEFO deduction across splitting quantities, enforcing atomic PO state changes, and modeling multi-branch ownership. For future improvements, we propose integrating direct payment webhooks for Telebirr and CBE Birr, machine learning for seasonal demand forecasting, and an offline Progressive Web App mode. In conclusion, EPIMS successfully proves that a modern Laravel architecture provides the security, efficiency, and accountability needed for contemporary pharmacy inventory management.";
  addHeader(slide, "What We Learned and What Comes Next", "Lessons & Horizons", notes);

  const columns = [
    {
      title: "Real Challenges",
      badge: "ENGINEERING HURDLES",
      col: C_AMBER,
      items: [
        "FEFO Waterfall Logic: Allocating sales across multiple batches when a single batch quantity is insufficient.",
        "PO State Integrity: Guaranteeing stock is never credited twice if a purchase order is updated.",
        "Multi-Branch Data Modeling: Structuring foreign keys so transfers preserve source and destination history."
      ]
    },
    {
      title: "Future Improvements",
      badge: "ROADMAP HORIZONS",
      col: C_CYAN,
      items: [
        "Fintech API Webhooks: Direct server-to-server confirmation for Telebirr and CBE Birr transactions.",
        "Predictive AI Demand Forecasting: Time-series ML models predicting seasonal medication demand spikes.",
        "Offline Progressive Web App (PWA): Local caching to enable checkout during regional internet outages."
      ]
    },
    {
      title: "Core Conclusion",
      badge: "SUMMARY OF VALUE",
      col: C_GREEN,
      items: [
        "Replaces error-prone manual paper bin cards with a unified, real-time digital system.",
        "Automated FEFO dispensing prevents expired medicine hazards and protects pharmacy revenue.",
        "Centralized architecture provides a scalable foundation for multi-branch healthcare networks."
      ]
    }
  ];

  columns.forEach((col, idx) => {
    const x = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x,
      y: 1.65,
      w: 3.75,
      h: 5.0,
      rectRadius: 0.08,
      fill: { color: C_NAVY_CARD },
      line: { color: col.col, width: 1.2 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      rectRadius: 0.05,
      fill: { color: C_NAVY_DARK },
      line: { color: col.col, width: 1 }
    });
    slide.addText(col.badge, {
      x: x + 0.25,
      y: 1.9,
      w: 2.2,
      h: 0.3,
      fontSize: 8.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: col.col,
      align: "center",
      valign: "middle"
    });

    slide.addText(col.title, {
      x: x + 0.25,
      y: 2.3,
      w: 3.25,
      h: 0.5,
      fontSize: 13.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: C_WHITE
    });

    const bList = col.items.map(it => ({ text: "•  " + it + "\n\n", options: { fontSize: 10, color: C_MUTED } }));
    slide.addText(bList, {
      x: x + 0.25,
      y: 2.9,
      w: 3.25,
      h: 3.5,
      fontFace: FONT_MAIN,
      lineSpacingMultiple: 1.15
    });
  });
}

// =============================================================
// SLIDE 20: THANK YOU AND QUESTIONS
// =============================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: C_NAVY_DARK };

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.0,
    y: 1.2,
    w: 9.33,
    h: 5.2,
    rectRadius: 0.1,
    fill: { color: C_NAVY_CARD },
    line: { color: C_BLUE_ELEC, width: 1.5 }
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 3.5,
    y: 1.5,
    w: 6.33,
    h: 0.42,
    rectRadius: 0.08,
    fill: { color: C_NAVY_DARK },
    line: { color: C_CYAN, width: 1 }
  });
  slide.addText("WOLDIA UNIVERSITY  •  SCHOOL OF COMPUTING", {
    x: 3.5,
    y: 1.5,
    w: 6.33,
    h: 0.42,
    fontSize: 11,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_CYAN,
    align: "center",
    valign: "middle"
  });

  slide.addText("Thank You!", {
    x: 2.0,
    y: 2.2,
    w: 9.33,
    h: 1.2,
    fontSize: 48,
    fontFace: FONT_MAIN,
    bold: true,
    color: C_WHITE,
    align: "center"
  });

  slide.addText("Questions & Discussion", {
    x: 2.0,
    y: 3.4,
    w: 9.33,
    h: 0.6,
    fontSize: 22,
    fontFace: FONT_MAIN,
    color: C_BLUE_ELEC,
    align: "center"
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.8,
    y: 4.25,
    w: 7.73,
    h: 1.85,
    rectRadius: 0.08,
    fill: { color: C_NAVY_DARK },
    line: { color: C_BORDER_HI, width: 1 }
  });

  slide.addText([
    { text: "Pharmacy Inventory Management System — Multi-Branch Edition\n", options: { bold: true, fontSize: 13, color: C_CYAN } },
    { text: "Senior BSc Capstone Internship Defense Presentation\n\n", options: { fontSize: 11, color: C_MUTED } },
    { text: "Team Members: Mahlet Yimenu (160805) & Kidist Getaneh (160785)\n", options: { bold: true, fontSize: 12, color: C_WHITE } },
    { text: "Department of Computer Science  |  August 2026", options: { fontSize: 11, color: C_BLUE_ELEC } }
  ], {
    x: 3.0,
    y: 4.45,
    w: 7.33,
    h: 1.5,
    fontFace: FONT_MAIN,
    align: "center"
  });

  slide.addNotes("Thank you very much for your time and attention. That concludes our presentation of the Pharmacy Inventory Management System — Multi-Branch Edition. We would now be honored to answer any questions, discuss our implementation choices, or demonstrate specific features in code.");
}

// Write the 20-slide presentation file
const outputPath = "c:\\Users\\rukn alzmarad\\Desktop\\kidist-recovery\\Laravel_Pharmacy_Inventory_MultiBranch_20Slides.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log("Successfully generated Master 20-Slide presentation: " + outputPath);
}).catch(err => {
  console.error("Error creating presentation:", err);
  process.exit(1);
});
