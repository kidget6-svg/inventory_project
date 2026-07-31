@extends('mail::message')

@php
    $adminName = $notifiable->first_name
        ? $notifiable->first_name . ' ' . ($notifiable->last_name ?? '')
        : ($notifiable->name ?? 'Admin');
@endphp

# New User Registration Requires Your Approval

Hello {{ trim($adminName) }},

A new user has registered on the platform and requires your approval before they can log in.

**Name:** {{ $user->name }}
**Email:** {{ $user->email }}
**Role:** {{ ucfirst($user->role) }}

@php
    $url = config('app.url') . '/users';
@endphp

@component('mail::panel')
# New User Details

- **Name:** {{ $user->name }}
- **Email:** {{ $user->email }}
- **Role:** {{ ucfirst($user->role) }}
- **Registered:** {{ $user->created_at ? $user->created_at->format('M d, Y g:i A') : 'Just now' }}
@endcomponent

@component('mail::button', ['url' => $url])
Review Pending Users
@endcomponent

Thank you for using **PharmaSys**!

Regards,
The PharmaSys Team
