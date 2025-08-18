<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RepresentativeAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!session('representative_user')) {
            return redirect()->route('representatives.login.form');
        }

        // إضافة بيانات المندوب إلى المشاركة العامة
        \Inertia\Inertia::share('representative_user', session('representative_user'));

        return $next($request);
    }
}
