export async function pingIndexNow(urls) {
  const KEY = "4cf49eb7856845868190b84c8e9c52b9"; // API Key Bing Anda
  const HOST = "www.linkstart.id";
  
  // Pastikan urls selalu dalam bentuk Array
  const urlList = Array.isArray(urls) ? urls : [urls];
  
  // Menambahkan domain lengkap ke setiap URL jika belum ada
  const fullUrls = urlList.map(url => 
    url.startsWith('http') ? url : `https://${HOST}${url.startsWith('/') ? '' : '/'}${url}`
  );

  try {
    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: fullUrls
      })
    });

    if (response.ok) {
      console.log(`✅ IndexNow: ${fullUrls.length} URL berhasil di-ping ke Bing.`);
    } else {
      console.error('❌ IndexNow Error:', await response.text());
    }
  } catch (error) {
    console.error('⚠️ Gagal mengirim ping IndexNow:', error);
  }
}