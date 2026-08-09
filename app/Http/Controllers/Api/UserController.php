<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of all users (admin only).
     */
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

    $status = $request->input('status', User::STATUS_APPROVED);
    if ($status !== 'all') {
        $query->where('status', $status);
    }

    $users = $query->orderBy('created_at', 'desc')->paginate(10);

    return response()->json($users);
}
    /**
     * User counts summary (admin only).
     */
    
    public function stats()
{
    return response()->json([
        'total' => User::where('status', User::STATUS_APPROVED)->count(),
        'pending' => User::where('status', User::STATUS_PENDING)->count(),
        'approved' => User::where('status', User::STATUS_APPROVED)->count(),
        'rejected' => User::where('status', User::STATUS_REJECTED)->count(),
        'admins' => User::where('role', 'admin')->where('status', User::STATUS_APPROVED)->count(),
        'pharmacists' => User::where('role', 'pharmacist')->where('status', User::STATUS_APPROVED)->count(),
        'cashiers' => User::where('role', 'cashier')->where('status', User::STATUS_APPROVED)->count(),
    ]);
}

    /**
     * Store a newly created user (admin only).
     * Users created by an admin are approved immediately.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'phone_number'   => 'nullable|string|max:20',
            'password'       => 'required|confirmed|min:8',
            'role'           => 'required|in:admin,pharmacist,cashier',
            'gender'         => 'nullable|in:male,female,other',
            'date_of_birth'  => 'nullable|date',
            'address'        => 'nullable|string',
            'profile_photo'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'license_number'                => 'required_if:role,pharmacist|string|max:255',
            'license_expiry_date'           => 'required_if:role,pharmacist|date',
            'professional_registration_number' => 'required_if:role,pharmacist|string|max:255',
            'university'                    => 'required_if:role,pharmacist|string|max:255',
            'degree'                        => 'required_if:role,pharmacist|string|max:255',
            'years_of_experience'           => 'required_if:role,pharmacist|integer|min:0',
            'national_id'                   => 'required_if:role,pharmacist|string|max:255',
            'pharmacy_license'              => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'degree_certificate'            => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification'                 => 'required_if:role,pharmacist|string|max:255',
            'license_document'              => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification_document'        => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        $data = [
            'name'          => $request->first_name . ' ' . $request->last_name,
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'email'         => $request->email,
            'phone_number'  => $request->phone_number,
            'password'      => Hash::make($request->password),
            'role'          => $request->role,
            'status'        => User::STATUS_APPROVED,
            'gender'        => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'address'       => $request->address,
        ];

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        if ($request->role === 'pharmacist') {
            $data['license_number'] = $request->license_number;
            $data['license_expiry_date'] = $request->license_expiry_date;
            $data['professional_registration_number'] = $request->professional_registration_number;
            $data['university'] = $request->university;
            $data['degree'] = $request->degree;
            $data['years_of_experience'] = $request->years_of_experience;
            $data['national_id'] = $request->national_id;
            $data['qualification'] = $request->qualification;

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

        return response()->json($user, 201);
    }

    /**
     * Update an existing user (admin only).
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'first_name'    => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'email'         => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone_number'  => 'nullable|string|max:20',
            'password'      => 'nullable|confirmed|min:8',
            'role'          => 'required|in:admin,pharmacist,cashier',
            'status'        => 'nullable|in:pending,approved,rejected',
            'gender'        => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address'       => 'nullable|string',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'license_number'                => 'required_if:role,pharmacist|string|max:255',
            'license_expiry_date'           => 'required_if:role,pharmacist|date',
            'professional_registration_number' => 'required_if:role,pharmacist|string|max:255',
            'university'                    => 'required_if:role,pharmacist|string|max:255',
            'degree'                        => 'required_if:role,pharmacist|string|max:255',
            'years_of_experience'           => 'required_if:role,pharmacist|integer|min:0',
            'national_id'                   => 'required_if:role,pharmacist|string|max:255',
            'pharmacy_license'              => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'degree_certificate'            => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification'                 => 'required_if:role,pharmacist|string|max:255',
            'license_document'              => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'qualification_document'        => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        $user->update([
            'name'          => $request->first_name . ' ' . $request->last_name,
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'email'         => $request->email,
            'phone_number'  => $request->phone_number,
            'role'          => $request->role,
            'gender'        => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'address'       => $request->address,
        ]);

        if ($request->filled('status')) {
            $user->update(['status' => $request->status]);
        }

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        if ($request->hasFile('profile_photo')) {
            $user->update(['profile_photo' => $request->file('profile_photo')->store('profile-photos', 'public')]);
        }

        if ($request->role === 'pharmacist') {
            $user->update([
                'license_number' => $request->license_number,
                'license_expiry_date' => $request->license_expiry_date,
                'professional_registration_number' => $request->professional_registration_number,
                'university' => $request->university,
                'degree' => $request->degree,
                'years_of_experience' => $request->years_of_experience,
                'national_id' => $request->national_id,
                'qualification' => $request->qualification,
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

        return response()->json($user);
    }

    /**
     * Approve a pending user (admin only).
     */
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

    /**
     * Reject a pending user (admin only).
     */
    public function reject(Request $request, User $user)
    {
        $user->update([
            'status' => User::STATUS_REJECTED,
        ]);

        return response()->json([
            'message' => 'User rejected successfully.',
            'user'    => $user,
        ]);
    }

    /**
     * Remove a user (admin only).
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
