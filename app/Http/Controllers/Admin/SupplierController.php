<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = Supplier::with(['category', 'categories'])
            ->orderBy('created_at', 'desc')
            ->get();

        // إضافة خاصية all_categories لكل مورد
        $suppliers->transform(function ($supplier) {
            $allCategories = collect();

            // إضافة الفئة الأساسية
            if ($supplier->category) {
                $allCategories->push($supplier->category);
            }

            // إضافة الفئات الإضافية
            foreach ($supplier->categories as $category) {
                // تجنب إضافة الفئة الأساسية مرة أخرى
                if (!$allCategories->contains('id', $category->id)) {
                    $allCategories->push($category);
                }
            }

            // إنشاء خاصية جديدة بدلاً من استبدال categories
            $supplier->all_categories = $allCategories;

            // Debug: تسجيل البيانات
            \Log::info("مورد {$supplier->name_ar}:", [
                'category_id' => $supplier->category_id,
                'main_category' => $supplier->category ? $supplier->category->name_ar : 'لا توجد',
                'additional_categories' => $supplier->categories->pluck('name_ar')->toArray(),
                'all_categories' => $allCategories->pluck('name_ar')->toArray()
            ]);

            return $supplier;
        });

        $categories = SupplierCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debug: تسجيل البيانات الواردة
        \Log::info('بيانات المورد الجديد:', $request->all());

        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:200|min:2',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:supplier_categories,id',
            'is_active' => 'boolean'
        ], [
            'company_name.required' => 'اسم الشركة مطلوب',
            'company_name.min' => 'اسم الشركة يجب أن يكون على الأقل حرفين',
            'company_name.max' => 'اسم الشركة لا يمكن أن يتجاوز 200 حرف',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'category_ids.*.exists' => 'فئة المورد المحددة غير موجودة'
        ]);

        if ($validator->fails()) {
            \Log::warning('أخطاء التحقق:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'يرجى تصحيح الأخطاء أدناه');
        }

        try {
            // إنشاء كود تلقائي للمورد
            $supplierCode = 'SUP' . str_pad(Supplier::count() + 1, 4, '0', STR_PAD_LEFT);

            // تحديد الفئة - إما الفئة الأولى المحددة أو فئة افتراضية
            $categoryId = null;
            if ($request->category_ids && is_array($request->category_ids) && count($request->category_ids) > 0) {
                $categoryId = $request->category_ids[0];
            } else {
                // اختيار الفئة الأولى كقيمة افتراضية
                $firstCategory = \App\Models\SupplierCategory::first();
                if ($firstCategory) {
                    $categoryId = $firstCategory->id;
                }
            }

            $supplierData = [
                'category_id' => $categoryId,
                'code' => $supplierCode,
                'name_ar' => trim($request->company_name),
                'contact_person' => $request->contact_person ? trim($request->contact_person) : null,
                'phone' => $request->phone ? trim($request->phone) : null,
                'email' => $request->email ? trim($request->email) : null,
                'address' => $request->address ? trim($request->address) : null,
                'notes' => $request->notes ? trim($request->notes) : null,
                'is_active' => $request->boolean('is_active', true)
            ];

            \Log::info('بيانات المورد للحفظ:', $supplierData);

            $supplier = Supplier::create($supplierData);

            \Log::info('تم إنشاء المورد:', ['id' => $supplier->id, 'name' => $supplier->name_ar]);

            // ربط الفئات الإضافية إذا تم تحديد أكثر من فئة
            if ($request->category_ids && is_array($request->category_ids)) {
                // فلترة الفئات لإزالة الفئة الأساسية إذا كانت موجودة
                $additionalCategories = collect($request->category_ids)
                    ->reject(function ($id) use ($categoryId) {
                        return $id == $categoryId;
                    })
                    ->values()
                    ->all();

                if (!empty($additionalCategories)) {
                    $supplier->categories()->attach($additionalCategories);
                    \Log::info('تم ربط الفئات الإضافية:', $additionalCategories);
                }
            }

            return redirect()->back()
                ->with('success', 'تم إضافة المورد "' . $supplier->name_ar . '" بنجاح');

        } catch (\Exception $e) {
            \Log::error('خطأ في إضافة المورد: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);

            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء إضافة المورد: ' . $e->getMessage())
                ->withInput();
        }
    }    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        $supplier->load(['categories', 'products.category']);

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:200|min:2',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:supplier_categories,id',
            'is_active' => 'boolean'
        ], [
            'company_name.required' => 'اسم الشركة مطلوب',
            'company_name.min' => 'اسم الشركة يجب أن يكون على الأقل حرفين',
            'company_name.max' => 'اسم الشركة لا يمكن أن يتجاوز 200 حرف',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'category_ids.*.exists' => 'فئة المورد المحددة غير موجودة'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // تحديد الفئة الأساسية (الأولى من القائمة أو الافتراضية)
            $categoryId = null;
            if ($request->category_ids && is_array($request->category_ids) && count($request->category_ids) > 0) {
                $categoryId = $request->category_ids[0];
            } else {
                // الاحتفاظ بالفئة الحالية أو اختيار افتراضية
                $categoryId = $supplier->category_id ?? \App\Models\SupplierCategory::first()?->id;
            }

            $supplier->update([
                'category_id' => $categoryId,
                'name_ar' => trim($request->company_name),
                'contact_person' => $request->contact_person ? trim($request->contact_person) : null,
                'phone' => $request->phone ? trim($request->phone) : null,
                'email' => $request->email ? trim($request->email) : null,
                'address' => $request->address ? trim($request->address) : null,
                'notes' => $request->notes ? trim($request->notes) : null,
                'is_active' => $request->boolean('is_active', true)
            ]);

            // تحديث الفئات الإضافية
            if ($request->category_ids && is_array($request->category_ids)) {
                // فلترة الفئات لإزالة الفئة الأساسية
                $additionalCategories = collect($request->category_ids)
                    ->reject(function ($id) use ($categoryId) {
                        return $id == $categoryId;
                    })
                    ->values()
                    ->all();

                $supplier->categories()->sync($additionalCategories);
            } else {
                $supplier->categories()->sync([]);
            }

            return redirect()->back()
                ->with('success', 'تم تحديث المورد "' . $supplier->name_ar . '" بنجاح');

        } catch (\Exception $e) {
            \Log::error('خطأ في تحديث المورد: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء تحديث المورد، يرجى المحاولة مرة أخرى')
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            // التحقق من وجود منتجات مرتبطة
            if ($supplier->products()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'لا يمكن حذف المورد لأنه مرتبط بمنتجات');
            }

            $supplier->categories()->detach(); // إزالة العلاقات مع الفئات
            $supplier->delete();

            return redirect()->back()
                ->with('success', 'تم حذف المورد بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء حذف المورد: ' . $e->getMessage());
        }
    }

    /**
     * Toggle supplier status
     */
    public function toggleStatus(Supplier $supplier)
    {
        try {
            $supplier->update([
                'is_active' => !$supplier->is_active
            ]);

            $status = $supplier->is_active ? 'تم تفعيل' : 'تم إلغاء تفعيل';

            return redirect()->back()
                ->with('success', $status . ' المورد بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء تغيير حالة المورد');
        }
    }
}
