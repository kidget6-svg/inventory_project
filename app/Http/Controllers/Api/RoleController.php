<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * List all roles (with their permissions), all permissions
     * (with groups), and the unique group names.
     *
     * GET /api/roles
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')
            ->orderBy('id')
            ->get()
            ->map(function (Role $role) {
                return [
                    'id'         => $role->id,
                    'name'       => $role->name,
                    'slug'       => $role->slug,
                    'description'=> $role->description,
                    'is_system'  => (bool) $role->is_system,
                    'permissions'=> $role->permissions->pluck('slug')->all(),
                ];
            });

        $permissions = Permission::orderBy('group')
            ->orderBy('name')
            ->get()
            ->map(function (Permission $perm) {
                return [
                    'id'    => $perm->id,
                    'slug'  => $perm->slug,
                    'name'  => $perm->name,
                    'group' => $perm->group,
                ];
            });

        $groups = Permission::whereNotNull('group')
            ->pluck('group')
            ->unique()
            ->values()
            ->all();

        return response()->json([
            'roles'       => $roles,
            'permissions' => $permissions,
            'groups'      => $groups,
        ]);
    }

    /**
     * Store a new (custom) role with the selected permissions.
     *
     * POST /api/roles
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'is_system'   => false,
        ]);

        $this->syncPermissions($role, $request->input('permissions', []));

        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Display a single role with its permissions.
     *
     * GET /api/roles/{role}
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('permissions'));
    }

    /**
     * Update an existing role.
     *
     * PUT /api/roles/{role}
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
        ]);

        $role->update([
            'name'        => $request->name ?? $role->name,
            'description' => $request->description ?? $role->description,
        ]);

        if ($request->has('permissions')) {
            $this->syncPermissions($role, $request->input('permissions'));
        }

        return response()->json($role->load('permissions'));
    }

    /**
     * Delete a non-system role.
     *
     * DELETE /api/roles/{role}
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json([
                'message' => 'System roles cannot be deleted.',
            ], 403);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully.',
        ]);
    }

    /**
     * Sync the given permission slugs for the role, ignoring
     * any slugs that don't exist in the permissions table.
     */
    protected function syncPermissions(Role $role, array $permissionSlugs): void
    {
        $permissionIds = Permission::whereIn('slug', $permissionSlugs)
            ->pluck('id')
            ->all();

        $role->permissions()->sync($permissionIds);
    }
}
