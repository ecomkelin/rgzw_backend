/**
 * TimeBlock 校验 + 展开工具
 *
 * 与 src/models/__global/TimeBlock.schema.js 配对使用, 是排课规则展开和冲突检测的核心.
 */

/**
 * 校验一条 TimeBlock 是否合法
 * @param {Object} tb
 * @returns {boolean}
 */
const validateTimeBlock = (tb) => {
    if (!tb || typeof tb !== 'object') return false;

    const hasDow  = typeof tb.dayOfWeek === 'number' && tb.dayOfWeek >= 0 && tb.dayOfWeek <= 6;
    const hasDate = typeof tb.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tb.date);
    const hasRange = tb.dateRange
        && typeof tb.dateRange.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tb.dateRange.from)
        && typeof tb.dateRange.to   === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tb.dateRange.to)
        && tb.dateRange.from <= tb.dateRange.to;

    if (!hasDow && !hasDate && !hasRange) return false;

    if (typeof tb.startTime !== 'string' || !/^\d{2}:\d{2}$/.test(tb.startTime)) return false;
    if (typeof tb.endTime   !== 'string' || !/^\d{2}:\d{2}$/.test(tb.endTime))   return false;
    if (tb.startTime >= tb.endTime) return false;   // '20:00' > '18:30', 字符串字典序即可

    return true;
};

/**
 * 把字符串 'YYYY-MM-DD' 转成 Date (UTC 00:00)
 */
const parseDateStr = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};

/**
 * 把 Date 转成 'YYYY-MM-DD' (UTC)
 */
const formatDateStr = (d) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/**
 * 把 TimeBlock 数组按时间范围展开成 [{date, startTime, endTime}] 列表
 * 只生成落在 [rangeFrom, rangeTo] (含两端) 内的具体日期.
 *
 * @param {Array<Object>} blocks        TimeBlock 数组
 * @param {Date}          rangeFrom
 * @param {Date}          rangeTo
 * @returns {Array<{date: string, startTime: string, endTime: string}>}
 */
const expandTimeBlocksToDates = (blocks, rangeFrom, rangeTo) => {
    if (!Array.isArray(blocks)) return [];
    const from = new Date(rangeFrom);
    const to   = new Date(rangeTo);
    if (isNaN(from) || isNaN(to) || from > to) return [];

    const out = [];
    for (const tb of blocks) {
        if (!validateTimeBlock(tb)) continue;

        if (typeof tb.dayOfWeek === 'number') {
            // 周循环: 从 from 走到 to, 命中 dayOfWeek 的全要
            for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
                if (d.getUTCDay() === tb.dayOfWeek) {
                    out.push({ date: formatDateStr(d), startTime: tb.startTime, endTime: tb.endTime });
                }
            }
        } else if (typeof tb.date === 'string') {
            const d = parseDateStr(tb.date);
            if (d >= from && d <= to) {
                out.push({ date: tb.date, startTime: tb.startTime, endTime: tb.endTime });
            }
        } else if (tb.dateRange) {
            const rFrom = parseDateStr(tb.dateRange.from);
            const rTo   = parseDateStr(tb.dateRange.to);
            const start = rFrom > from ? rFrom : from;
            const end   = rTo   < to   ? rTo   : to;
            for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
                out.push({ date: formatDateStr(d), startTime: tb.startTime, endTime: tb.endTime });
            }
        }
    }

    // 排序 + 去重 (同 date+startTime+endTime 视为重复)
    out.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    const dedup = [];
    for (const x of out) {
        const prev = dedup[dedup.length - 1];
        if (!prev || prev.date !== x.date || prev.startTime !== x.startTime || prev.endTime !== x.endTime) {
            dedup.push(x);
        }
    }
    return dedup;
};

/**
 * 判断两个时间窗是否重叠 (半开区间: [aStart, aEnd) 与 [bStart, bEnd))
 */
const overlaps = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd;
};

module.exports = {
    validateTimeBlock,
    expandTimeBlocksToDates,
    overlaps,
    parseDateStr,
    formatDateStr
};
