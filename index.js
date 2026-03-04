export default {
    async fetch(request, env) {
        // 1. التحقق من كلمة السر
        const secretKey = request.headers.get('X-Secret-Key');
        if (secretKey !== env.SECRET_KEY) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. استخراج الطلب من نص الطلب
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }
        const { messages } = await request.json();
        if (!messages) {
            return new Response('Invalid request body', { status: 400 });
        }

        // 3. استدعاء Workers AI
        try {
            const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages });
            return new Response(JSON.stringify(response), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    },
};

