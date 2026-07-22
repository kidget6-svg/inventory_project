<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WelcomeController extends Controller
{
    /**
     * Show the welcome/landing page
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return view('welcome');
    }
}