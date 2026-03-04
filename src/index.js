// ✂️ --- كود تشخيصي مؤقت لـ ai-proxy-worker3 --- ✂️
export default {
    async fetch(request, env) {
        // 1. التحقق من كلمة السر
        if (request.headers.get('X-Secret-Key') !== env.SECRET_KEY) {
            return new Response('Error: Unauthorized. Secret key does not match.', { status: 401 });
        }
        // 2. التأكد أن الطلب هو POST
        if (request.method !== 'POST') {
            return new Response('Error: Method Not Allowed. Only POST is accepted.', { status: 405 });
        }
        // 3. التحقق من وجود ربط الخدمة
        if (!env.AI_WORKER) {
            return new Response('Error: Service binding "AI_WORKER" is not configured or found.', { status: 500 });
        }

        // 4. استدعاء الـ Worker الآخر مع معالجة الأخطاء
        try {
            const response = await env.AI_WORKER.fetch(request);
            // التحقق من أن استجابة "العقل" كانت ناجحة
            if (!response.ok) {
                const errorText = await response.text();
                return new Response(`Error from upstream worker (actual-ai-worker): ${errorText}`, { status: response.status });
            }
            const responseData = await response.json();
            return new Response(JSON.stringify(responseData), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            // إرجاع رسالة الخطأ الفعلية
            return new Response(`Error during fetch to AI_WORKER: ${e.message}`, { status: 500 });
        }
    },
};
