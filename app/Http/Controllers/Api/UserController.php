<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            if ($role !== 'all') {
                $query->where('role', $role);
            }
        }

        $status = $request->input('status', 'all');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $users = $query->with('branch')->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($users);
    }

    public function stats()
    {
        return response()->json([
            'total'       => User::count(),
            'pending'     => User::where('status', User::STATUS_PENDING)->count(),
            'approved'    => User::where('status', User::STATUS_APPROVED)->count(),
            'rejected'    => User::where('status', User::STATUS_REJECTED)->count(),
            'admins'      => User::where('role', 'admin')->where('status', User::STATUS_APPROVED)->count(),
            'pharmacists' => User::where('role', 'pharmacist')->where('status', User::STATUS_APPROVED)->count(),
            'cashiers'    => User::where('role', 'cashier')->where('status', User::STATUS_APPROVED)->count(),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $data = [
            'name'          => $validated['first_name'] . ' ' . $validated['last_name'],
            'first_name'    => $validated['first_name'],
            'last_name'     => $validated['last_name'],
            'email'         => $validated['email'],
            'phone_number'  => $validated['phone_number'] ?? null,
            'password'      => Hash::make($validated['password']),
            'role'          => $validated['role'],
            'role_id'       => Role::where('slug', $validated['role'])->value('id'),
            'branch_id'     => in_array($validated['role'] ?? null, ['pharmacist', 'cashier']) ? $validated['branch_id'] ?? null : null,
            'status'        => User::STATUS_APPROVED,
            'gender'        => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'address'       => $validated['address'] ?? null,
        ];

        if (isset($validated['profile_photo']) && $request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        if ($validated['role'] === 'pharmacist') {
            $data['license_number'] = $validated['license_number'] ?? null;
            $data['license_expiry_date'] = $validated['license_expiry_date'] ?? null;
            $data['professional_registration_number'] = $validated['professional_registration_number'] ?? null;
            $data['university'] = $validated['university'] ?? null;
            $data['degree'] = $validated['degree'] ?? null;
            $data['years_of_experience'] = $validated['years_of_experience'] ?? null;
            $data['national_id'] = $validated['national_id'] ?? null;
            $data['qualification'] = $validated['qualification'] ?? null;

            if ($request->hasFile('license_document')) {
                $data['license_document'] = $request->file('license_document')->store('documents', 'public');
            }
            if ($request->hasFile('qualification_document')) {
                $data['qualification_document'] = $request->file('qualification_document')->store('documents', 'public');
            }
            if ($request->hasFile('pharmacy_license')) {
                $data['pharmacy_license'] = $request->file('pharmacy_license')->store('documents', 'public');
            }
            if ($request->hasFile('degree_certificate')) {
                $data['degree_certificate'] = $request->file('degree_certificate')->store('documents', 'public');
            }
        }

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => $user,
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        $updateData = [
            'name'          => $validated['first_name'] . ' ' . $validated['last_name'],
            'first_name'    => $validated['first_name'],
            'last_name'     => $validated['last_name'],
            'email'         => $validated['email'],
            'phone_number'  => $validated['phone_number'] ?? null,
            'role'          => $validated['role'],
            'role_id'       => Role::where('slug', $validated['role'])->value('id'),
            'branch_id'     => in_array($validated['role'] ?? null, ['pharmacist', 'cashier']) ? $validated['branch_id'] ?? null : null,
            'gender'        => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'address'       => $validated['address'] ?? null,
        ];

        if (isset($validated['status'])) {
            $updateData['status'] = $validated['status'];
        }

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('profile_photo')) {
            $updateData['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update($updateData);

        if ($validated['role'] === 'pharmacist') {
            $user->update([
                'license_number'                 => $validated['license_number'] ?? null,
                'license_expiry_date'            => $validated['license_expiry_date'] ?? null,
                'professional_registration_number' => $validated['professional_registration_number'] ?? null,
                'university'                     => $validated['university'] ?? null,
                'degree'                         => $validated['degree'] ?? null,
                'years_of_experience'            => $validated['years_of_experience'] ?? null,
                'national_id'                    => $validated['national_id'] ?? null,
                'qualification'                  => $validated['qualification'] ?? null,
            ]);

            if ($request->hasFile('license_document')) {
                $user->update(['license_document' => $request->file('license_document')->store('documents', 'public')]);
            }
            if ($request->hasFile('qualification_document')) {
                $user->update(['qualification_document' => $request->file('qualification_document')->store('documents', 'public')]);
            }
            if ($request->hasFile('pharmacy_license')) {
                $user->update(['pharmacy_license' => $request->file('pharmacy_license')->store('documents', 'public')]);
            }
            if ($request->hasFile('degree_certificate')) {
                $user->update(['degree_certificate' => $request->file('degree_certificate')->store('documents', 'public')]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data'    => $user,
        ]);
    }

    public function approve(Request $request, User $user)
    {
        $user->update([
            'status'      => User::STATUS_APPROVED,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'User approved successfully. They can now log in.',
            'user'    => $user,
        ]);
    }

    public function reject(Request $request, User $user)
    {
        if (isset($request->reason) && !is_string($request->reason)) {
            return response()->json(['message' => 'Invalid reason format.'], 422);
        }

        $user->update([
            'status'           => User::STATUS_REJECTED,
            'rejection_reason' => $request->input('reason'),
        ]);

        try {
            if (method_exists($user, 'notify')) {
                // Notification logic would go here
            }
        } catch (\Throwable $e) {
            // don't block the request on notification failures
        }

        return response()->json([
            'message' => 'User rejected successfully.',
            'user'    => $user,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
