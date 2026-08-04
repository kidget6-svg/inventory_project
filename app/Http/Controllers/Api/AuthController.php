<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Log the login attempt
        Log::info('=== LOGIN ATTEMPT ===');
        Log::info('Email received:', ['email' => $request->email]);
        Log::info('Password received:', ['password' => $request->password]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        Log::info('User found:', ['exists' => $user ? 'YES' : 'NO']);

        if (!$user) {
            Log::warning('User not found:', ['email' => $request->email]);
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Log user details
        Log::info('User details:', [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);

        // Check password
        $passwordMatch = Hash::check($request->password, $user->password);
        Log::info('Password check:', ['matches' => $passwordMatch ? 'YES' : 'NO']);

        if (!$passwordMatch) {
            Log::warning('Password mismatch for user:', ['email' => $request->email]);
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Check if user is approved
        if (!$user->isApproved()) {
            $message = $user->isPending() 
                ? 'Your account is pending approval. Please wait for admin approval.' 
                : 'Your account has been rejected. Please contact an administrator.';
            
            Log::warning('User not approved:', [
                'email' => $request->email,
                'status' => $user->status
            ]);
            
            return response()->json([
                'message' => $message,
                'status' => $user->status
            ], 403);
        }

        // Create Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Login SUCCESS:', ['email' => $request->email]);

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
            ],
            'role' => $user->role,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:pharmacist,cashier',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Registration successful. Please wait for admin approval.',
            'user' => $user
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