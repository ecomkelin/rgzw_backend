/**
 * LLM 解析: 自然语言 → TimeBlock[] 列表
 *
 * 走 OpenAI 兼容协议, 不锁供应商. 默认指向 DeepSeek (国内可直连).
 * 切换厂商: 改 .env 里的 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL 三个变量, 零代码改动.
 *
 * 备选 (国内常用):
 *   - DeepSeek:    LLM_BASE_URL=https://api.deepseek.com/v1               LLM_MODEL=deepseek-chat
 *   - Moonshot:    LLM_BASE_URL=https://api.moonshot.cn/v1                LLM_MODEL=moonshot-v1-8k
 *   - 智谱 GLM:     LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4     LLM_MODEL=glm-4-flash
 *   - 通义千问:     LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1  LLM_MODEL=qwen-plus
 *   - 本地 vLLM:    LLM_BASE_URL=http://localhost:8000/v1                 LLM_MODEL=your-model-name
 */
const axios = require('axios');
const { validateTimeBlock } = require('@utils/timeBlock');

const buildSystemPrompt = (today) => `你是排课助手. 你的任务: 把用户输入的"不可用时段"自然语言, 解析成严格的 JSON 数组.

输出格式必须是单个 JSON 对象, 形如:
{"slots": [TimeBlock, TimeBlock, ...]}

TimeBlock 结构 (每条只填以下字段):
{
  "dayOfWeek": 0|1|2|3|4|5|6 | undefined,
  "date":      "YYYY-MM-DD" | undefined,
  "dateRange": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" } | undefined,
  "startTime": "HH:mm",
  "endTime":   "HH:mm",
  "reason":    "可选, 简短中文, 不超过 30 字"
}

三选一时间范围规则:
- 周一到周日的某一天: 用 dayOfWeek (0=周日, 1=周一, ..., 6=周六)
- 单日: 用 date "YYYY-MM-DD"
- 连续日期段: 用 dateRange {from, to}, 含两端

时间字符串必须是 24h 制 "HH:mm" (如 19:00, 不能写 7pm).

多时段拆分: "周一三五晚上 7-9 点不行" → 3 条 dayOfWeek=1/3/5 的规则.

相对日期: 今天是 ${today}; 出现"明天"/"下周三"/"国庆"等相对词, 基于今天推算成绝对 date.

只输出 JSON 对象, 绝不输出其他任何文字/解释.`;

const baseURL = () => process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1';
const model   = () => process.env.LLM_MODEL   || 'deepseek-chat';
const apiKey  = () => process.env.LLM_API_KEY;
const timeout = () => +(process.env.LLM_TIMEOUT_MS || 8000);

/**
 * @param {Object} input
 * @param {string} input.text         自然语言文本
 * @param {string} input.context      'student' | 'room' | 'teacher'
 * @param {string} [input.anchorDate] YYYY-MM-DD, 默认今天
 * @returns {Promise<{slots: Array, rawModelOutput?: string, error?: string, model?: string}>}
 */
const parseSlots = async ({ text, context, anchorDate }) => {
    if (!apiKey()) {
        return { slots: [], error: 'llm_not_configured', message: 'LLM_API_KEY 未配置' };
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
        return { slots: [], error: 'empty_text' };
    }
    const today = anchorDate || new Date().toISOString().slice(0, 10);
    const sysPrompt = buildSystemPrompt(today);

    const body = {
        model: model(),
        temperature: 0,
        messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: `角色: ${context}\n原始文本: """${text.trim()}"""\n请只输出 JSON 对象 {"slots":[...]}` }
        ]
    };

    // 优先用 json_object 模式 (OpenAI/DeepSeek/Moonshot 都支持), 兜底不带
    const useJsonMode = !/aliyun|baichuan|local-vllm/i.test(baseURL());
    if (useJsonMode) body.response_format = { type: 'json_object' };

    try {
        const resp = await axios.post(`${baseURL()}/chat/completions`, body, {
            headers: {
                Authorization: `Bearer ${apiKey()}`,
                'Content-Type': 'application/json'
            },
            timeout: timeout()
        });
        const content = resp.data?.choices?.[0]?.message?.content;
        if (!content) return { slots: [], error: 'llm_empty_response' };

        let parsed;
        try {
            // 兜底: 截取第一个 { 到最后一个 }
            const firstBrace = content.indexOf('{');
            const lastBrace  = content.lastIndexOf('}');
            const jsonStr = (firstBrace >= 0 && lastBrace > firstBrace)
                ? content.slice(firstBrace, lastBrace + 1)
                : content;
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            return { slots: [], error: 'llm_invalid_json', rawModelOutput: content };
        }

        const rawSlots = Array.isArray(parsed.slots) ? parsed.slots : [];
        const slots = rawSlots.filter(validateTimeBlock);
        return { slots, rawModelOutput: content, model: model() };
    } catch (e) {
        const msg = e?.response?.data?.error?.message || e?.message || String(e);
        return { slots: [], error: 'llm_unavailable', message: msg };
    }
};

module.exports = { parseSlots };
