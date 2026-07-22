<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Pharmacy') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 font-sans antialiased">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div class="mb-6">
                <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                    <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-14 0h2m14 0v-5a1 1 0 00-1-1H8a1 1 0 00-1 1v5" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mt-4">{{ config('app.name', 'Pharmacy') }}</h1>
                <p class="text-sm text-gray-600 mt-2">Pharmacy Inventory Management System</p>
            </div>

            @auth
            <a href="{{ route('dashboard') }}"
                class="inline-block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Dashboard
            </a>
            @else
            <a href="{{ route('login') }}"
                class="inline-block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign In
            </a>
            @endauth
        </div>
    </div>
</body>
</html>
