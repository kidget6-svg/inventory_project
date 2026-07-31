<?php
// database/migrations/2026_07_31_000004_add_all_foreign_keys.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Foreign keys for medicines table
        Schema::table('medicines', function (Blueprint $table) {
            if (Schema::hasColumn('medicines', 'category_id')) {
                try {
                    $table->foreign('category_id')
                        ->references('id')
                        ->on('categories')
                        ->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
            
            if (Schema::hasColumn('medicines', 'supplier_id')) {
                try {
                    $table->foreign('supplier_id')
                        ->references('id')
                        ->on('suppliers')
                        ->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });

        // Foreign keys for stock_movements table
        Schema::table('stock_movements', function (Blueprint $table) {
            if (Schema::hasColumn('stock_movements', 'medicine_id')) {
                try {
                    $table->foreign('medicine_id')
                        ->references('id')
                        ->on('medicines')
                        ->onDelete('cascade');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
            
            if (Schema::hasColumn('stock_movements', 'user_id')) {
                try {
                    $table->foreign('user_id')
                        ->references('id')
                        ->on('users')
                        ->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });

        // Foreign keys for sales table
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'user_id')) {
                try {
                    $table->foreign('user_id')
                        ->references('id')
                        ->on('users')
                        ->onDelete('cascade');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });

        // Foreign keys for sale_items table
        Schema::table('sale_items', function (Blueprint $table) {
            if (Schema::hasColumn('sale_items', 'sale_id')) {
                try {
                    $table->foreign('sale_id')
                        ->references('id')
                        ->on('sales')
                        ->onDelete('cascade');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
            
            if (Schema::hasColumn('sale_items', 'medicine_id')) {
                try {
                    $table->foreign('medicine_id')
                        ->references('id')
                        ->on('medicines')
                        ->onDelete('cascade');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });

        // Foreign keys for purchase_orders table
        if (Schema::hasTable('purchase_orders')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                if (Schema::hasColumn('purchase_orders', 'supplier_id')) {
                    try {
                        $table->foreign('supplier_id')
                            ->references('id')
                            ->on('suppliers')
                            ->onDelete('cascade');
                    } catch (\Exception $e) {}
                }
                
                if (Schema::hasColumn('purchase_orders', 'user_id')) {
                    try {
                        $table->foreign('user_id')
                            ->references('id')
                            ->on('users')
                            ->onDelete('cascade');
                    } catch (\Exception $e) {}
                }
            });
        }

        // Foreign keys for purchase_order_items table
        if (Schema::hasTable('purchase_order_items')) {
            Schema::table('purchase_order_items', function (Blueprint $table) {
                if (Schema::hasColumn('purchase_order_items', 'purchase_order_id')) {
                    try {
                        $table->foreign('purchase_order_id')
                            ->references('id')
                            ->on('purchase_orders')
                            ->onDelete('cascade');
                    } catch (\Exception $e) {}
                }
                
                if (Schema::hasColumn('purchase_order_items', 'medicine_id')) {
                    try {
                        $table->foreign('medicine_id')
                            ->references('id')
                            ->on('medicines')
                            ->onDelete('cascade');
                    } catch (\Exception $e) {}
                }
            });
        }
    }

    public function down(): void
    {
        // Drop foreign keys in reverse order
        
        // Purchase order items
        if (Schema::hasTable('purchase_order_items')) {
            Schema::table('purchase_order_items', function (Blueprint $table) {
                try {
                    $table->dropForeign(['purchase_order_id']);
                } catch (\Exception $e) {}
                try {
                    $table->dropForeign(['medicine_id']);
                } catch (\Exception $e) {}
            });
        }

        // Purchase orders
        if (Schema::hasTable('purchase_orders')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                try {
                    $table->dropForeign(['supplier_id']);
                } catch (\Exception $e) {}
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {}
            });
        }

        // Sale items
        Schema::table('sale_items', function (Blueprint $table) {
            try {
                $table->dropForeign(['sale_id']);
            } catch (\Exception $e) {}
            try {
                $table->dropForeign(['medicine_id']);
            } catch (\Exception $e) {}
        });

        // Sales
        Schema::table('sales', function (Blueprint $table) {
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {}
        });

        // Stock movements
        Schema::table('stock_movements', function (Blueprint $table) {
            try {
                $table->dropForeign(['medicine_id']);
            } catch (\Exception $e) {}
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {}
        });

        // Medicines
        Schema::table('medicines', function (Blueprint $table) {
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {}
            try {
                $table->dropForeign(['supplier_id']);
            } catch (\Exception $e) {}
        });
    }
};