export default async function handler(req, res) {
  // 允许跨域请求（如果将来需要的话，虽然在同一个域名下部署不需要跨域）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 必须是 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从 Vercel 环境变量中读取真实的 DeepSeek API Key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "后端服务器未配置 DEEPSEEK_API_KEY" } });
  }

  const { messages, tools, tool_choice, temperature, model } = req.body;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // 真实的 API Key 只存在于 Vercel 服务器里！
      },
      body: JSON.stringify({
        model: model || "deepseek-chat",
        messages,
        tools,
        tool_choice,
        temperature
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
