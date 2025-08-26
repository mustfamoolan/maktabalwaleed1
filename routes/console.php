<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Console\Commands\RecalculateProfits;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// تسجيل أمر إعادة حساب الأرباح
Artisan::command('profits:recalculate', [RecalculateProfits::class, 'handle'])
    ->purpose('إعادة حساب الأرباح لجميع الفواتير');
