<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApiLoginRequest;
use App\Http\Requests\ApiRegisterRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(ApiLoginRequest $request)
    {
        $credentials = $request->only(['email', 'password']);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!$user->isApproved()) {
            $message = $user->isPending()
                ? 'Your account is pending approval. Please wait for admin approval.'
                : 'Your account has been rejected. Please contact an administrator.';

            return response()->json([
                'message' => $message,
                'status'  => $user->status,
            ], 403);
        }

        try {
            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Authentication succeeded but the session token could not be created.',
            ], 500);
        }

        return response()->json([
            'message'      => 'Login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'status'      => $user->status,
                'permissions' => $user->permissions,
            ],
        ]);
    }

    public function register(ApiRegisterRequest $request)
    {
        if ((!$request->filled('first_name') || !$request->filled('last_name')) && $request->filled('name')) {
            $parts = explode(' ', trim($request->input('name')), 2);
            $request->merge([
                'first_name' => $request->input('first_name') ?: ($parts[0] ?? $request->input('name')),
                'last_name'  => $request->input('last_name')  ?: ($parts[1] ?? $parts[0] ?? $request->input('name')),
            ]);
        }

        $status = (Auth::check() && Auth::user()?->role === 'admin') ? User::STATUS_APPROVED : 'pending';

        $role = Role::where('slug', $request->role)->first();

        $user = User::create([
            'name'       => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => $request->role,
            'role_id'    => $role?->id,
            'status'     => $status,
        ]);

        return response()->json([
            'message' => 'Registration successful. Please wait for admin approval.',
            'user'    => $user,
        ], 201);
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password does not match.',
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
