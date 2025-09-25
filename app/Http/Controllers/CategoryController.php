<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get list of categories for AJAX requests
     */
    public function list()
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return response()->json($categories);
    }
}
