import React, { forwardRef } from 'react';

// ملف طباعة الفاتورة الموحد
// سيتم استخدامه في عدة صفحات ويمكن تمرير بيانات الفاتورة عبر props

const InvoicePrint = forwardRef(({ invoice }, ref) => {
    if (!invoice) return null;
    // حساب المجاميع
    const subtotal = invoice.items?.reduce((sum, item) => sum + (parseFloat(item.unit_sale_price || item.price || 0) * parseFloat(item.quantity || 1)), 0) || 0;
    const discount = parseFloat(invoice.discount_amount) || 0;
    const tax = 0; // يمكن تعديله لاحقاً
    const total = parseFloat(invoice.total_amount) || subtotal;
    const paid = parseFloat(invoice.paid_amount) || 0;
    const remaining = parseFloat(invoice.remaining_amount) || (total - paid);

    return (
        <div
            ref={ref}
            className="print-area"
            style={{
                fontFamily: 'Tahoma, Arial, sans-serif',
                background: '#fff',
                color: '#222',
                width: '160mm', // أصغر لضمان عدم تجاوز التذييل
                minHeight: '277mm',
                maxWidth: '160mm',
                margin: '10mm auto',
                direction: 'rtl',
                boxSizing: 'border-box',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* رأس الصفحة مع شعار الشركة */}
            <div style={{ padding: 0, margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '8px', padding: '0 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img src="/images/logo.png" alt="شعار الشركة" style={{ height: 48, width: 'auto', objectFit: 'contain', marginLeft: 12 }} />
                        <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 20, color: '#ff7a00', letterSpacing: 1 }}>GO</div>
                    </div>
                    <div style={{ textAlign: 'left', color: '#888', fontSize: 12 }}>
                        <div>{new Date().toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ marginTop: 8 }}>فاتورة مبيعات</div>
                    </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 32px 12px 32px' }} />
            </div>

            {/* بيانات الفاتورة */}
            <div style={{ padding: '0 32px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 18, color: '#888' }}>فاتورة مبيعات</div>
                    <div style={{ fontSize: 15, color: '#888' }}>رقم: <b>{invoice.sale_number || invoice.id}</b></div>
                    <div style={{ fontSize: 15, color: '#888' }}>تاريخ: {invoice.created_at?.split('T')[0]}</div>
                </div>
            </div>

            {/* بيانات العميل والدفع */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 32px', marginBottom: '12px', marginTop: '8px', fontSize: 16 }}>
                <div>
                    <div style={{ fontWeight: 'bold', color: '#ff7a00', fontSize: 18 }}>{invoice.customer_name || (invoice.customer && invoice.customer.name)}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>{invoice.customer_phone || (invoice.customer && invoice.customer.phone)}</div>
                    <div style={{ fontSize: 15 }}>العميل</div>
                </div>
                <div style={{ textAlign: 'left', fontSize: 15 }}>
                    <div>طريقة الدفع: {invoice.payment_status === 'paid' ? 'مدفوع' : invoice.payment_status === 'partial' ? 'مدفوع جزئي' : 'دين'}</div>
                    {invoice.due_date && <div>تاريخ الاستحقاق: {invoice.due_date}</div>}
                </div>
            </div>

            {/* جدول المنتجات */}
            <div style={{ padding: '0 32px', marginTop: '8px', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, marginTop: 0, minHeight: '120px' }}>
                    <thead>
                        <tr style={{ background: '#ff7a00', color: '#fff' }}>
                            <th style={{ border: '1px solid #eee', padding: 6 }}>#</th>
                            <th style={{ border: '1px solid #eee', padding: 6 }}>المنتج</th>
                            <th style={{ border: '1px solid #eee', padding: 6 }}>السعر</th>
                            <th style={{ border: '1px solid #eee', padding: 6 }}>الكمية</th>
                            <th style={{ border: '1px solid #eee', padding: 6 }}>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item, idx) => (
                                <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f7f7f7' }}>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{item.product ? (item.product.name_ar || item.product.name_en || item.product.name || item.name) : item.name}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{parseFloat(item.unit_sale_price || item.price || 0).toLocaleString()} د.ع</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{(parseFloat(item.unit_sale_price || item.price || 0) * parseFloat(item.quantity || 1)).toLocaleString()} د.ع</td>
                                </tr>
                            ))
                        ) : (
                            // إذا لم توجد منتجات، أضف صفوف فارغة لتعبئة الجدول
                            Array.from({ length: 7 }).map((_, idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f7f7f7' }}>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>&nbsp;</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>&nbsp;</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>&nbsp;</td>
                                    <td style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>&nbsp;</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ملخص */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 32px', marginTop: '8px' }}>
                <table style={{ minWidth: 260, fontSize: 15 }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: 4 }}>المجموع الفرعي:</td>
                            <td style={{ padding: 4, textAlign: 'left' }}>{subtotal.toLocaleString()} د.ع</td>
                        </tr>
                        {discount > 0 && (
                            <tr>
                                <td style={{ padding: 4 }}>الخصم:</td>
                                <td style={{ padding: 4, textAlign: 'left' }}>-{discount.toLocaleString()} د.ع</td>
                            </tr>
                        )}
                        {tax > 0 && (
                            <tr>
                                <td style={{ padding: 4 }}>الضريبة:</td>
                                <td style={{ padding: 4, textAlign: 'left' }}>{tax.toLocaleString()} د.ع</td>
                            </tr>
                        )}
                        <tr style={{ fontWeight: 'bold', color: '#ff7a00' }}>
                            <td style={{ padding: 4 }}>الإجمالي:</td>
                            <td style={{ padding: 4, textAlign: 'left' }}>{total.toLocaleString()} د.ع</td>
                        </tr>
                        <tr>
                            <td style={{ padding: 4 }}>المدفوع:</td>
                            <td style={{ padding: 4, textAlign: 'left' }}>{paid.toLocaleString()} د.ع</td>
                        </tr>
                        {remaining > 0 && (
                            <tr>
                                <td style={{ padding: 4 }}>المتبقي:</td>
                                <td style={{ padding: 4, textAlign: 'left', color: '#d32f2f' }}>{remaining.toLocaleString()} د.ع</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* شروط وتذييل */}
            <div style={{ padding: '0 32px', fontSize: 14, color: '#666', marginTop: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#ff7a00', marginBottom: 4 }}>الشروط والأحكام</div>
                <div style={{ marginBottom: 8 }}>هذه الفاتورة صالحة لمدة 7 أيام من تاريخ الإصدار. يرجى مراجعة البضاعة عند الاستلام.</div>
                <div>شكراً لتعاملكم معنا!</div>
            </div>

            {/* تذييل تواصل وتوقيع */}
            <div style={{ padding: '0 32px', fontSize: 14, color: '#888', marginTop: '24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                    <span style={{ marginBottom: 2 }}>xxx-xxx-xxxx</span>
                    <span style={{ marginBottom: 2 }}>info@company.com</span>
                    <span>www.company.com</span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 15, marginTop: 8, marginRight: 16, flexShrink: 0 }}>توقيع</div>
            </div>
        </div>
    );
});

export default InvoicePrint;
