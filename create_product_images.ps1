# Create clean, professional SVG product illustrations for retail products
$basePath = "C:\Users\HP\Documents\inventory_project\public\images\retail-products"
if (-not (Test-Path $basePath)) { New-Item -ItemType Directory -Path $basePath -Force }

$images = @{
    "lipstick-ruby-red.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef2f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fce7e7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="red1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg1)"/>
  <rect x="75" y="45" width="50" height="65" rx="6" fill="url(#red1)"/>
  <rect x="80" y="30" width="40" height="20" rx="4" fill="#991b1b"/>
  <rect x="82" y="110" width="36" height="35" rx="4" fill="#fecaca"/>
  <ellipse cx="100" cy="128" rx="10" ry="5" fill="#fca5a5"/>
  <text x="100" y="170" text-anchor="middle" font-size="11" font-weight="600" fill="#991b1b" font-family="Arial, sans-serif">LIPSTICK</text>
  <text x="100" y="185" text-anchor="middle" font-size="9" fill="#b91c1c" font-family="Arial, sans-serif">Ruby Red</text>
</svg>
"@
    "foundation-natural-beige.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf7f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5efe6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="beige" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#d4a373;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b08050;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg2)"/>
  <rect x="70" y="55" width="60" height="85" rx="10" fill="url(#beige)"/>
  <rect x="78" y="38" width="44" height="22" rx="4" fill="#8b5e3c"/>
  <rect x="85" y="100" width="30" height="25" rx="3" fill="#fef3c7"/>
  <text x="100" y="168" text-anchor="middle" font-size="10" font-weight="600" fill="#8b5e3c" font-family="Arial, sans-serif">FOUNDATION</text>
  <text x="100" y="182" text-anchor="middle" font-size="9" fill="#a0714f" font-family="Arial, sans-serif">Natural Beige</text>
</svg>
"@
    "mascara-black-volume.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="black1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg3)"/>
  <rect x="65" y="65" width="70" height="95" rx="8" fill="url(#black1)"/>
  <rect x="72" y="50" width="56" height="22" rx="4" fill="#334155"/>
  <rect x="85" y="38" width="30" height="22" rx="4" fill="#475569"/>
  <rect x="90" y="28" width="20" height="16" rx="3" fill="#64748b"/>
  <text x="100" y="178" text-anchor="middle" font-size="10" font-weight="600" fill="#1e293b" font-family="Arial, sans-serif">MASCARA</text>
  <text x="100" y="192" text-anchor="middle" font-size="9" fill="#475569" font-family="Arial, sans-serif">Black Volume</text>
</svg>
"@
    "nail-polish-midnight-blue.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eff6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dbeafe;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="blue1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#172554;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg4)"/>
  <rect x="75" y="65" width="50" height="85" rx="8" fill="url(#blue1)"/>
  <rect x="82" y="45" width="36" height="25" rx="4" fill="#1e40af"/>
  <rect x="88" y="35" width="24" height="16" rx="3" fill="#2563eb"/>
  <rect x="82" y="110" width="36" height="5" rx="2" fill="#93c5fd"/>
  <rect x="82" y="120" width="36" height="5" rx="2" fill="#60a5fa"/>
  <text x="100" y="175" text-anchor="middle" font-size="10" font-weight="600" fill="#1e3a8a" font-family="Arial, sans-serif">NAIL POLISH</text>
  <text x="100" y="189" text-anchor="middle" font-size="9" fill="#3b82f6" font-family="Arial, sans-serif">Midnight Blue</text>
</svg>
"@
    "face-cream-moisturizing.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fefce8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fef9c3;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="jar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f5f5f4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e7e5e4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg5)"/>
  <rect x="65" y="55" width="70" height="80" rx="14" fill="url(#jar)"/>
  <rect x="72" y="38" width="56" height="24" rx="6" fill="#d6d3d1"/>
  <rect x="78" y="32" width="44" height="12" rx="3" fill="#e7e5e4"/>
  <rect x="80" y="90" width="40" height="28" rx="6" fill="#fefce8"/>
  <text x="100" y="158" text-anchor="middle" font-size="10" font-weight="600" fill="#78716c" font-family="Arial, sans-serif">FACE CREAM</text>
  <text x="100" y="172" text-anchor="middle" font-size="9" fill="#a8a29e" font-family="Arial, sans-serif">Moisturizing</text>
</svg>
"@
    "sunscreen-spf30.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fffbeb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fef3c7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="yellow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg6)"/>
  <rect x="60" y="65" width="80" height="95" rx="10" fill="url(#yellow)"/>
  <rect x="68" y="48" width="64" height="24" rx="6" fill="#f59e0b"/>
  <rect x="80" y="38" width="40" height="16" rx="4" fill="#fbbf24"/>
  <circle cx="100" cy="105" r="18" fill="#fffbeb"/>
  <text x="100" y="100" text-anchor="middle" font-size="10" font-weight="700" fill="#b45309" font-family="Arial, sans-serif">SPF</text>
  <text x="100" y="115" text-anchor="middle" font-size="9" fill="#92400e" font-family="Arial, sans-serif">30</text>
  <text x="100" y="178" text-anchor="middle" font-size="10" font-weight="600" fill="#b45309" font-family="Arial, sans-serif">SUNSCREEN</text>
</svg>
"@
    "vitamin-c-tablets-100ct.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff7ed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffedd5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg7)"/>
  <rect x="68" y="50" width="64" height="105" rx="8" fill="#ffffff" stroke="#fdba74" stroke-width="2"/>
  <rect x="74" y="55" width="52" height="22" rx="4" fill="#f97316"/>
  <text x="100" y="70" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">C-1000</text>
  <circle cx="86" cy="105" r="9" fill="#fed7aa"/>
  <circle cx="114" cy="105" r="9" fill="#fed7aa"/>
  <circle cx="86" cy="128" r="9" fill="#fdba74"/>
  <circle cx="114" cy="128" r="9" fill="#fdba74"/>
  <circle cx="86" cy="151" r="9" fill="#fed7aa"/>
  <circle cx="114" cy="151" r="9" fill="#fed7aa"/>
  <text x="100" y="180" text-anchor="middle" font-size="9" font-weight="600" fill="#c2410c" font-family="Arial, sans-serif">VITAMIN C</text>
  <text x="100" y="193" text-anchor="middle" font-size="8" fill="#ea580c" font-family="Arial, sans-serif">100 Tablets</text>
</svg>
"@
    "omega-3-fish-oil-120ct.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eff6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dbeafe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg8)"/>
  <rect x="65" y="48" width="70" height="108" rx="8" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
  <rect x="72" y="52" width="56" height="22" rx="4" fill="#2563eb"/>
  <text x="100" y="67" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">OMEGA-3</text>
  <path d="M85 105 Q100 88 115 105 Q100 122 85 105" fill="#fbbf24"/>
  <text x="100" y="115" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309" font-family="Arial, sans-serif">120</text>
  <text x="100" y="180" text-anchor="middle" font-size="9" font-weight="600" fill="#1e40af" font-family="Arial, sans-serif">FISH OIL</text>
  <text x="100" y="193" text-anchor="middle" font-size="8" fill="#3b82f6" font-family="Arial, sans-serif">Softgels</text>
</svg>
"@
    "digestive-enzyme-capsules.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fafaf9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5f5f4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg9)"/>
  <rect x="65" y="52" width="70" height="98" rx="8" fill="#ffffff" stroke="#d6d3d1" stroke-width="2"/>
  <rect x="72" y="58" width="56" height="20" rx="4" fill="#57534e"/>
  <text x="100" y="72" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">ENZYMES</text>
  <rect x="82" y="95" width="36" height="12" rx="6" fill="#a8a29e"/>
  <rect x="82" y="113" width="36" height="12" rx="6" fill="#a8a29e"/>
  <rect x="82" y="131" width="36" height="12" rx="6" fill="#a8a29e"/>
  <text x="100" y="172" text-anchor="middle" font-size="10" font-weight="600" fill="#44403c" font-family="Arial, sans-serif">DIGESTIVE</text>
  <text x="100" y="185" text-anchor="middle" font-size="8" fill="#78716c" font-family="Arial, sans-serif">60 Capsules</text>
</svg>
"@
    "antacid-tablets-50ct.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg10" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg10)"/>
  <rect x="68" y="55" width="64" height="95" rx="8" fill="#ffffff" stroke="#bbf7d0" stroke-width="2"/>
  <rect x="75" y="60" width="50" height="18" rx="4" fill="#22c55e"/>
  <text x="100" y="73" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">ANTACID</text>
  <circle cx="100" cy="115" r="22" fill="#fefefe" stroke="#e5e7eb" stroke-width="1"/>
  <text x="100" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="#166534" font-family="Arial, sans-serif">50</text>
  <text x="100" y="175" text-anchor="middle" font-size="10" font-weight="600" fill="#15803d" font-family="Arial, sans-serif">TABLETS</text>
  <text x="100" y="188" text-anchor="middle" font-size="8" fill="#16a34a" font-family="Arial, sans-serif">Chewable</text>
</svg>
"@
    "sleep-aid-melatonin-10mg.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg11" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf5ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f3e8ff;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="purple" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6d28d9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg11)"/>
  <rect x="65" y="50" width="70" height="105" rx="8" fill="url(#purple)"/>
  <rect x="72" y="55" width="56" height="22" rx="4" fill="#6d28d9"/>
  <text x="100" y="70" text-anchor="middle" font-size="10" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">MELATONIN</text>
  <path d="M78 110 Q100 88 122 110 Q100 132 78 110" fill="#e9d5ff"/>
  <text x="100" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#6b21a8" font-family="Arial, sans-serif">10mg</text>
  <text x="100" y="178" text-anchor="middle" font-size="10" font-weight="600" fill="#ffffff" font-family="Arial, sans-serif">SLEEP AID</text>
  <text x="100" y="192" text-anchor="middle" font-size="8" fill="#e9d5ff" font-family="Arial, sans-serif">30 Tablets</text>
</svg>
"@
    "first-aid-antiseptic-cream.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg12" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef2f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fee2e2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="yellow2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#facc15;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg12)"/>
  <rect x="65" y="60" width="70" height="88" rx="10" fill="url(#yellow2)"/>
  <rect x="72" y="42" width="56" height="24" rx="4" fill="#f59e0b"/>
  <rect x="85" y="90" width="30" height="28" rx="4" fill="#ffffff" stroke="#ef4444" stroke-width="2"/>
  <rect x="92" y="97" width="16" height="14" rx="2" fill="#ef4444"/>
  <rect x="95" y="100" width="4" height="4" rx="1" fill="#fef2f2"/>
  <rect x="103" y="100" width="4" height="4" rx="1" fill="#fef2f2"/>
  <text x="100" y="170" text-anchor="middle" font-size="10" font-weight="600" fill="#92400e" font-family="Arial, sans-serif">ANTISEPTIC</text>
  <text x="100" y="184" text-anchor="middle" font-size="9" fill="#b45309" font-family="Arial, sans-serif">First Aid Cream</text>
</svg>
"@
    "hand-sanitizer-250ml.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg13" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#bae6fd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg13)"/>
  <rect x="75" y="60" width="50" height="95" rx="10" fill="url(#bottle)"/>
  <rect x="82" y="38" width="36" height="28" rx="8" fill="#7dd3fc"/>
  <rect x="88" y="28" width="24" height="16" rx="4" fill="#38bdf8"/>
  <rect x="85" y="110" width="30" height="3" rx="1" fill="#0ea5e9"/>
  <rect x="85" y="118" width="30" height="3" rx="1" fill="#0ea5e9"/>
  <text x="100" y="175" text-anchor="middle" font-size="10" font-weight="600" fill="#0369a1" font-family="Arial, sans-serif">SANITIZER</text>
  <text x="100" y="188" text-anchor="middle" font-size="8" fill="#0284c7" font-family="Arial, sans-serif">250ml</text>
</svg>
"@
    "face-masks-pack-of-10.svg" = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg14" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eff6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dbeafe;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="maskgrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg14)"/>
  <rect x="55" y="65" width="90" height="75" rx="14" fill="url(#maskgrad)"/>
  <rect x="60" y="70" width="80" height="65" rx="10" fill="#60a5fa"/>
  <rect x="78" y="85" width="44" height="28" rx="6" fill="#1e40af"/>
  <rect x="86" y="90" width="10" height="16" rx="2" fill="#93c5fd"/>
  <rect x="104" y="90" width="10" height="16" rx="2" fill="#93c5fd"/>
  <text x="100" y="162" text-anchor="middle" font-size="10" font-weight="600" fill="#1e3a8a" font-family="Arial, sans-serif">PACK OF 10</text>
  <text x="100" y="176" text-anchor="middle" font-size="9" fill="#3b82f6" font-family="Arial, sans-serif">Face Masks</text>
</svg>
"@
}

foreach ($file in $images.Keys) {
    $path = Join-Path $basePath $file
    Set-Content -Path $path -Value $images[$file] -Encoding UTF8
    Write-Host "Created $path"
}

Write-Host "All product images created."
