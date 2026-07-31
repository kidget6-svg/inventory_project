<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $user = Auth::user();

        // Only approved users may log in
        if (!$user->isApproved()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => ['Your account is pending approval or has been rejected. Please contact an administrator.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json($user);
    }

    /**
     * Public self-registration.
     *
     * Only pharmacists and cashiers may self-register.
     * Admin accounts cannot be self-registered.
     * New accounts are created with a "pending" status and must be
     * approved by an admin before they can log in.
     * Pharmacists must provide license and qualification documents.
     */
    public function register(Request $request)
    {
        $request->validate([
            'first_name'               => 'required|string|max:255',
            'last_name'                => 'required|string|max:255',
            'email'                    => 'required|email|unique:users',
            'phone_number'             => 'nullable|string|max:20',
            'password'                 => 'required|confirmed|min:8',
            'role'                     => 'required|in:pharmacist,cashier',
            'gender'                   => 'nullable|in:male,female,other',
            'date_of_birth'            => 'nullable|date',
            'address'                  => 'nullable|string',
            'profile_photo'            => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
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
            'qualification_document'      => 'required_if:role,pharmacist|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        $data = [
            'name'     => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'    => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'status'   => User::STATUS_PENDING,
            'gender'   => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'address'  => $request->address,
        ];

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        // Pharmacists must provide license and qualification info
        if ($request->role === 'pharmacist') {
            $data['license_number'] = $request->license_number;
            $data['license_expiry_date'] = $request->license_expiry_date;
            $data['professional_registration_number'] = $request->professional_registration_number;
            $data['university'] = $request->university;
            $data['degree'] = $request->degree;
            $data['years_of_experience'] = $request->years_of_experience;
            $data['national_id'] = $request->national_id;
            $data['qualification']  = $request->qualification;

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

        // Do NOT auto-login the newly created user.
        // New users must wait for admin approval before they can log in.

        return response()->json($user, 201);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
