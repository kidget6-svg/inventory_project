<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // First, check and drop existing indexes if they exist
        $this->dropIndexIfExists('sales', 'sales_customer_name_index');
        $this->dropIndexIfExists('sales', 'sales_sale_date_index');

        Schema::table('sales', function (Blueprint $table) {
            // Add customer fields if missing
            if (!Schema::hasColumn('sales', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('receipt_number');
            }

            if (!Schema::hasColumn('sales', 'customer_phone')) {
                $table->string('customer_phone')->nullable()->after('customer_name');
            }

            if (!Schema::hasColumn('sales', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_phone');
            }

            if (!Schema::hasColumn('sales', 'created_by_pharmacist_at')) {
                $table->timestamp('created_by_pharmacist_at')->nullable();
            }

            if (!Schema::hasColumn('sales', 'completed_by_cashier_at')) {
                $table->timestamp('completed_by_cashier_at')->nullable();
            }

            if (!Schema::hasColumn('sales', 'notes')) {
                $table->text('notes')->nullable();
            }

            // Add indexes
            $table->index('customer_name', 'sales_customer_name_index');
            $table->index('sale_date', 'sales_sale_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'customer_name', 
                'customer_phone', 
                'customer_email',
                'created_by_pharmacist_at', 
                'completed_by_cashier_at', 
                'notes'
            ]);
            
            // Drop indexes
            $this->dropIndexIfExists('sales', 'sales_customer_name_index');
            $this->dropIndexIfExists('sales', 'sales_sale_date_index');
        });
    }

    /**
     * Check if an index exists and drop it
     */
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        try {
            // Get the database connection
            $connection = Schema::getConnection();
            $driver = $connection->getDriverName();
            
            // Different approaches for different database drivers
            if ($driver === 'mysql') {
                $result = $connection->select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
                if (count($result) > 0) {
                    $connection->statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
                }
            } elseif ($driver === 'pgsql') {
                // PostgreSQL approach
                $result = $connection->select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
                if (count($result) > 0) {
                    $connection->statement("DROP INDEX {$indexName}");
                }
            } else {
                // SQLite approach - try-catch
                try {
                    $connection->statement("DROP INDEX IF EXISTS {$indexName}");
                } catch (\Exception $e) {
                    // Index doesn't exist, skip
                }
            }
        } catch (\Exception $e) {
            // If we can't check, try to drop and ignore errors
            try {
                $connection = Schema::getConnection();
                $connection->statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
            } catch (\Exception $e) {
                // Index doesn't exist, skip
            }
        }
    }
};