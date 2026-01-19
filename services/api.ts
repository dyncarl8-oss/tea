
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Whop Token if available
api.interceptors.request.use((config) => {
    // In the real app, Whop automatically injects token in Iframe
    // BUT we need to pass it if we are manually handling it or if we are verifying it
    // Actually, Whop Iframe passes it in 'x-whop-user-token' automatically? 
    // No, we get it from the URL parameters or we use the SDK client side?
    // According to docs, Whop Iframe passes token in headers? 
    // "Whop passes a JWT token in the x-whop-user-token header with every request made to your app"
    // This applies if the browser makes the request directly to Whop? 
    // No, if the APP is in an iframe, the PARENT window (Whop) doesn't automatically inject headers into AJAX requests made BY the iframe.
    // The iframe page receives the token via query param maybe? Or we use the Whop FE SDK?

    // Checking Whop Docs (recalled from search):
    // "If your Node.js/Express application is embedded within a Whop iframe, Whop passes a JWT token in the x-whop-user-token header with every request made to your app."
    // Wait, if it loads my page `index.html`, the INITIAL request has the header.
    // But subsequent AJAX requests initiated by React code won't have it unless I add it.

    // So I need to capture it.
    // Usually it's passed as a Query Parameter `b` or `token` or accessible via SDK.
    // Whop SDK for frontend has `WhopApp`? 

    // Let's assume we can get it from the `WhopSDK` or URL.
    // For now, I'll add a placeholder to retrieve it.
    const token = localStorage.getItem('whop_user_token');
    if (token) {
        config.headers['x-whop-user-token'] = token;
    }
    return config;
});

export default api;
