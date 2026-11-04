// api/og.js
// Dynamic Open Graph tag generator for FileHub
// এই ফাইলটি প্রতিটি ফাইল লিংকের জন্য আলাদা OG tags বানাবে

const FIREBASE_DB_URL = "https://file-5dd84-default-rtdb.firebaseio.com";

module.exports = async (req, res) => {
    const slug = req.query.slug || '';
    const bannerId = req.query.banner || '';
    const baseUrl = 'https://' + (req.headers.host || 'filehub.vercel.app');

    // Default values
    const DEFAULT_IMAGE = 'https://i.postimg.cc/VkCqsjD1/file-00000000fa18821191576f156d4e3bfe.png';
    const DEFAULT_TITLE = 'FileHub - Secure File Sharing';
    const DEFAULT_DESC = 'Download premium files securely from FileHub. Fast, safe, and 100% free.';

    let item = null;
    let type = 'file';
    let shareUrl = baseUrl;

    try {
        // ---- Firebase REST API থেকে ডেটা আনা ----
        if (slug) {
            const response = await fetch(`${FIREBASE_DB_URL}/files/${encodeURIComponent(slug)}.json`);
            if (response.ok) {
                item = await response.json();
                type = 'file';
                shareUrl = `${baseUrl}/file/${slug}`;
            }
        } else if (bannerId) {
            const response = await fetch(`${FIREBASE_DB_URL}/banners/${encodeURIComponent(bannerId)}.json`);
            if (response.ok) {
                item = await response.json();
                type = 'banner';
                shareUrl = `${baseUrl}/banner/${bannerId}`;
            }
        }

        // ---- Data Process ----
        let title = DEFAULT_TITLE;
        let description = DEFAULT_DESC;
        let image = DEFAULT_IMAGE;
        let fileExt = '';

        if (item) {
            title = cleanText(item.title) || DEFAULT_TITLE;
            description = cleanText(item.description || DEFAULT_DESC).substring(0, 160);
            image = item.thumbnail_url || DEFAULT_IMAGE;
            fileExt = (item.file_extension || '').toUpperCase();
        }

        // ---- HTML Response ----
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)} - FileHub</title>
    <meta name="title" content="${escapeHtml(title)} - FileHub">
    <meta name="description" content="${escapeHtml(description)}">
    
    <!-- Open Graph / Facebook / WhatsApp / Telegram -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(shareUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:site_name" content="FileHub">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(shareUrl)}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    
    <!-- LinkedIn -->
    <meta property="linkedin:title" content="${escapeHtml(title)}">
    <meta property="linkedin:description" content="${escapeHtml(description)}">
    <meta property="linkedin:image" content="${escapeHtml(image)}">
    
    <!-- Telegram specific -->
    <meta name="telegram:card" content="summary_large_image">
    <meta name="telegram:title" content="${escapeHtml(title)}">
    <meta name="telegram:description" content="${escapeHtml(description)}">
    <meta name="telegram:image" content="${escapeHtml(image)}">
    
    <!-- Item Properties (Pinterest, WhatsApp) -->
    <meta itemprop="name" content="${escapeHtml(title)}">
    <meta itemprop="description" content="${escapeHtml(description)}">
    <meta itemprop="image" content="${escapeHtml(image)}">
    
    <!-- WhatsApp specific -->
    <meta property="og:image:type" content="image/jpeg">
    <meta name="whatsapp:title" content="${escapeHtml(title)}">
    
    <!-- Canonical -->
    <link rel="canonical" href="${escapeHtml(shareUrl)}">
    
    <!-- Auto redirect to app after preview -->
    <meta http-equiv="refresh" content="0;url=/#/file/${escapeHtml(slug || bannerId)}">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            max-width: 500px;
            width: 100%;
            text-align: center;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 40px 30px;
            backdrop-filter: blur(20px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .thumb {
            width: 100%;
            max-width: 350px;
            border-radius: 16px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
            margin-bottom: 25px;
            border: 2px solid rgba(79, 70, 229, 0.5);
        }
        h1 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        .ext-badge {
            display: inline-block;
            background: #4f46e5;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        p {
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 0.95rem;
        }
        .btn {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            transition: all 0.3s;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(79, 70, 229, 0.6); }
        .logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 20px;
            border: 3px solid #4f46e5;
        }
        .loading-dots {
            display: inline-block;
            margin-top: 20px;
            color: #64748b;
            font-size: 0.85rem;
        }
        .loading-dots span {
            animation: blink 1.4s infinite both;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="card">
        <img src="https://i.postimg.cc/VkCqsjD1/file-00000000fa18821191576f156d4e3bfe.png" alt="FileHub" class="logo">
        ${fileExt ? `<div class="ext-badge">${escapeHtml(fileExt)}</div>` : ''}
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="thumb" 
             onerror="this.src='${DEFAULT_IMAGE}'">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <a href="${escapeHtml(shareUrl)}" class="btn">📥 Open in FileHub</a>
        <div class="loading-dots">
            Redirecting<span>.</span><span>.</span><span>.</span>
        </div>
    </div>
    <script>
        // Auto redirect for real browsers
        setTimeout(function() {
            window.location.href = '/#/file/${escapeHtml(slug || bannerId)}';
        }, 800);
    </script>
</body>
</html>`;

        // Cache for 1 hour
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.status(200).send(html);

    } catch (error) {
        console.error('OG Error:', error);
        // On error, fallback to home
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`<!DOCTYPE html>
<html><head>
<meta property="og:title" content="${DEFAULT_TITLE}">
<meta property="og:description" content="${DEFAULT_DESC}">
<meta property="og:image" content="${DEFAULT_IMAGE}">
<meta http-equiv="refresh" content="0;url=/">
</head><body><script>window.location.href='/';</script></body></html>`);
    }
};

// ============ Helper Functions ============

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cleanText(str) {
    if (!str) return '';
    return String(str)
        .replace(/[#*`_>\[\]()!]/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
