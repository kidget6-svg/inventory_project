@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-600 mt-1">Welcome, {{ auth()->user()->name }}!</p>

        @if(auth()->user()->role)
        <div class="mt-4 p-4 bg-gray-50 rounded-md">
            <p class="text-sm text-gray-700">
                <span class="font-medium">Your Role:</span>
                {{ auth()->user()->role->display_name }}
            </p>
            @if(auth()->user()->role->description)
            <p class="text-sm text-gray-600 mt-1">
                {{ auth()->user()->role->description }}
            </p>
            @endif
        </div>
        @else
        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p class="text-sm text-yellow-800">
                Your account does not have an assigned role. Please contact an administrator.
            </p>
        </div>
        @endif
    </div>
</div>
@endsection
