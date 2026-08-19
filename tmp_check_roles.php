<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Permission;

echo "=== Table existence ===\n";
echo "roles: " . (Schema::hasTable('roles') ? "YES" : "NO") . "\n";
echo "permissions: " . (Schema::hasTable('permissions') ? "YES" : "NO") . "\n";
echo "role_permission: " . (Schema::hasTable('role_permission') ? "YES" : "NO") . "\n";

if (Schema::hasTable('roles')) {
    echo "\n=== Roles count ===\n";
    echo "Count: " . Role::count() . "\n";
    $roles = Role::with('permissions')->get();
    foreach ($roles as $r) {
        echo "  - {$r->name} (slug: {$r->slug}, is_system: " . ($r->is_system ? 'Y' : 'N') . ", permissions: " . $r->permissions->count() . ")\n";
    }
}

if (Schema::hasTable('permissions')) {
    echo "\n=== Permissions count ===\n";
    echo "Count: " . Permission::count() . "\n";
    $perms = Permission::orderBy('group')->orderBy('name')->get();
    foreach ($perms as $p) {
        echo "  - {$p->slug} (name: {$p->name}, group: {$p->group})\n";
    }

    echo "\n=== Permission groups ===\n";
    $groups = Permission::whereNotNull('group')->pluck('group')->unique()->values()->all();
    foreach ($groups as $g) {
        echo "  - {$g}\n";
    }
}

if (Schema::hasTable('role_permission')) {
    echo "\n=== role_permission pivot count ===\n";
    echo "Count: " . DB::table('role_permission')->count() . "\n";
}

// Now try to simulate the RoleController index()
echo "\n=== Simulating RoleController::index() ===\n";
try {
    $roles = Role::with('permissions')->orderBy('id')->get()->map(function ($role) {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'is_system' => (bool) $role->is_system,
            'permissions' => $role->permissions->pluck('slug')->all(),
        ];
    });
    echo "Roles loaded: " . $roles->count() . "\n";

    $permissions = Permission::orderBy('group')->orderBy('name')->get()->map(function ($perm) {
        return [
            'id' => $perm->id,
            'slug' => $perm->slug,
            'name' => $perm->name,
            'group' => $perm->group,
        ];
    });
    echo "Permissions loaded: " . $permissions->count() . "\n";

    $groups = Permission::whereNotNull('group')->pluck('group')->unique()->values()->all();
    echo "Groups loaded: " . count($groups) . "\n";

    echo "\nSUCCESS: RoleController::index() would work!\n";
} catch (\Throwable $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
