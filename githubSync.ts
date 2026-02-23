// ملف مستقل للتعامل مع GitHub API
export const GITHUB_CONFIG = {
  token: import.meta.env.VITE_GITHUB_TOKEN, // سيسحب التوكن من Vercel أوتوماتيكياً
  owner: "youssefmd2244-droid",
  repo: "7iconcodestore",
  path: "constants.tsx"
};

export const updateStoreData = async (newData: any) => {
  try {
    const { token, owner, repo, path } = GITHUB_CONFIG;
    
    if (!token) throw new Error("التوكن مفقود من إعدادات Vercel");

    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(getUrl, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (!res.ok) throw new Error("Bad credentials - التوكن غير صالح");

    const fileData = await res.json();

    const content = `import { StoreData } from './types';\n\nexport const ADMIN_PASSWORD = "20042007";\nexport const WHATSAPP_NUM_1 = "201094555299";\nexport const WHATSAPP_NUM_2 = "201102293350";\n\nexport const INITIAL_DATA: StoreData = ${JSON.stringify(newData, null, 2)};`;

    const updateRes = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "تحديث من الملف المستقل",
        content: btoa(unescape(encodeURIComponent(content))),
        sha: fileData.sha,
      }),
    });

    return updateRes.ok;
  } catch (error: any) {
    console.error(error);
    alert("🛑 عطل في الربط: " + error.message);
    return false;
  }
};
