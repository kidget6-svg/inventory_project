<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['name' => 'PharmaTech Industries', 'contact_person' => 'Sarah Johnson', 'phone' => '555-0101', 'email' => 'sarah@pharmatech.com', 'address' => '123 Pharma St, Boston, MA'],
            ['name' => 'MediCore Pharmaceuticals', 'contact_person' => 'Michael Chen', 'phone' => '555-0102', 'email' => 'michael@medicore.com', 'address' => '456 Medical Ave, Chicago, IL'],
            ['name' => 'Global Drug Distributors', 'contact_person' => 'Emma Wilson', 'phone' => '555-0103', 'email' => 'emma@globaldrug.com', 'address' => '789 Healthcare Blvd, Houston, TX'],
            ['name' => 'Apex Medicines Ltd', 'contact_person' => 'David Brown', 'phone' => '555-0104', 'email' => 'david@apexmed.com', 'address' => '321 Medicine Rd, Seattle, WA'],
            ['name' => 'Nova Pharma Solutions', 'contact_person' => 'Lisa Anderson', 'phone' => '555-0105', 'email' => 'lisa@novapharma.com', 'address' => '654 Drug St, Miami, FL'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
