<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop existing indexes if they exist
        $this->dropIndexIfExists('batches', 'batches_status_index');
        $this->dropIndexIfExists('batches', 'batches_received_at_index');
        $this->dropIndexIfExists('batches', 'batches_expiry_date_index');
        $this->dropIndexIfExists('batches', 'batches_batch_number_index');

        Schema::table('batches', function (Blueprint $table) {
            // Add new fields if missing
            if (!Schema::hasColumn('batches', 'manufacturer')) {
                $table->string('manufacturer')->nullable()->after('batch_number');
            }

            if (!Schema::hasColumn('batches', 'country_of_origin')) {
                $table->string('country_of_origin')->nullable()->after('manufacturer');
            }

            if (!Schema::hasColumn('batches', 'storage_conditions')) {
                $table->string('storage_conditions')->nullable()->after('country_of_origin');
            }

            if (!Schema::hasColumn('batches', 'minimum_stock')) {
                $table->integer('minimum_stock')->default(5)->after('quantity');
            }

            if (!Schema::hasColumn('batches', 'reorder_level')) {
                $table->integer('reorder_level')->default(10)->after('minimum_stock');
            }

            // Add foreign keys
            if (!Schema::hasColumn('batches', 'received_by')) {
                $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('batches', 'purchase_order_id')) {
                $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            }

            if (!Schema::hasColumn('batches', 'received_at')) {
                $table->timestamp('received_at')->nullable();
            }

            if (!Schema::hasColumn('batches', 'last_audited_at')) {
                $table->timestamp('last_audited_at')->nullable();
            }

            // Add status if not exists
            if (!Schema::hasColumn('batches', 'status')) {
                $table->enum('status', ['available', 'quarantined', 'recalled', 'expired', 'disposed'])
                      ->default('available')->after('quantity');
            }

            // Add indexes
            $table->index('status', 'batches_status_index');
            $table->index('received_at', 'batches_received_at_index');
            $table->index('expiry_date', 'batches_expiry_date_index');
            $table->index('batch_number', 'batches_batch_number_index');
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'manufacturer', 
                'country_of_origin', 
                'storage_conditions',
                'minimum_stock', 
                'reorder_level', 
                'status',
                'received_at', 
                'last_audited_at'
            ]);

            // Drop foreign keys
            if (Schema::hasColumn('batches', 'received_by')) {
                $table->dropConstrainedForeignId('received_by');
            }

            if (Schema::hasColumn('batches', 'purchase_order_id')) {
                $table->dropConstrainedForeignId('purchase_order_id');
            }

            // Drop indexes
            $this->dropIndexIfExists('batches', 'batches_status_index');
            $this->dropIndexIfExists('batches', 'batches_received_at_index');
            $this->dropIndexIfExists('batches', 'batches_expiry_date_index');
            $this->dropIndexIfExists('batches', 'batches_batch_number_index');
        });
    }

    /**
     * Check if an index exists and drop it
     */
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        try {
            $connection = Schema::getConnection();
            $driver = $connection->getDriverName();
            
            if ($driver === 'mysql') {
                $result = $connection->select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
                if (count($result) > 0) {
                    $connection->statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
                }
            } elseif ($driver === 'pgsql') {
                $result = $connection->select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
                if (count($result) > 0) {
                    $connection->statement("DROP INDEX {$indexName}");
                }
            } else {
                // SQLite - use PRAGMA to check
                try {
                    $connection->statement("DROP INDEX IF EXISTS {$indexName}");
                } catch (\Exception $e) {
                    // Index doesn't exist, skip
                }
            }
        } catch (\Exception $e) {
            // Fallback: try to drop and ignore errors
            try {
                $connection = Schema::getConnection();
                $connection->statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
            } catch (\Exception $e) {
                // Index doesn't exist, skip
            }
        }
    }
};