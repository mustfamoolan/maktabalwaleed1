import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowRightIcon, UserIcon, CurrencyDollarIcon, ChartBarIcon, CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Profile({ representative, products, currentTargets: initialTargets, multiProductPlans: initialMultiPlans, categoryPlans: initialCategoryPlans, supplierPlans: initialSupplierPlans }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);

    // Product search states
    const [productSearches, setProductSearches] = useState({}); // For each target
    const [searchResults, setSearchResults] = useState({}); // Search results for each target
    const [selectedProducts, setSelectedProducts] = useState({}); // Selected products for each target

    // New targets system states
    const [isAddingTarget, setIsAddingTarget] = useState(false);
    const [currentTargets, setCurrentTargets] = useState(Array.isArray(initialTargets) ? initialTargets : []);
    const [multiProductPlans, setMultiProductPlans] = useState(Array.isArray(initialMultiPlans) ? initialMultiPlans : []);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTarget, setNewTarget] = useState({
        product_id: '',
        quantity: '',
        target_date: '',
        required_percentage: '100',
        product: null
    });
    const [editSearchQueries, setEditSearchQueries] = useState({});
    const [editSearchResults, setEditSearchResults] = useState({});
    const [targetProcessing, setTargetProcessing] = useState(false); // For target saving

    // Multi-product plan states
    const [isAddingMultiPlan, setIsAddingMultiPlan] = useState(false);
    const [planType, setPlanType] = useState('selected'); // 'selected' or 'all'
    const [multiPlanData, setMultiPlanData] = useState({
        plan_name: '',
        quantity: '',
        target_date: '',
        required_percentage: '100',
        selected_products: [], // For multi-product plans
        apply_to_all: false // For all products
    });
    const [multiProductSearchQuery, setMultiProductSearchQuery] = useState('');
    const [multiProductSearchResults, setMultiProductSearchResults] = useState([]);
    const [multiPlanProcessing, setMultiPlanProcessing] = useState(false);

    // Category plans states
    const [categoryPlans, setCategoryPlans] = useState(Array.isArray(initialCategoryPlans) ? initialCategoryPlans : []);
    const [isAddingCategoryPlan, setIsAddingCategoryPlan] = useState(false);
    const [categoryPlanData, setCategoryPlanData] = useState({
        supplier_category_id: '',
        plan_name: '',
        target_quantity: '',
        required_percentage: '100',
        start_date: '',
        end_date: ''
    });
    const [supplierCategories, setSupplierCategories] = useState([]);
    const [categoryPlanProcessing, setCategoryPlanProcessing] = useState(false);

    // Supplier plans states
    const [supplierPlans, setSupplierPlans] = useState(Array.isArray(initialSupplierPlans) ? initialSupplierPlans : []);
    const [isAddingSupplierPlan, setIsAddingSupplierPlan] = useState(false);
    const [supplierPlanData, setSupplierPlanData] = useState({
        supplier_id: '',
        plan_name: '',
        target_quantity: '',
        required_percentage: '100',
        start_date: '',
        end_date: ''
    });
    const [suppliers, setSuppliers] = useState([]);
    const [supplierPlanProcessing, setSupplierPlanProcessing] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        base_salary: '',
        effective_date: '',
        is_active: true
    });

    const { data: planData, setData: setPlanData, post: postPlan, put: putPlan, processing: planProcessing, errors: planErrors, reset: resetPlan } = useForm({
        plan_name: '',
        start_date: '',
        end_date: '',
        notes: '',
        targets: [{ product_id: '', target_quantity: '', required_percentage: '' }]
    });

    const handleSalarySubmit = (e) => {
        e.preventDefault();
        if (editingSalary) {
            put(route('admin.representatives.update-salary', [representative.id, editingSalary.id]), {
                onSuccess: () => {
                    setShowSalaryModal(false);
                    setEditingSalary(null);
                    reset();
                }
            });
        } else {
            post(route('admin.representatives.store-salary', representative.id), {
                onSuccess: () => {
                    setShowSalaryModal(false);
                    reset();
                }
            });
        }
    };

    const handlePlanSubmit = (e) => {
        if (e) e.preventDefault();

        // التحقق من وجود أهداف
        if (!planData.targets || planData.targets.length === 0) {
            alert('يجب إضافة هدف واحد على الأقل');
            return;
        }

        // التحقق من اكتمال البيانات
        const incompleteTargets = planData.targets.some((target, index) =>
            !selectedProducts[index] || !target.target_quantity || !target.required_percentage
        );

        if (incompleteTargets) {
            alert('يرجى إكمال جميع بيانات الأهداف');
            return;
        }

        // إنشاء بيانات الخطة تلقائياً
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // شهر واحد من الآن

        const planDataToSubmit = {
            representative_id: representative.id,
            plan_name: `أهداف ${currentDate.toLocaleDateString('ar-SA')}`,
            start_date: currentDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            targets: Array.isArray(planData.targets) ? planData.targets.map((target, index) => ({
                product_id: selectedProducts[index].id,
                target_quantity: target.target_quantity,
                required_percentage: target.required_percentage
            })) : []
        };

        postPlan(route('admin.representatives.store-plan', representative.id), {
            data: planDataToSubmit,
            onSuccess: () => {
                // إعادة تعيين البيانات
                setPlanData('targets', []);
                setProductSearches({});
                setSearchResults({});
                setSelectedProducts({});
                alert('تم حفظ الأهداف بنجاح');
            },
            onError: (errors) => {
                console.error('خطأ في حفظ الأهداف:', errors);
                alert('حدث خطأ في حفظ الأهداف');
            }
        });
    };

    // New target system functions
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get('/admin/products/search', {
                params: { query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        }
    };

    const selectProduct = (product) => {
        setNewTarget(prev => ({
            ...prev,
            product_id: product.id,
            product: product // حفظ بيانات المنتج كاملة
        }));
        setSearchQuery(product.name_ar || product.name_en || product.name);
        setSearchResults([]);
    };

    const addTarget = async () => {
        console.log('=== ADD TARGET CALLED ===');
        console.log('newTarget:', newTarget);

        if (!newTarget.product_id || !newTarget.quantity || !newTarget.target_date) {
            console.log('Missing required fields:', {
                product_id: newTarget.product_id,
                quantity: newTarget.quantity,
                target_date: newTarget.target_date
            });
            alert('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }

        setTargetProcessing(true);

        try {
            // حفظ الهدف مباشرة في قاعدة البيانات
            const formattedTarget = {
                product_id: parseInt(newTarget.product_id),
                quantity: parseInt(newTarget.quantity),
                target_date: newTarget.target_date,
                required_percentage: parseInt(newTarget.required_percentage)
            };

            console.log('Saving target:', formattedTarget);

            const response = await axios.post(`/admin/representatives/${representative.id}/targets`, {
                targets: [formattedTarget]
            });

            console.log('Target saved successfully:', response.data);

            // إضافة الهدف إلى القائمة المحلية مع بيانات المنتج
            const newTargetWithProduct = {
                id: Date.now(), // Temporary ID
                product_id: newTarget.product_id,
                quantity: parseInt(newTarget.quantity),
                target_date: newTarget.target_date,
                required_percentage: parseInt(newTarget.required_percentage),
                achievement_percentage: 0,
                achieved_quantity: 0,
                is_achieved: false,
                product: newTarget.product // إضافة بيانات المنتج
            };

            setCurrentTargets(prev => [...prev, newTargetWithProduct]);

            // إعادة تعيين النموذج
            setNewTarget({ product_id: '', quantity: '', target_date: '', required_percentage: '100', product: null });
            setSearchQuery('');
            setSearchResults([]);
            setIsAddingTarget(false);

            alert('✅ تم حفظ الهدف بنجاح! سيتم تحديث الصفحة...');

            // إعادة تحميل الصفحة لجلب البيانات المحدثة من قاعدة البيانات
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error saving target:', error);
            alert('❌ حدث خطأ أثناء حفظ الهدف: ' + (error.response?.data?.message || error.message));
        } finally {
            setTargetProcessing(false);
        }
    };

    const removeTarget = (targetId) => {
        setCurrentTargets(prev => prev.filter(target => target.id !== targetId));
    };

    const updateTargetField = (targetId, field, value) => {
        setCurrentTargets(prev =>
            prev.map(target =>
                target.id === targetId || target === targetId
                    ? { ...target, [field]: value }
                    : target
            )
        );
    };

    const handleEditSearchChange = async (targetId, query) => {
        setEditSearchQueries(prev => ({ ...prev, [targetId]: query }));

        if (!query || query.length < 2) {
            setEditSearchResults(prev => ({ ...prev, [targetId]: [] }));
            return;
        }

        try {
            const response = await axios.get('/admin/products/search', {
                params: { query }
            });
            setEditSearchResults(prev => ({ ...prev, [targetId]: response.data }));
        } catch (error) {
            console.error('Error searching products:', error);
            setEditSearchResults(prev => ({ ...prev, [targetId]: [] }));
        }
    };

    const selectEditProduct = (targetId, product) => {
        updateTargetField(targetId, 'product_id', product.id);
        updateTargetField(targetId, 'product', product);
        setEditSearchQueries(prev => ({ ...prev, [targetId]: product.name_ar || product.name_en || product.name }));
        setEditSearchResults(prev => ({ ...prev, [targetId]: [] }));
    };

    const saveAllTargets = async () => {
        try {
            console.log('=== SAVE ALL TARGETS CALLED ===');
            console.log('Current targets:', currentTargets);
            console.log('Current targets length:', currentTargets.length);

            if (!Array.isArray(currentTargets) || currentTargets.length === 0) {
                alert('لا توجد أهداف للحفظ. يرجى إضافة هدف واحد على الأقل.');
                return;
            }

            // تنسيق البيانات للإرسال
            const formattedTargets = currentTargets.map(target => ({
                product_id: target.product_id,
                quantity: parseInt(target.quantity),
                target_date: target.target_date,
                required_percentage: parseFloat(target.required_percentage || 100)
            }));

            console.log('Formatted targets:', formattedTargets);
            console.log('Representative ID:', representative.id);
            console.log('Route URL:', route('admin.representatives.store-targets', representative.id));

            const response = await axios.post(route('admin.representatives.store-targets', representative.id), {
                targets: formattedTargets
            });

            console.log('Response:', response.data);

            if (response.data.success) {
                alert('تم حفظ جميع الأهداف بنجاح: ' + response.data.message);
                setEditMode(false);
                // إعادة تحميل الصفحة لعرض البيانات المحدثة
                window.location.reload();
            } else {
                alert('حدث خطأ: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error saving targets:', error);
            console.error('Error response:', error.response);
            if (error.response?.data?.errors) {
                // عرض أخطاء التحقق
                const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                alert('أخطاء في التحقق:\n' + errorMessages);
            } else {
                alert('حدث خطأ في حفظ الأهداف: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Multi-product plan functions
    const handleMultiProductSearch = async (e) => {
        const query = e.target.value;
        setMultiProductSearchQuery(query);

        if (!query || query.length < 2) {
            setMultiProductSearchResults([]);
            return;
        }

        try {
            const response = await axios.get('/admin/products/search', {
                params: { query }
            });
            setMultiProductSearchResults(response.data);
        } catch (error) {
            console.error('Error searching products:', error);
            setMultiProductSearchResults([]);
        }
    };

    const selectMultiProduct = (product) => {
        const isSelected = multiPlanData.selected_products.some(p => p.id === product.id);

        if (!isSelected) {
            // Add product
            setMultiPlanData(prev => ({
                ...prev,
                selected_products: [...prev.selected_products, product]
            }));
        }

        // Clear search
        setMultiProductSearchQuery('');
        setMultiProductSearchResults([]);
    };

    const removeMultiProduct = (productId) => {
        setMultiPlanData(prev => ({
            ...prev,
            selected_products: prev.selected_products.filter(p => p.id !== productId)
        }));
    };

    const resetMultiPlanForm = () => {
        setMultiPlanData({
            plan_name: '',
            quantity: '',
            target_date: '',
            required_percentage: '100',
            selected_products: [],
            apply_to_all: false
        });
        setMultiProductSearchQuery('');
        setMultiProductSearchResults([]);
        setPlanType('selected');
    };

    const submitMultiPlan = async () => {
        // Debug: Log current values
        console.log('Current multiPlanData:', multiPlanData);
        console.log('Plan type:', planType);

        // Validate required fields
        if (!multiPlanData.plan_name) {
            alert('يرجى إدخال اسم الخطة');
            return;
        }

        if (!multiPlanData.quantity) {
            alert('يرجى إدخال الكمية المطلوبة');
            return;
        }

        if (!multiPlanData.target_date) {
            alert('يرجى اختيار التاريخ المستهدف');
            return;
        }

        if (!multiPlanData.required_percentage) {
            alert('يرجى إدخال النسبة المطلوبة');
            return;
        }

        if (planType === 'selected' && multiPlanData.selected_products.length === 0) {
            alert('يرجى اختيار منتج واحد على الأقل');
            return;
        }

        // Validate data types
        if (isNaN(parseInt(multiPlanData.quantity)) || parseInt(multiPlanData.quantity) <= 0) {
            alert('يرجى إدخال كمية صحيحة');
            return;
        }

        if (isNaN(parseInt(multiPlanData.required_percentage)) || parseInt(multiPlanData.required_percentage) <= 0 || parseInt(multiPlanData.required_percentage) > 100) {
            alert('يرجى إدخال نسبة صحيحة بين 1 و 100');
            return;
        }

        setTargetProcessing(true);

        try {
            let productsToAdd = multiPlanData.selected_products;

            // If apply to all is selected, get all products
            if (planType === 'all') {
                console.log('Fetching all products...');
                const allProductsResponse = await axios.get('/admin/products/search', {
                    params: { all: true }
                });
                productsToAdd = allProductsResponse.data;
                console.log('Fetched products:', productsToAdd.length);

                if (productsToAdd.length === 0) {
                    alert('❌ لا توجد منتجات نشطة في النظام');
                    return;
                }
            }

            // Prepare multi-product plan data for new API
            const planData = {
                plan_name: multiPlanData.plan_name,
                total_target_quantity: parseInt(multiPlanData.quantity), // الكمية الإجمالية للخطة
                required_percentage: parseInt(multiPlanData.required_percentage),
                start_date: new Date().toISOString().split('T')[0],
                end_date: multiPlanData.target_date,
                product_ids: Array.isArray(productsToAdd) ? productsToAdd.map(product => product.id) : [],
                notes: `خطة ${planType === 'all' ? 'جميع المنتجات' : 'منتجات مختارة'} - ${Array.isArray(productsToAdd) ? productsToAdd.length : 0} منتج`
            };

            console.log('Creating multi-product plan:', planData);
            console.log('Product IDs:', planData.product_ids);

            if (planData.product_ids.length === 0) {
                alert('❌ لا توجد منتجات محددة للخطة');
                return;
            }

            // Use new multi-product plan API
            const response = await axios.post(`/admin/representatives/${representative.id}/multi-product-plans`, planData);

            if (response.data.success) {
                alert(`✅ تم إنشاء الخطة متعددة المنتجات بنجاح مع ${productsToAdd.length} منتج!`);

                // Update multi-product plans list
                setMultiProductPlans(prev => [response.data.plan, ...prev]);

                resetMultiPlanForm();
                setIsAddingMultiPlan(false);

                // Refresh page to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                alert('❌ حدث خطأ في إنشاء الخطة');
            }

        } catch (error) {
            console.error('Error saving multi-plan:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors || error.message;
            alert('❌ حدث خطأ أثناء حفظ الخطة: ' + (typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage));
        } finally {
            setTargetProcessing(false);
        }
    };

    // حساب معدل الإنجاز العام لجميع أنواع الخطط
    const calculateOverallAchievement = () => {
        let totalAchievement = 0;
        let totalPlans = 0;

        // 1. حساب إنجاز الأهداف الفردية
        if (Array.isArray(currentTargets) && currentTargets.length > 0) {
            const validTargets = currentTargets.filter(target => {
                const percentage = parseFloat(target?.achievement_percentage || 0);
                return target && !isNaN(percentage);
            });

            if (validTargets.length > 0) {
                const targetsAchievement = validTargets.reduce((sum, target) => {
                    return sum + parseFloat(target.achievement_percentage || 0);
                }, 0);
                totalAchievement += targetsAchievement;
                totalPlans += validTargets.length;
            }
        }

        // 2. حساب إنجاز الخطط متعددة المنتجات
        if (Array.isArray(multiProductPlans) && multiProductPlans.length > 0) {
            const validMultiPlans = multiProductPlans.filter(plan => {
                const percentage = parseFloat(plan?.completion_percentage || 0);
                return plan && !isNaN(percentage);
            });

            if (validMultiPlans.length > 0) {
                const multiPlansAchievement = validMultiPlans.reduce((sum, plan) => {
                    return sum + parseFloat(plan.completion_percentage || 0);
                }, 0);
                totalAchievement += multiPlansAchievement;
                totalPlans += validMultiPlans.length;
            }
        }

        // 3. حساب إنجاز خطط الأقسام
        if (Array.isArray(categoryPlans) && categoryPlans.length > 0) {
            const validCategoryPlans = categoryPlans.filter(plan => {
                const percentage = parseFloat(plan?.achievement_percentage || 0);
                return plan && !isNaN(percentage);
            });

            if (validCategoryPlans.length > 0) {
                const categoryPlansAchievement = validCategoryPlans.reduce((sum, plan) => {
                    return sum + parseFloat(plan.achievement_percentage || 0);
                }, 0);
                totalAchievement += categoryPlansAchievement;
                totalPlans += validCategoryPlans.length;
            }
        }

        // 4. حساب إنجاز خطط الموردين
        if (Array.isArray(supplierPlans) && supplierPlans.length > 0) {
            const validSupplierPlans = supplierPlans.filter(plan => {
                const percentage = parseFloat(plan?.achievement_percentage || 0);
                return plan && !isNaN(percentage);
            });

            if (validSupplierPlans.length > 0) {
                const supplierPlansAchievement = validSupplierPlans.reduce((sum, plan) => {
                    return sum + parseFloat(plan.achievement_percentage || 0);
                }, 0);
                totalAchievement += supplierPlansAchievement;
                totalPlans += validSupplierPlans.length;
            }
        }

        // حساب المتوسط النهائي
        if (totalPlans === 0) {
            return 0;
        }

        const result = Math.round(totalAchievement / totalPlans);
        return result;
    };

    // حساب إحصائيات مفصلة لكل نوع من الخطط
    const calculateDetailedStats = () => {
        const stats = {
            individualTargets: { total: 0, achieved: 0, inProgress: 0, expired: 0 },
            multiProductPlans: { total: 0, achieved: 0, inProgress: 0, expired: 0 },
            categoryPlans: { total: 0, achieved: 0, inProgress: 0, expired: 0 },
            supplierPlans: { total: 0, achieved: 0, inProgress: 0, expired: 0 }
        };

        // إحصائيات الأهداف الفردية
        if (Array.isArray(currentTargets)) {
            stats.individualTargets.total = currentTargets.length;
            currentTargets.forEach(target => {
                if (target.is_achieved) {
                    stats.individualTargets.achieved++;
                } else if (new Date(target.target_date) < new Date()) {
                    stats.individualTargets.expired++;
                } else {
                    stats.individualTargets.inProgress++;
                }
            });
        }

        // إحصائيات الخطط متعددة المنتجات
        if (Array.isArray(multiProductPlans)) {
            stats.multiProductPlans.total = multiProductPlans.length;
            multiProductPlans.forEach(plan => {
                if (plan.status === 'completed') {
                    stats.multiProductPlans.achieved++;
                } else if (plan.status === 'expired') {
                    stats.multiProductPlans.expired++;
                } else {
                    stats.multiProductPlans.inProgress++;
                }
            });
        }

        // إحصائيات خطط الأقسام
        if (Array.isArray(categoryPlans)) {
            stats.categoryPlans.total = categoryPlans.length;
            categoryPlans.forEach(plan => {
                if (plan.status === 'completed') {
                    stats.categoryPlans.achieved++;
                } else if (new Date(plan.end_date) < new Date()) {
                    stats.categoryPlans.expired++;
                } else {
                    stats.categoryPlans.inProgress++;
                }
            });
        }

        // إحصائيات خطط الموردين
        if (Array.isArray(supplierPlans)) {
            stats.supplierPlans.total = supplierPlans.length;
            supplierPlans.forEach(plan => {
                if (plan.status === 'completed') {
                    stats.supplierPlans.achieved++;
                } else if (new Date(plan.end_date) < new Date()) {
                    stats.supplierPlans.expired++;
                } else {
                    stats.supplierPlans.inProgress++;
                }
            });
        }

        return stats;
    };    const overallAchievement = calculateOverallAchievement();
    const achievementColor = overallAchievement >= 80 ? 'green' : overallAchievement >= 50 ? 'yellow' : 'red';
    const detailedStats = calculateDetailedStats();

    const currentSalary = representative.salaries?.find(s => s.is_active);
    const activePlans = representative.salary_plans?.filter(p => p.is_active) || [];
    const completedPlans = representative.salary_plans?.filter(p => !p.is_active) || [];

    // Category Plans Functions
    const loadSupplierCategories = async () => {
        try {
            const response = await axios.get('/admin/supplier-categories');
            setSupplierCategories(response.data.categories || response.data);
        } catch (error) {
            console.error('Error loading supplier categories:', error);
        }
    };

    const handleCategoryPlanSubmit = async () => {
        if (!categoryPlanData.supplier_category_id || !categoryPlanData.plan_name || !categoryPlanData.target_quantity || !categoryPlanData.start_date || !categoryPlanData.end_date) {
            alert('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }

        setCategoryPlanProcessing(true);

        try {
            const response = await axios.post(`/admin/representatives/${representative.id}/category-plans`, {
                supplier_category_id: parseInt(categoryPlanData.supplier_category_id),
                plan_name: categoryPlanData.plan_name,
                target_quantity: parseInt(categoryPlanData.target_quantity),
                required_percentage: parseInt(categoryPlanData.required_percentage),
                start_date: categoryPlanData.start_date,
                end_date: categoryPlanData.end_date
            });

            if (response.data.success) {
                alert('✅ تم إنشاء خطة القسم بنجاح!');
                setCategoryPlans(prev => [response.data.categoryPlan, ...prev]);
                setCategoryPlanData({
                    supplier_category_id: '',
                    plan_name: '',
                    target_quantity: '',
                    required_percentage: '100',
                    start_date: '',
                    end_date: ''
                });
                setIsAddingCategoryPlan(false);
            }
        } catch (error) {
            console.error('Error creating category plan:', error);
            alert('حدث خطأ في إنشاء خطة القسم');
        } finally {
            setCategoryPlanProcessing(false);
        }
    };

    // Supplier Plans Functions
    const loadSuppliers = async () => {
        try {
            const response = await axios.get('/admin/suppliers-list');
            setSuppliers(response.data.suppliers || response.data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const handleSupplierPlanSubmit = async () => {
        if (!supplierPlanData.supplier_id || !supplierPlanData.plan_name || !supplierPlanData.target_quantity || !supplierPlanData.start_date || !supplierPlanData.end_date) {
            alert('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }

        setSupplierPlanProcessing(true);

        try {
            const response = await axios.post(`/admin/representatives/${representative.id}/supplier-plans`, {
                supplier_id: parseInt(supplierPlanData.supplier_id),
                plan_name: supplierPlanData.plan_name,
                target_quantity: parseInt(supplierPlanData.target_quantity),
                required_percentage: parseInt(supplierPlanData.required_percentage),
                start_date: supplierPlanData.start_date,
                end_date: supplierPlanData.end_date
            });

            if (response.data.success) {
                alert('✅ تم إنشاء خطة المورد بنجاح!');
                setSupplierPlans(prev => [response.data.supplierPlan, ...prev]);
                setSupplierPlanData({
                    supplier_id: '',
                    plan_name: '',
                    target_quantity: '',
                    required_percentage: '100',
                    start_date: '',
                    end_date: ''
                });
                setIsAddingSupplierPlan(false);
            }
        } catch (error) {
            console.error('Error creating supplier plan:', error);
            alert('حدث خطأ في إنشاء خطة المورد');
        } finally {
            setSupplierPlanProcessing(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '';
    };

    return (
        <AdminLayout>
            <Head title={`ملف ${representative.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.representatives.index')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                    >
                        <ArrowRightIcon className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(representative.name)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{representative.name}</h1>
                            <p className="text-sm text-gray-600">{representative.phone}</p>
                        </div>
                    </div>
                    <div className="mr-auto">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            representative.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {representative.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                <CurrencyDollarIcon className="w-7 h-7" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">الراتب الحالي</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {currentSalary ? `${parseFloat(currentSalary.base_salary).toLocaleString()}` : '0'}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">دينار عراقي</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-xl ${
                                achievementColor === 'green' ? 'bg-green-100 text-green-600' :
                                achievementColor === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                achievementColor === 'red' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                <ChartBarIcon className="w-7 h-7" />
                            </div>
                            <div className="mr-4 flex-1">
                                <p className="text-sm font-medium text-gray-600">مستوى الإنجاز العام</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-bold text-gray-900">{overallAchievement}%</p>
                                    {currentTargets.length > 0 && (
                                        <div className="flex-1 max-w-24">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        achievementColor === 'green' ? 'bg-green-500' :
                                                        achievementColor === 'yellow' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(overallAchievement, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentTargets.length > 0
                                        ? `متوسط ${currentTargets.length} ${currentTargets.length === 1 ? 'هدف' : 'أهداف'} • ${currentTargets.filter(t => t.is_achieved).length} مُنجز`
                                        : 'لا توجد أهداف محددة'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                                <CalendarIcon className="w-7 h-7" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">إجمالي الخطط</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {detailedStats.individualTargets.total + detailedStats.multiProductPlans.total + detailedStats.categoryPlans.total + detailedStats.supplierPlans.total}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    {detailedStats.individualTargets.achieved + detailedStats.multiProductPlans.achieved + detailedStats.categoryPlans.achieved + detailedStats.supplierPlans.achieved} مُنجز |
                                    {detailedStats.individualTargets.inProgress + detailedStats.multiProductPlans.inProgress + detailedStats.categoryPlans.inProgress + detailedStats.supplierPlans.inProgress} قيد التنفيذ
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                                <CalendarIcon className="w-7 h-7" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">تاريخ الاستحقاق</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {currentSalary ? new Date(currentSalary.effective_date).toLocaleDateString('en-GB') : 'غير محدد'}
                                </p>
                                <p className="text-xs text-orange-600 mt-1">تاريخ السريان</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 space-x-reverse px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                نظرة عامة
                            </button>
                            <button
                                onClick={() => setActiveTab('salary')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'salary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                الراتب والبدلات
                            </button>
                            <button
                                onClick={() => setActiveTab('plans')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'plans'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                الخطط والأهداف
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Performance Summary Table */}
                                <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                    </svg>
                                                </div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    ملخص الأداء العام
                                                </h2>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                                {overallAchievement}% متوسط الإنجاز
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Progress Bar - Comprehensive Stats */}
                                        {(currentTargets.length > 0 || multiProductPlans.length > 0 || categoryPlans.length > 0 || supplierPlans.length > 0) && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-semibold text-gray-900">التقدم الإجمالي - جميع الخطط</h4>
                                                    <span className="text-sm text-gray-600">
                                                        إجمالي {detailedStats.individualTargets.total + detailedStats.multiProductPlans.total + detailedStats.categoryPlans.total + detailedStats.supplierPlans.total} خطة/هدف
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                                    <div
                                                        className={`h-4 rounded-full transition-all duration-500 ${
                                                            overallAchievement >= 80
                                                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                : overallAchievement >= 50
                                                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                                    : 'bg-gradient-to-r from-red-500 to-red-600'
                                                        }`}
                                                        style={{width: `${Math.min(overallAchievement, 100)}%`}}
                                                    ></div>
                                                </div>

                                                <div className="flex justify-between text-sm text-gray-600 mb-4">
                                                    <span>نسبة الإنجاز الإجمالية: {overallAchievement}%</span>
                                                    <span>متبقي: {Math.max(100 - overallAchievement, 0)}%</span>
                                                </div>

                                                {/* Detailed Breakdown */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {/* Individual Targets */}
                                                    {detailedStats.individualTargets.total > 0 && (
                                                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                                                            <div className="text-xs font-semibold text-blue-600 mb-1">أهداف فردية</div>
                                                            <div className="text-lg font-bold text-gray-900">{detailedStats.individualTargets.total}</div>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="text-green-600">✓ {detailedStats.individualTargets.achieved}</span> |
                                                                <span className="text-yellow-600"> ⏳ {detailedStats.individualTargets.inProgress}</span> |
                                                                <span className="text-red-600"> ⚠ {detailedStats.individualTargets.expired}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Multi-Product Plans */}
                                                    {detailedStats.multiProductPlans.total > 0 && (
                                                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                            <div className="text-xs font-semibold text-purple-600 mb-1">خطط متعددة</div>
                                                            <div className="text-lg font-bold text-gray-900">{detailedStats.multiProductPlans.total}</div>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="text-green-600">✓ {detailedStats.multiProductPlans.achieved}</span> |
                                                                <span className="text-yellow-600"> ⏳ {detailedStats.multiProductPlans.inProgress}</span> |
                                                                <span className="text-red-600"> ⚠ {detailedStats.multiProductPlans.expired}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Category Plans */}
                                                    {detailedStats.categoryPlans.total > 0 && (
                                                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                                                            <div className="text-xs font-semibold text-orange-600 mb-1">خطط الأقسام</div>
                                                            <div className="text-lg font-bold text-gray-900">{detailedStats.categoryPlans.total}</div>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="text-green-600">✓ {detailedStats.categoryPlans.achieved}</span> |
                                                                <span className="text-yellow-600"> ⏳ {detailedStats.categoryPlans.inProgress}</span> |
                                                                <span className="text-red-600"> ⚠ {detailedStats.categoryPlans.expired}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Supplier Plans */}
                                                    {detailedStats.supplierPlans.total > 0 && (
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <div className="text-xs font-semibold text-green-600 mb-1">خطط الموردين</div>
                                                            <div className="text-lg font-bold text-gray-900">{detailedStats.supplierPlans.total}</div>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="text-green-600">✓ {detailedStats.supplierPlans.achieved}</span> |
                                                                <span className="text-yellow-600"> ⏳ {detailedStats.supplierPlans.inProgress}</span> |
                                                                <span className="text-red-600"> ⚠ {detailedStats.supplierPlans.expired}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => {
                                                    setActiveTab('plans');
                                                    setIsAddingTarget(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                إضافة هدف جديد
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('plans');
                                                    setIsAddingMultiPlan(true);
                                                }}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                </svg>
                                                إضافة خطة متعددة
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('plans')}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                </svg>
                                                عرض جميع الأهداف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Salary Tab */}
                        {activeTab === 'salary' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">إدارة الراتب والبدلات</h2>
                                    <button
                                        onClick={() => setShowSalaryModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        إضافة راتب
                                    </button>
                                </div>

                                {/* Current Salary */}
                                {currentSalary ? (
                                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">الراتب الحالي النشط</h3>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">نشط</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-white rounded-lg">
                                                <p className="text-sm text-gray-600">المبلغ الأساسي</p>
                                                <p className="text-2xl font-bold text-gray-900">{parseFloat(currentSalary.base_salary).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">دينار عراقي</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg">
                                                <p className="text-sm text-gray-600">تاريخ الاستحقاق</p>
                                                <p className="text-2xl font-bold text-gray-900">{new Date(currentSalary.effective_date).toLocaleDateString('en-GB')}</p>
                                                <p className="text-xs text-gray-500">تاريخ السريان</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                            <button
                                                onClick={() => {
                                                    setEditingSalary(currentSalary);
                                                    setData({
                                                        base_salary: currentSalary.base_salary,
                                                        effective_date: currentSalary.effective_date,
                                                        is_active: currentSalary.is_active
                                                    });
                                                    setShowSalaryModal(true);
                                                }}
                                                className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg transition duration-200 flex items-center gap-1"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                تعديل الراتب
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-12 text-center">
                                        <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">لا يوجد راتب محدد لهذا المندوب</p>
                                        <button
                                            onClick={() => setShowSalaryModal(true)}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                        >
                                            تحديد راتب أساسي
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plans Tab */}
                        {activeTab === 'plans' && (
                            <div className="bg-white rounded-xl shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">خطط الأهداف</h3>
                                            <p className="text-sm text-gray-600 mt-1">إدارة خطط المبيعات والأهداف</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsAddingTarget(true)}
                                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                إضافة هدف فردي
                                            </button>
                                            <button
                                                onClick={() => setIsAddingMultiPlan(true)}
                                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                إضافة خطة متعددة المنتجات
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsAddingCategoryPlan(true);
                                                    loadSupplierCategories();
                                                }}
                                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                إضافة خطة حسب القسم
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsAddingSupplierPlan(true);
                                                    loadSuppliers();
                                                }}
                                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                                                </svg>
                                                إضافة خطة حسب المورد
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">

                                    {/* Add Target Form */}
                                    {isAddingTarget && (
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-lg font-semibold text-gray-900">🎯 إضافة هدف جديد</h4>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingTarget(false);
                                                        setNewTarget({
                                                            product_id: '',
                                                            quantity: '',
                                                            target_date: '',
                                                            required_percentage: '100',
                                                            product: null
                                                        });
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-sm"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                                {/* Product Search */}
                                                <div className="relative z-50">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">اختيار المنتج</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={handleSearchChange}
                                                            placeholder="ابحث عن منتج..."
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm"
                                                        />
                                                        {Array.isArray(searchResults) && searchResults.length > 0 && (
                                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl mt-2 z-[100] max-h-80 overflow-y-auto">
                                                                {searchResults.map((product) => (
                                                                    <div
                                                                        key={product.id}
                                                                        onClick={() => selectProduct(product)}
                                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                    >
                                                                        <div className="font-semibold text-gray-900">{product.name_ar || product.name_en || product.name}</div>
                                                                        <div className="text-sm text-gray-600 mt-1">الباركود: {product.barcode || 'غير محدد'}</div>
                                                                        <div className="text-sm text-blue-600">المورد: {product.supplier?.name_ar || product.supplier?.name_en || product.supplier?.name || 'غير محدد'}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quantity */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">الكمية المطلوبة</label>
                                                    <input
                                                        type="number"
                                                        value={newTarget.quantity}
                                                        onChange={(e) => setNewTarget(prev => ({ ...prev, quantity: e.target.value }))}
                                                        placeholder="أدخل الكمية"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                                    />
                                                </div>

                                                {/* Required Percentage */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">النسبة المطلوبة للإنجاز (%)</label>
                                                    <input
                                                        type="number"
                                                        value={newTarget.required_percentage}
                                                        onChange={(e) => setNewTarget(prev => ({ ...prev, required_percentage: e.target.value }))}
                                                        placeholder="100"
                                                        min="1"
                                                        max="100"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                                    />
                                                </div>

                                                {/* Target Date */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ المستهدف</label>
                                                    <input
                                                        type="date"
                                                        value={newTarget.target_date}
                                                        onChange={(e) => setNewTarget(prev => ({ ...prev, target_date: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-6">
                                                <button
                                                    onClick={addTarget}
                                                    disabled={!newTarget.product_id || !newTarget.quantity || !newTarget.target_date || !newTarget.required_percentage || targetProcessing}
                                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 font-medium shadow-sm flex items-center gap-2"
                                                >
                                                    {targetProcessing ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                                            </svg>
                                                            جاري الحفظ...
                                                        </>
                                                    ) : (
                                                        <>
                                                            ✅ إضافة وحفظ الهدف
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Multi-Product Plan Modal */}
                                    {isAddingMultiPlan && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
                                                <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">📊</span>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900">إضافة خطة متعددة المنتجات</h3>
                                                            <p className="text-sm text-gray-600">إنشاء خطة موحدة لعدة منتجات أو جميع المنتجات</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingMultiPlan(false);
                                                            resetMultiPlanForm();
                                                        }}
                                                        className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-sm"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Plan Type Selector */}
                                                <div className="mb-6">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">نوع الخطة</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div
                                                            onClick={() => setPlanType('selected')}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                                planType === 'selected'
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-4 h-4 rounded-full ${
                                                                    planType === 'selected' ? 'bg-green-500' : 'bg-gray-300'
                                                                }`}></div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">منتجات مختارة</h4>
                                                                    <p className="text-sm text-gray-600">اختيار منتجات محددة للخطة</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            onClick={() => setPlanType('all')}
                                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                                planType === 'all'
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-4 h-4 rounded-full ${
                                                                    planType === 'all' ? 'bg-green-500' : 'bg-gray-300'
                                                                }`}></div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">جميع المنتجات</h4>
                                                                    <p className="text-sm text-gray-600">تطبيق الخطة على كافة المنتجات</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Product Selection for 'selected' type */}
                                                {planType === 'selected' && (
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-3">اختيار المنتجات</label>

                                                        {/* Selected Products Display */}
                                                        {multiPlanData.selected_products.length > 0 && (
                                                            <div className="mb-4 bg-blue-50 rounded-lg p-4">
                                                                <h4 className="font-semibold text-blue-900 mb-3">المنتجات المختارة ({multiPlanData.selected_products.length})</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {multiPlanData.selected_products.map((product) => (
                                                                        <div key={product.id} className="bg-white rounded-lg p-3 border border-blue-200 flex items-center justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900">{product.name_ar || product.name_en || product.name}</div>
                                                                                <div className="text-sm text-gray-600">الباركود: {product.barcode || 'غير محدد'}</div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => removeMultiProduct(product.id)}
                                                                                className="text-red-500 hover:text-red-700 p-1"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Product Search */}
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={multiProductSearchQuery}
                                                                onChange={handleMultiProductSearch}
                                                                placeholder="ابحث عن منتج لإضافته..."
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 shadow-sm"
                                                            />
                                                            {Array.isArray(multiProductSearchResults) && multiProductSearchResults.length > 0 && (
                                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl mt-2 z-[100] max-h-60 overflow-y-auto">
                                                                    {multiProductSearchResults.map((product) => (
                                                                        <div
                                                                            key={product.id}
                                                                            onClick={() => selectMultiProduct(product)}
                                                                            className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                        >
                                                                            <div className="font-semibold text-gray-900">{product.name_ar || product.name_en || product.name}</div>
                                                                            <div className="text-sm text-gray-600 mt-1">الباركود: {product.barcode || 'غير محدد'}</div>
                                                                            <div className="text-sm text-green-600">المورد: {product.supplier?.name_ar || product.supplier?.name_en || product.supplier?.name || 'غير محدد'}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Plan Configuration */}
                                                {(planType === 'all' || (planType === 'selected' && multiPlanData.selected_products.length > 0)) && (
                                                    <div className="space-y-6 mb-6">
                                                        {/* Plan Name */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الخطة</label>
                                                            <input
                                                                type="text"
                                                                value={multiPlanData.plan_name}
                                                                onChange={(e) => setMultiPlanData(prev => ({ ...prev, plan_name: e.target.value }))}
                                                                placeholder="أدخل اسم الخطة"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                        {/* Quantity */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">الكمية المطلوبة لكل منتج</label>
                                                            <input
                                                                type="number"
                                                                value={multiPlanData.quantity}
                                                                onChange={(e) => setMultiPlanData(prev => ({ ...prev, quantity: e.target.value }))}
                                                                placeholder="أدخل الكمية"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                                                            />
                                                        </div>

                                                        {/* Required Percentage */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">النسبة المطلوبة للإنجاز (%)</label>
                                                            <input
                                                                type="number"
                                                                value={multiPlanData.required_percentage}
                                                                onChange={(e) => setMultiPlanData(prev => ({ ...prev, required_percentage: e.target.value }))}
                                                                placeholder="100"
                                                                min="1"
                                                                max="100"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                                                            />
                                                        </div>

                                                        {/* Target Date */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ المستهدف</label>
                                                            <input
                                                                type="date"
                                                                value={multiPlanData.target_date}
                                                                onChange={(e) => setMultiPlanData(prev => ({ ...prev, target_date: e.target.value }))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    </div>
                                                )}

                                                {/* Summary */}
                                                {(planType === 'all' || (planType === 'selected' && multiPlanData.selected_products.length > 0)) && (
                                                    <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                                                        <h4 className="font-semibold text-yellow-900 mb-2">ملخص الخطة</h4>
                                                        <div className="text-sm text-yellow-800">
                                                            <p>• اسم الخطة: {multiPlanData.plan_name || 'غير محدد'}</p>
                                                            <p>• نوع الخطة: {planType === 'all' ? 'جميع المنتجات' : `${multiPlanData.selected_products.length} منتج مختار`}</p>
                                                            <p>• الكمية لكل منتج: {multiPlanData.quantity || 'غير محددة'}</p>
                                                            <p>• النسبة المطلوبة: {multiPlanData.required_percentage || 'غير محددة'}%</p>
                                                            <p>• التاريخ المستهدف: {multiPlanData.target_date || 'غير محدد'}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingMultiPlan(false);
                                                            resetMultiPlanForm();
                                                        }}
                                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                                                    >
                                                        إلغاء
                                                    </button>
                                                    <button
                                                        onClick={submitMultiPlan}
                                                        disabled={
                                                            !multiPlanData.quantity ||
                                                            !multiPlanData.target_date ||
                                                            !multiPlanData.required_percentage ||
                                                            (planType === 'selected' && multiPlanData.selected_products.length === 0) ||
                                                            targetProcessing
                                                        }
                                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 font-medium shadow-sm flex items-center gap-2"
                                                    >
                                                        {targetProcessing ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                                                </svg>
                                                                جاري إنشاء الخطة...
                                                            </>
                                                        ) : (
                                                            <>
                                                                📊 إنشاء الخطة
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Targets Section */}
                                    <div className="space-y-6">
                                        {/* View/Edit Mode Toggle */}
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                    <span className="text-2xl">🎯</span>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">الأهداف الحالية</h4>
                                                        <p className="text-sm text-gray-600">{currentTargets.length} هدف مُحدد</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setEditMode(!editMode)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 font-medium ${
                                                            editMode
                                                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                    >
                                                        {editMode ? (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                إلغاء التعديل
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                تعديل الأهداف
                                                            </>
                                                        )}
                                                    </button>

                                                </div>
                                            </div>

                                            {/* Targets Table */}
                                            {currentTargets.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    المنتج
                                                                </th>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    الكمية المطلوبة
                                                                </th>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    النسبة المطلوبة
                                                                </th>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    التاريخ المستهدف
                                                                </th>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    الإنجاز
                                                                </th>
                                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    الحالة
                                                                </th>
                                                                {editMode && (
                                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        الإجراءات
                                                                    </th>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {Array.isArray(currentTargets) && currentTargets.map((target, index) => (
                                                                <tr key={target.id || index} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {editMode ? (
                                                                            <div className="relative z-40 min-w-48">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editSearchQueries[target.id || index] || target.product?.name_ar || target.product?.name_en || target.product?.name || ''}
                                                                                    onChange={(e) => handleEditSearchChange(target.id || index, e.target.value)}
                                                                                    placeholder="ابحث عن منتج..."
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                />
                                                                                {editSearchResults[target.id || index] && Array.isArray(editSearchResults[target.id || index]) && editSearchResults[target.id || index].length > 0 && (
                                                                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl mt-1 z-[60] max-h-60 overflow-y-auto">
                                                                                        {editSearchResults[target.id || index].map((product) => (
                                                                                            <div
                                                                                                key={product.id}
                                                                                                onClick={() => selectEditProduct(target.id || index, product)}
                                                                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                                            >
                                                                                                <div className="font-medium text-gray-900">{product.name_ar || product.name_en || product.name}</div>
                                                                                                <div className="text-sm text-gray-600">الباركود: {product.barcode || 'غير محدد'}</div>
                                                                                                <div className="text-sm text-blue-600">المورد: {product.supplier?.name_ar || product.supplier?.name_en || product.supplier?.name || 'غير محدد'}</div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center">
                                                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                                                    <span className="text-blue-600 font-semibold text-sm">📦</span>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-sm font-medium text-gray-900">
                                                                                        {target.product?.name_ar || target.product?.name_en || target.product?.name || 'منتج غير محدد'}
                                                                                    </div>
                                                                                    {target.product?.supplier && (
                                                                                        <div className="text-sm text-gray-500">
                                                                                            المورد: {target.product.supplier.name_ar || target.product.supplier.name_en || target.product.supplier.name}
                                                                                        </div>
                                                                                    )}
                                                                                    {target.product?.barcode && (
                                                                                        <div className="text-xs text-gray-400">
                                                                                            الباركود: {target.product.barcode}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {editMode ? (
                                                                            <input
                                                                                type="number"
                                                                                value={target.quantity}
                                                                                onChange={(e) => updateTargetField(target.id || index, 'quantity', e.target.value)}
                                                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                {target.quantity?.toLocaleString() || '0'} وحدة
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {editMode ? (
                                                                            <input
                                                                                type="number"
                                                                                value={target.required_percentage || '100'}
                                                                                onChange={(e) => updateTargetField(target.id || index, 'required_percentage', e.target.value)}
                                                                                min="1"
                                                                                max="100"
                                                                                className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-medium text-green-600">
                                                                                {target.required_percentage || '100'}%
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {editMode ? (
                                                                            <input
                                                                                type="date"
                                                                                value={target.target_date}
                                                                                onChange={(e) => updateTargetField(target.id || index, 'target_date', e.target.value)}
                                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm text-gray-900">
                                                                                {target.target_date ? new Date(target.target_date).toLocaleDateString('ar-IQ') : 'غير محدد'}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div className="flex-1 mr-4">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <span className="text-xs font-medium text-gray-700">{parseFloat(target.achievement_percentage || 0).toFixed(0)}%</span>
                                                                                </div>
                                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                    <div
                                                                                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                                                                        style={{width: `${Math.min(parseFloat(target.achievement_percentage || 0), 100)}%`}}
                                                                                    ></div>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    {target.achieved_quantity || 0} / {target.quantity?.toLocaleString() || '0'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                                            target.is_achieved
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : new Date(target.target_date) < new Date()
                                                                                    ? 'bg-red-100 text-red-800'
                                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                            {target.is_achieved
                                                                                ? 'مُحقق ✅'
                                                                                : new Date(target.target_date) < new Date()
                                                                                    ? 'منتهي ⚠️'
                                                                                    : 'قيد التنفيذ 🔄'}
                                                                        </span>
                                                                    </td>
                                                                    {editMode && (
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                            <button
                                                                                onClick={() => removeTarget(target.id || index)}
                                                                                className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                                </svg>
                                                                                حذف
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أهداف حالياً</h3>
                                                    <p className="text-gray-600">ابدأ بإضافة هدف جديد لبناء خطة مبيعاتك</p>
                                                </div>
                                            )}
                                        </div>
                                </div>
                            </div>
                        )}

                        {/* Multi-Product Plans Section */}
                        {activeTab === 'overview' && (
                            <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                </svg>
                                            </div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                الخطط متعددة المنتجات
                                            </h2>
                                        </div>
                                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                                            {multiProductPlans?.length || 0} خطة
                                        </span>
                                    </div>
                                </div>

                                {multiProductPlans && multiProductPlans.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        اسم الخطة
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        عدد المنتجات
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الكمية المستهدفة
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الكمية المحققة
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        نسبة الإنجاز
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الفترة الزمنية
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الحالة
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Array.isArray(multiProductPlans) && multiProductPlans.map((plan, index) => (
                                                    <tr key={plan.id || index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {plan.plan_name}
                                                                    </div>
                                                                    {plan.notes && (
                                                                        <div className="text-xs text-gray-400 max-w-xs truncate">
                                                                            {plan.notes}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {plan.plan_products?.length || 0} منتج
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {plan.total_target_quantity?.toLocaleString() || '0'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-green-600">
                                                                {plan.achieved_quantity?.toLocaleString() || '0'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-full max-w-[120px]">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-xs font-medium text-gray-700">
                                                                            {parseFloat(plan.achievement_percentage || 0).toFixed(1)}%
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {plan.required_percentage}% مطلوب
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                                parseFloat(plan.achievement_percentage || 0) >= parseFloat(plan.required_percentage || 100)
                                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                                    : parseFloat(plan.achievement_percentage || 0) >= 50
                                                                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                                                        : 'bg-gradient-to-r from-red-500 to-red-600'
                                                                            }`}
                                                                            style={{width: `${Math.min(parseFloat(plan.achievement_percentage || 0), 100)}%`}}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                <div>من: {plan.start_date ? new Date(plan.start_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                                <div>إلى: {plan.end_date ? new Date(plan.end_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                                plan.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : plan.status === 'completed'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : plan.status === 'paused'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {plan.status === 'active' ? 'نشط' :
                                                                 plan.status === 'completed' ? 'مكتمل' :
                                                                 plan.status === 'paused' ? 'متوقف' : 'ملغي'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Products Details - Expandable Section */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-700 mb-3">تفاصيل المنتجات في الخطط:</h5>
                                            <div className="space-y-3">
                                                {Array.isArray(multiProductPlans) && multiProductPlans.map((plan, planIndex) => (
                                                    <details key={plan.id || planIndex} className="group">
                                                        <summary className="cursor-pointer list-none">
                                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-purple-600 font-medium">{plan.plan_name}</span>
                                                                    <span className="text-xs text-gray-500">({plan.plan_products?.length || 0} منتج)</span>
                                                                </div>
                                                                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                                </svg>
                                                            </div>
                                                        </summary>
                                                        <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {Array.isArray(plan.plan_products) && plan.plan_products.map((planProduct, productIndex) => (
                                                                    <div key={productIndex} className="bg-gray-50 rounded-md p-3 border border-gray-100">
                                                                        <div className="text-sm font-medium text-gray-800 mb-1">
                                                                            {planProduct.product?.name_ar || planProduct.product?.name_en || planProduct.product?.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-600">
                                                                            محقق: {planProduct.achieved_quantity || 0} من إجمالي الخطة
                                                                        </div>
                                                                        {planProduct.product?.supplier && (
                                                                            <div className="text-xs text-purple-600 mt-1">
                                                                                المورد: {planProduct.product.supplier.name_ar || planProduct.product.supplier.name_en || planProduct.product.supplier.name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خطط متعددة المنتجات</h3>
                                        <p className="text-gray-500 mb-6">ابدأ بإضافة أول خطة متعددة المنتجات لتحقيق أهداف أكبر</p>
                                        <button
                                            onClick={() => setIsAddingMultiPlan(true)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                            إضافة أول خطة
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Category Plans Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">خطط الأقسام</h2>
                                    <p className="text-gray-500 mt-1">إدارة أهداف البيع حسب أقسام المنتجات</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {categoryPlans.length} خطة
                                </div>
                            </div>
                        </div>

                        {categoryPlans && categoryPlans.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الخطة</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهدف المطلوب</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقدم</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة الزمنية</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.isArray(categoryPlans) && categoryPlans.map((plan, index) => (
                                            <tr key={plan.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{plan.plan_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{plan.supplier_category?.name_ar || 'غير محدد'}</div>
                                                    <div className="text-xs text-gray-500">{plan.supplier_category?.name_en || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{plan.target_quantity}</div>
                                                    <div className="text-xs text-gray-500">{plan.required_percentage}% مطلوب</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full max-w-[120px]">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    {parseFloat(plan.achievement_percentage || 0).toFixed(1)}%
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {plan.achieved_quantity || 0}/{plan.target_quantity}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        parseFloat(plan.achievement_percentage || 0) >= parseFloat(plan.required_percentage || 100)
                                                                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                            : parseFloat(plan.achievement_percentage || 0) >= 50
                                                                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                                                : 'bg-gradient-to-r from-red-500 to-red-600'
                                                                    }`}
                                                                    style={{width: `${Math.min(parseFloat(plan.achievement_percentage || 0), 100)}%`}}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div>من: {plan.start_date ? new Date(plan.start_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                        <div>إلى: {plan.end_date ? new Date(plan.end_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        plan.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : plan.status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : plan.status === 'paused'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {plan.status === 'active' ? 'نشط' :
                                                         plan.status === 'completed' ? 'مكتمل' :
                                                         plan.status === 'paused' ? 'متوقف' : 'ملغي'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خطط أقسام</h3>
                                <p className="text-gray-500 mb-6">ابدأ بإضافة أول خطة حسب قسم المنتجات</p>
                                <button
                                    onClick={() => {
                                        setIsAddingCategoryPlan(true);
                                        loadSupplierCategories();
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    إضافة أول خطة قسم
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Supplier Plans Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">خطط الموردين</h2>
                                    <p className="text-gray-500 mt-1">إدارة أهداف البيع حسب الموردين المحددين</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {supplierPlans.length} خطة
                                </div>
                            </div>
                        </div>

                        {supplierPlans && supplierPlans.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الخطة</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المورد</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهدف المطلوب</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقدم</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة الزمنية</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.isArray(supplierPlans) && supplierPlans.map((plan, index) => (
                                            <tr key={plan.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{plan.plan_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{plan.supplier?.name_ar || 'غير محدد'}</div>
                                                    <div className="text-xs text-gray-500">{plan.supplier?.name_en || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{plan.target_quantity}</div>
                                                    <div className="text-xs text-gray-500">{plan.required_percentage}% مطلوب</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full max-w-[120px]">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    {parseFloat(plan.achievement_percentage || 0).toFixed(1)}%
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {plan.achieved_quantity || 0}/{plan.target_quantity}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        parseFloat(plan.achievement_percentage || 0) >= parseFloat(plan.required_percentage || 100)
                                                                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                            : parseFloat(plan.achievement_percentage || 0) >= 50
                                                                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                                                                : 'bg-gradient-to-r from-red-500 to-red-600'
                                                                    }`}
                                                                    style={{width: `${Math.min(parseFloat(plan.achievement_percentage || 0), 100)}%`}}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div>من: {plan.start_date ? new Date(plan.start_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                        <div>إلى: {plan.end_date ? new Date(plan.end_date).toLocaleDateString('ar-IQ') : 'غير محدد'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        plan.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : plan.status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : plan.status === 'paused'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {plan.status === 'active' ? 'نشط' :
                                                         plan.status === 'completed' ? 'مكتمل' :
                                                         plan.status === 'paused' ? 'متوقف' : 'ملغي'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خطط موردين</h3>
                                <p className="text-gray-500 mb-6">ابدأ بإضافة أول خطة حسب مورد محدد</p>
                                <button
                                    onClick={() => {
                                        setIsAddingSupplierPlan(true);
                                        loadSuppliers();
                                    }}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    إضافة أول خطة مورد
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Plan Modal */}
                {isAddingCategoryPlan && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة خطة حسب القسم</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                                        <select
                                            value={categoryPlanData.supplier_category_id}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, supplier_category_id: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        >
                                            <option value="">اختر القسم</option>
                                            {Array.isArray(supplierCategories) && supplierCategories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name_ar} - {category.name_en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخطة</label>
                                        <input
                                            type="text"
                                            value={categoryPlanData.plan_name}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, plan_name: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="أدخل اسم الخطة"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المطلوبة</label>
                                        <input
                                            type="number"
                                            value={categoryPlanData.target_quantity}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, target_quantity: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="أدخل الكمية"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">النسبة المطلوبة (%)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={categoryPlanData.required_percentage}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, required_percentage: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                                        <input
                                            type="date"
                                            value={categoryPlanData.start_date}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, start_date: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                                        <input
                                            type="date"
                                            value={categoryPlanData.end_date}
                                            onChange={(e) => setCategoryPlanData(prev => ({...prev, end_date: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={handleCategoryPlanSubmit}
                                        disabled={categoryPlanProcessing}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50"
                                    >
                                        {categoryPlanProcessing ? 'جاري الحفظ...' : 'حفظ الخطة'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingCategoryPlan(false);
                                            setCategoryPlanData({
                                                supplier_category_id: '',
                                                plan_name: '',
                                                target_quantity: '',
                                                required_percentage: '100',
                                                start_date: '',
                                                end_date: ''
                                            });
                                        }}
                                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Supplier Plan Modal */}
                {isAddingSupplierPlan && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة خطة حسب المورد</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                                        <select
                                            value={supplierPlanData.supplier_id}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, supplier_id: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        >
                                            <option value="">اختر المورد</option>
                                            {Array.isArray(suppliers) && suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.name_ar} - {supplier.name_en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخطة</label>
                                        <input
                                            type="text"
                                            value={supplierPlanData.plan_name}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, plan_name: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="أدخل اسم الخطة"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المطلوبة</label>
                                        <input
                                            type="number"
                                            value={supplierPlanData.target_quantity}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, target_quantity: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="أدخل الكمية"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">النسبة المطلوبة (%)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={supplierPlanData.required_percentage}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, required_percentage: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                                        <input
                                            type="date"
                                            value={supplierPlanData.start_date}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, start_date: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                                        <input
                                            type="date"
                                            value={supplierPlanData.end_date}
                                            onChange={(e) => setSupplierPlanData(prev => ({...prev, end_date: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={handleSupplierPlanSubmit}
                                        disabled={supplierPlanProcessing}
                                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                                    >
                                        {supplierPlanProcessing ? 'جاري الحفظ...' : 'حفظ الخطة'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingSupplierPlan(false);
                                            setSupplierPlanData({
                                                supplier_id: '',
                                                plan_name: '',
                                                target_quantity: '',
                                                required_percentage: '100',
                                                start_date: '',
                                                end_date: ''
                                            });
                                        }}
                                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Salary Modal */}
                {showSalaryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingSalary ? 'تعديل الراتب' : 'إضافة راتب جديد'}
                                </h3>
                                <form onSubmit={handleSalarySubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الأساسي</label>
                                            <input
                                                type="number"
                                                value={data.base_salary}
                                                onChange={(e) => setData('base_salary', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="أدخل المبلغ"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
                                            <input
                                                type="date"
                                                value={data.effective_date}
                                                onChange={(e) => setData('effective_date', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                        >
                                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSalaryModal(false);
                                                setEditingSalary(null);
                                                reset();
                                            }}
                                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
