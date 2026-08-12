# Create clean, professional SVG product illustrations for medicines
$basePath = "C:\Users\HP\Documents\inventory_project\public\images\medicines"
if (-not (Test-Path $basePath)) { New-Item -ItemType Directory -Path $basePath -Force }

$publicPath = "C:\Users\HP\Documents\inventory_project\public\images"
if (-not (Test-Path $publicPath)) { New-Item -ItemType Directory -Path $publicPath -Force }

$images = @{
    "amoxicillin.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_amox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cap_top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#be185d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cap_bot" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_amox)"/>
  <g transform="translate(100, 95) rotate(-35)">
    <rect x="-25" y="-55" width="50" height="55" rx="25" fill="url(#cap_top)"/>
    <rect x="-25" y="0" width="50" height="55" rx="25" fill="url(#cap_bot)"/>
    <line x1="-25" y1="0" x2="25" y2="0" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  </g>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1" font-family="Arial, sans-serif">AMOXICILLIN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#0284c7" font-family="Arial, sans-serif">500mg Capsules</text>
</svg>
"@
    "paracetamol.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_para" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_para)"/>
  <circle cx="100" cy="90" r="45" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="60" y1="90" x2="140" y2="90" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="4,3"/>
  <text x="100" y="85" text-anchor="middle" font-size="9" font-weight="700" fill="#64748b" font-family="Arial, sans-serif">500mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#334155" font-family="Arial, sans-serif">PARACETAMOL</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#64748b" font-family="Arial, sans-serif">Pain &amp; Fever Relief</text>
</svg>
"@
    "ibuprofen.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_ibu" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff7ed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffedd5;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ibup_tab" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ea580c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c2410c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_ibu)"/>
  <ellipse cx="100" cy="90" rx="48" ry="32" fill="url(#ibup_tab)"/>
  <ellipse cx="100" cy="86" rx="42" ry="26" fill="#f97316" opacity="0.4"/>
  <text x="100" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">400mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412" font-family="Arial, sans-serif">IBUPROFEN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#ea580c" font-family="Arial, sans-serif">Anti-inflammatory</text>
</svg>
"@
    "cetirizine.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_cet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fefce8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fef9c3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_cet)"/>
  <rect x="55" y="65" width="90" height="50" rx="25" fill="#ffffff" stroke="#facc15" stroke-width="3"/>
  <line x1="100" y1="65" x2="100" y2="115" stroke="#eab308" stroke-width="2"/>
  <text x="100" y="94" text-anchor="middle" font-size="10" font-weight="700" fill="#854d0e" font-family="Arial, sans-serif">10mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#a16207" font-family="Arial, sans-serif">CETIRIZINE</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#ca8a04" font-family="Arial, sans-serif">Allergy Relief</text>
</svg>
"@
    "omeprazole.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_ome" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf5ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f3e8ff;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ome_top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7e22ce;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_ome)"/>
  <g transform="translate(100, 95) rotate(45)">
    <rect x="-24" y="-52" width="48" height="52" rx="24" fill="url(#ome_top)"/>
    <rect x="-24" y="0" width="48" height="52" rx="24" fill="#ffffff" stroke="#d8b4fe" stroke-width="2"/>
  </g>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#6b21a8" font-family="Arial, sans-serif">OMEPRAZOLE</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#9333ea" font-family="Arial, sans-serif">20mg Acid Reducer</text>
</svg>
"@
    "metformin-500mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_met" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_met)"/>
  <rect x="52" y="68" width="96" height="44" rx="12" fill="#ffffff" stroke="#4ade80" stroke-width="3"/>
  <text x="100" y="95" text-anchor="middle" font-size="11" font-weight="700" fill="#166534" font-family="Arial, sans-serif">500 mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#14532d" font-family="Arial, sans-serif">METFORMIN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#16a34a" font-family="Arial, sans-serif">Blood Sugar Control</text>
</svg>
"@
    "azithromycin-250mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_azi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fce7f3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_azi)"/>
  <rect x="56" y="66" width="88" height="48" rx="24" fill="#db2777" />
  <circle cx="100" cy="90" r="16" fill="#ffffff" opacity="0.3"/>
  <text x="100" y="94" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">250mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#831843" font-family="Arial, sans-serif">AZITHROMYCIN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#be185d" font-family="Arial, sans-serif">Broad Spectrum</text>
</svg>
"@
    "ciprofloxacin-500mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_cip" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ecfdf5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a7f3d0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_cip)"/>
  <circle cx="100" cy="90" r="44" fill="#059669"/>
  <circle cx="100" cy="90" r="36" fill="#ffffff"/>
  <text x="100" y="95" text-anchor="middle" font-size="11" font-weight="700" fill="#047857" font-family="Arial, sans-serif">500mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#064e3b" font-family="Arial, sans-serif">CIPROFLOXACIN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#059669" font-family="Arial, sans-serif">Antibacterial</text>
</svg>
"@
    "losartan-potassium-50mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_los" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eff6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#bfdbfe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_los)"/>
  <rect x="52" y="68" width="96" height="44" rx="22" fill="#2563eb"/>
  <text x="100" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">50 mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a8a" font-family="Arial, sans-serif">LOSARTAN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#1d4ed8" font-family="Arial, sans-serif">Blood Pressure</text>
</svg>
"@
    "atorvastatin-20mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_ato" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eef2ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_ato)"/>
  <circle cx="100" cy="90" r="42" fill="#4f46e5"/>
  <text x="100" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">20mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#312e81" font-family="Arial, sans-serif">ATORVASTATIN</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#4338ca" font-family="Arial, sans-serif">Cholesterol Care</text>
</svg>
"@
    "salbutamol-inhaler-100mcg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_sal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#bae6fd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_sal)"/>
  <!-- Inhaler illustration -->
  <path d="M75 45 L115 45 L115 105 L145 105 L145 135 L75 135 Z" fill="#0284c7"/>
  <rect x="85" y="30" width="20" height="20" rx="4" fill="#38bdf8"/>
  <text x="100" y="170" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1" font-family="Arial, sans-serif">SALBUTAMOL</text>
  <text x="100" y="184" text-anchor="middle" font-size="9" fill="#0284c7" font-family="Arial, sans-serif">100mcg Inhaler</text>
</svg>
"@
    "augmentin-625mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_aug" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef2f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fecaca;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_aug)"/>
  <rect x="50" y="55" width="100" height="70" rx="8" fill="#ffffff" stroke="#dc2626" stroke-width="2.5"/>
  <rect x="50" y="55" width="100" height="22" rx="6" fill="#dc2626"/>
  <text x="100" y="70" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">AUGMENTIN</text>
  <text x="100" y="102" text-anchor="middle" font-size="13" font-weight="800" fill="#991b1b" font-family="Arial, sans-serif">625 mg</text>
  <text x="100" y="168" text-anchor="middle" font-size="11" font-weight="700" fill="#7f1d1d" font-family="Arial, sans-serif">AUGMENTIN</text>
  <text x="100" y="183" text-anchor="middle" font-size="9" fill="#b91c1c" font-family="Arial, sans-serif">Co-Amoxiclav</text>
</svg>
"@
    "hydrochlorothiazide-25mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_hct" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ecfeff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a5f3fc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_hct)"/>
  <circle cx="100" cy="90" r="42" fill="#06b6d4"/>
  <text x="100" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">25mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="10" font-weight="700" fill="#155e75" font-family="Arial, sans-serif">HYDROCHLOROTHIAZIDE</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#0891b2" font-family="Arial, sans-serif">Diuretic 25mg</text>
</svg>
"@
    "metoprolol-tartrate-50mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_meto" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fffbeb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fef3c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_meto)"/>
  <rect x="56" y="68" width="88" height="44" rx="22" fill="#d97706"/>
  <text x="100" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">50 mg</text>
  <text x="100" y="165" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f" font-family="Arial, sans-serif">METOPROLOL</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#b45309" font-family="Arial, sans-serif">Beta Blocker</text>
</svg>
"@
    "doxycycline-100mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_dox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fefce8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fde68a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="dox_top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#854d0e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#713f12;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_dox)"/>
  <g transform="translate(100, 95) rotate(-20)">
    <rect x="-24" y="-52" width="48" height="52" rx="24" fill="url(#dox_top)"/>
    <rect x="-24" y="0" width="48" height="52" rx="24" fill="#eab308"/>
  </g>
  <text x="100" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#713f12" font-family="Arial, sans-serif">DOXYCYCLINE</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" fill="#a16207" font-family="Arial, sans-serif">100mg Hyclate</text>
</svg>
"@
}

foreach ($file in $images.Keys) {
    $path = Join-Path $basePath $file
    Set-Content -Path $path -Value $images[$file] -Encoding UTF8
    Write-Host "Created $path"
}

# Create placeholder image in public/images/medicine-placeholder.svg
$placeholderSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg_ph" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg_ph)"/>
  <g transform="translate(100, 90) scale(1.2)">
    <circle cx="0" cy="0" r="30" fill="#0284c7" opacity="0.1"/>
    <path d="M-15,-10 A15,15 0 0,1 15,-10 L15,10 A15,15 0 0,1 -15,10 Z" fill="#0284c7"/>
    <path d="M-15,-10 A15,15 0 0,1 15,-10 L15,0 L-15,0 Z" fill="#38bdf8"/>
  </g>
  <text x="100" y="160" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b" font-family="Arial, sans-serif">MEDICINE</text>
</svg>
"@

$placeholderPath = Join-Path $publicPath "medicine-placeholder.svg"
Set-Content -Path $placeholderPath -Value $placeholderSvg -Encoding UTF8
Write-Host "Created $placeholderPath"

Write-Host "All medicine product images created successfully."
