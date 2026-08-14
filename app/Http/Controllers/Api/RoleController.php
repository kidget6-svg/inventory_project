<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * List all roles with their permission slugs, plus the permission catalog.
     */
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('is_system', 'desc')->orderBy('name')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'is_system' => $role->is_system,
            'permissions' => $role->permissions->pluck('slug')->all(),
        ]);

        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions,
            'groups' => $permissions->pluck('group')->unique()->values()->all(),
        ]);
    }

    /**
     * Create a new role with its permissions.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'slug' => $this->uniqueSlug($request->name),
            'description' => $request->description,
            'is_system' => false,
        ]);

        $role->permissions()->sync($this->permissionIds($request->input('permissions', [])));

        return response()->json([
            'message' => 'Role created successfully.',
            'role' => $this->rolePayload($role),
        ], 201);
    }

    /**
     * Update a role's details and permissions.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if (!$role->is_system) {
            $role->permissions()->sync($this->permissionIds($request->input('permissions', [])));
        }

        return response()->json([
            'message' => 'Role updated successfully.',
            'role' => $this->rolePayload($role->fresh('permissions')),
        ]);
    }

    /**
     * Delete a custom role (system roles cannot be removed).
     */
    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return response()->json(['message' => 'System roles cannot be deleted.'], 403);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    protected function permissionIds(array $slugs): array
    {
        return Permission::whereIn('slug', $slugs)->pluck('id')->all();
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (Role::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    protected function rolePayload(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'is_system' => $role->is_system,
            'permissions' => $role->permissions->pluck('slug')->all(),
        ];
    }
}
