<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        Log::info('=== LOGIN ATTEMPT ===');
        Log::info('Email received:', ['email' => $credentials['email'] ?? null]);
        Log::info('Password received:', ['password' => $credentials['password'] ?? null]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        Log::info('User found:', ['exists' => $user ? 'YES' : 'NO']);

        if (!$user) {
            Log::warning('User not found:', ['email' => $credentials['email']]);

            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        Log::info('User details:', [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);

        $passwordMatch = Hash::check($credentials['password'], $user->password);
        Log::info('Password check:', ['matches' => $passwordMatch ? 'YES' : 'NO']);

        if (!$passwordMatch) {
            Log::warning('Password mismatch for user:', ['email' => $credentials['email']]);

            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!$user->isApproved()) {
            $message = $user->isPending()
                ? 'Your account is pending approval. Please wait for admin approval.'
                : 'Your account has been rejected. Please contact an administrator.';

            Log::warning('User not approved:', [
                'email' => $credentials['email'],
                'status' => $user->status,
            ]);

            return response()->json([
                'message' => $message,
                'status' => $user->status,
            ], 403);
        }

        try {
            $token = $user->createToken('auth_token')->plainTextToken;
        } catch (\Throwable $e) {
            Log::error('Sanctum token creation failed during login.', [
                'email' => $credentials['email'],
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Authentication succeeded but the session token could not be created.',
            ], 500);
        }

        Log::info('Login SUCCESS:', ['email' => $credentials['email']]);

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'permissions' => $user->permissions,
            ],
            'role' => $user->role,
        ]);
    }

    public function register(Request $request)
    {
        if ((!$request->filled('first_name') || !$request->filled('last_name')) && $request->filled('name')) {
            $parts = explode(' ', trim($request->input('name')), 2);
            $request->merge([
                'first_name' => $request->input('first_name') ?: ($parts[0] ?? $request->input('name')),
                'last_name'  => $request->input('last_name')  ?: ($parts[1] ?? $parts[0] ?? $request->input('name')),
            ]);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => ['required', Rule::exists('roles', 'slug')],
        ]);

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
            'message' => $status === User::STATUS_APPROVED ? 'User created successfully.' : 'Registration successful. Please wait for admin approval.',
            'user'    => $user
        ], 201);
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