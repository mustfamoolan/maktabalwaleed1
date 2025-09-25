<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * عرض لوحة تحكم الإدارة
     */
    public function index()
    {
        return view('admin.dashboard');
    }
}
