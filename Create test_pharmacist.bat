@echo off
echo ========================================
echo     PHARMACIST PERMISSION TEST
echo ========================================
echo.

echo [1] Total Medicines in Database:
php artisan tinker --execute="echo \App\Models\Medicine::count();"

echo.
echo [2] Total Categories in Database:
php artisan tinker --execute="echo \App\Models\Category::count();"

echo.
echo [3] Pharmacist - View Medicines:
php artisan tinker --execute="$p = \App\Models\User::where('email','pharmacist@pharmacy.com')->first(); $t = $p->createToken('test')->plainTextToken; $r = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => 'Bearer ' . $t])->get('http://localhost:8000/api/medicines'); echo 'Sees: ' . count($r->json()['data'] ?? []);"

echo.
echo [4] Pharmacist - View Categories:
php artisan tinker --execute="$p = \App\Models\User::where('email','pharmacist@pharmacy.com')->first(); $t = $p->createToken('test')->plainTextToken; $r = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => 'Bearer ' . $t])->get('http://localhost:8000/api/categories'); echo 'Sees: ' . count($r->json()['data'] ?? []);"

echo.
echo [5] Admin - View Medicines (For Comparison):
php artisan tinker --execute="$a = \App\Models\User::where('email','admin@pharmacy.com')->first(); $t = $a->createToken('test')->plainTextToken; $r = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => 'Bearer ' . $t])->get('http://localhost:8000/api/medicines'); echo 'Sees: ' . count($r->json()['data'] ?? []);"

echo.
echo ========================================
pause