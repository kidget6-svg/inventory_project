<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Pharmacy') }} - @yield('title', 'Dashboard')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 font-sans antialiased">
    <div class="min-h-screen flex flex-col">
        <!-- Navigation -->
        @auth
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <a href="{{ route('dashboard') }}" class="text-xl font-semibold text-gray-900">
                                {{ config('app.name', 'Pharmacy') }}
                            </a>
                        </div>
                        <div class="hidden space-x-8 sm:ml-10 sm:flex sm:items-center sm:mt-1">
                            <a href="{{ route('dashboard') }}"
                                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Dashboard
                            </a>
                            @if(auth()->check() && auth()->user()->isAdmin())
                            <a href="{{ route('users.index') }}"
                                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Users
                            </a>
                            @endif
                            <a href="{{ route('profile.show') }}"
                                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Profile
                            </a>
                        </div>
                    </div>
                    <div class="hidden sm:ml-6 sm:flex sm:items-center">
                        <div class="ml-3 relative">
                            <div class="flex items-center space-x-3">
                                <span class="text-sm text-gray-700">
                                    {{ auth()->user()->name }}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        @if(auth()->user()->isAdmin()) bg-purple-100 text-purple-800
                                        @elseif(auth()->user()->isPharmacist()) bg-blue-100 text-blue-800
                                        @elseif(auth()->user()->isCashier()) bg-green-100 text-green-800
                                        @else bg-gray-100 text-gray-800
                                        @endif">
                                        {{ auth()->user()->role->display_name ?? 'No Role' }}
                                    </span>
                                </span>
                                <form method="POST" action="{{ route('logout') }}" class="inline">
                                    @csrf
                                    <button type="submit"
                                        class="text-sm text-gray-500 hover:text-gray-700">
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        @endauth

        <!-- Flash Messages -->
        <div class="max-w-7xl mx-auto w-full">
            @if (session('success'))
            <div class="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md mx-4 mt-4">
                {{ session('success') }}
            </div>
            @endif
            @if (session('error'))
            <div class="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md mx-4 mt-4">
                {{ session('error') }}
            </div>
            @endif
            @if ($errors->any())
            <div class="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md mx-4 mt-4">
                <ul class="list-disc list-inside">
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>

        <!-- Page Content -->
        <main class="flex-grow">
            @yield('content')
        </main>
    </div>
    @stack('scripts')
</body>
</html>
