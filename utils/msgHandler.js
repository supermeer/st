const marked = require("marked");

// 配置 marked
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持 GitHub 风格 Markdown
  tables: true, // 支持表格
  smartLists: true, // 智能列表
  smartypants: true, // 智能标点
});

export const DEFAULT_CONFIG = {
  autoFixMarkdown: true,
  encodeTags: false,
  colors: {
    em: "rgb(145, 145, 145)",
    // quote: "rgb(225, 138, 36)",
    quote: "rgb(255, 255, 255)",
    underline: "rgb(188, 231, 207)",
  },
};

/**
 * 转义 HTML
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 计数
 */
export function countOccurrences(string, character) {
  let count = 0;
  for (let i = 0; i < string.length; i++) {
    if (string.substring(i, i + character.length) === character) {
      count++;
    }
  }
  return count;
}

/**
 * 判断奇数
 */
function isOdd(number) {
  return number % 2 !== 0;
}

/**
 * 修复 Markdown 格式
 */
export function fixMarkdown(text, forDisplay = true) {
  const format = /([*_]{1,2})([\s\S]*?)\1/gm;
  let matches = [];
  let match;

  while ((match = format.exec(text)) !== null) {
    matches.push(match);
  }

  let newText = text;
  for (let i = matches.length - 1; i >= 0; i--) {
    let matchText = matches[i][0];
    let replacementText = matchText.replace(
      /(\*|_)([\t \u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]+)|([\t \u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]+)(\*|_)/g,
      "$1$4"
    );
    newText =
      newText.slice(0, matches[i].index) +
      replacementText +
      newText.slice(matches[i].index + matchText.length);
  }

  if (!forDisplay) {
    return newText;
  }

  const splitText = newText.split("\n");
  for (let index = 0; index < splitText.length; index++) {
    const line = splitText[index];
    const charsToCheck = ["*", '"'];

    for (const char of charsToCheck) {
      if (line.includes(char) && isOdd(countOccurrences(line, char))) {
        splitText[index] = line.trimEnd() + char;
      }
    }
  }

  return splitText.join("\n");
}

/**
 * 处理引号
 * 使用 span.quote 而不是 <q> 标签，因为 rich-text 组件对 <q> 标签有特殊处理
 */
export function processQuotes(text) {
  const quoteRegex =
    /<style>[\s\S]*?<\/style>|```[\s\S]*?```|~~~[\s\S]*?~~~|``[\s\S]*?``|`[\s\S]*?`|(".*?")|(\u201C.*?\u201D)|(\u00AB.*?\u00BB)|(\u300C.*?\u300D)|(\u300E.*?\u300F)|(\uFF02.*?\uFF02)/gim;

  return text.replace(quoteRegex, function (match, p1, p2, p3, p4, p5, p6) {
    // 使用 span 标签并保留原始引号
    if (p1) return `<span class="quote">${p1}</span>`;
    else if (p2) return `<span class="quote">${p2}</span>`;
    else if (p3) return `<span class="quote">${p3}</span>`;
    else if (p4) return `<span class="quote">${p4}</span>`;
    else if (p5) return `<span class="quote">${p5}</span>`;
    else if (p6) return `<span class="quote">${p6}</span>`;
    else return match;
  });
}

/**
 * 处理小括号（转换为 <em> 标签）
 */
export function processParentheses(text) {
  // 正则表达式：匹配小括号，但排除代码块、HTML 标签、已有的 em/i 标签
  const parenRegex =
    /<style>[\s\S]*?<\/style>|```[\s\S]*?```|~~~[\s\S]*?~~~|``[\s\S]*?``|`[\s\S]*?`|<[^>]+>|(\([^)]+\))|（([^）]+)）/gim;

  return text.replace(parenRegex, function (match, p1, p2) {
    // p1 是英文小括号内容，p2 是中文小括号内容
    if (p1) {
      const content = p1.slice(1, -1); // 移除括号
      return `<em>(${content})</em>`;
    } else if (p2) {
      return `<em>（${p2}）</em>`;
    }
    // 如果是代码块或 HTML 标签，保持不变
    return match;
  });
}

/**
 * 为 HTML 元素添加内联样式（rich-text 不支持外部 class）
 */
function addInlineStyles(html, colors) {
  let result = html;

  // 1. 斜体/心理活动样式 <em> 和 <i>
  result = result.replace(
    /<(em|i)(\s[^>]*)?>(?![^<]*<\/span>)/gi,
    `<$1$2 style="color:${colors.em};font-style:italic;">`
  );

  // 2. 引号样式 <span class="quote">
  result = result.replace(
    /<span(\s[^>]*)?class="quote"([^>]*)?>|<span\s+class="quote">/gi,
    `<span class="quote" style="color:${colors.quote};">`
  );

  // 3. 引号中的斜体继承引号颜色
  result = result.replace(
    /<span class="quote"([^>]*)>([\s\S]*?)<\/span>/gi,
    function (match, spanAttrs, content) {
      // 移除引号内斜体的颜色样式，让它继承引号颜色
      const newContent = content.replace(
        /<(em|i)\s[^>]*style="[^"]*color:[^;"]*;?[^"]*"/gi,
        `<$1 style="font-style:italic;color:inherit;"`
      );
      return `<span class="quote"${spanAttrs}>${newContent}</span>`;
    }
  );

  // 4. 下划线样式 <u>
  result = result.replace(
    /<u(\s[^>]*)?>|<u>/gi,
    `<u$1 style="color:${colors.underline};text-decoration:underline;">`
  );

  // 5. 粗体样式 <strong> 和 <b>
  result = result.replace(
    /<(strong|b)(\s[^>]*)?>|<(strong|b)>/gi,
    '<$1$2 style="font-weight:bold;">'
  );

  // 6. 块引用样式 <blockquote>
  result = result.replace(
    /<blockquote(\s[^>]*)?>|<blockquote>/gi,
    `<blockquote$1 style="border-left:3px solid ${colors.quote};padding-left:10px;background-color:rgba(0,0,0,0.3);margin:0;">`
  );

  // 7. 标题样式
  result = result.replace(/<h1(\s[^>]*)?>|<h1>/gi, '<h1$1 style="font-size:1.8em;font-weight:bold;margin:0.67em 0;">');
  result = result.replace(/<h2(\s[^>]*)?>|<h2>/gi, '<h2$1 style="font-size:1.5em;font-weight:bold;margin:0.75em 0;">');
  result = result.replace(/<h3(\s[^>]*)?>|<h3>/gi, '<h3$1 style="font-size:1.3em;font-weight:bold;margin:0.83em 0;">');
  result = result.replace(/<h4(\s[^>]*)?>|<h4>/gi, '<h4$1 style="font-size:1.1em;font-weight:bold;margin:1em 0;">');

  // 8. 代码块样式
  result = result.replace(
    /<code(\s[^>]*)?>|<code>/gi,
    '<code$1 style="background-color:rgba(0,0,0,0.1);padding:2px 4px;border-radius:3px;font-family:Courier New,monospace;font-size:0.95em;">'
  );
  
  result = result.replace(
    /<pre(\s[^>]*)?>|<pre>/gi,
    '<pre$1 style="display:block;overflow-x:auto;padding:1em;background-color:rgba(0,0,0,0.05);border-radius:5px;">'
  );

  // 9. 删除线样式
  result = result.replace(
    /<(del|s|strike)(\s[^>]*)?>|<(del|s|strike)>/gi,
    '<$1$2 style="text-decoration:line-through;">'
  );

  // 10. 水平线样式
  result = result.replace(
    /<hr(\s[^>]*)?\/?>|<hr>/gi,
    `<hr$1 style="border:none;border-top:2px solid ${colors.quote};margin:15px 0;" />`
  );

  // 11. 链接样式
  result = result.replace(
    /<a(\s[^>]*)?>|<a>/gi,
    `<a$1 style="color:${colors.quote};text-decoration:underline;">`
  );

  // 12. 列表样式
  result = result.replace(
    /<(ul|ol)(\s[^>]*)?>|<(ul|ol)>/gi,
    '<$1$2 style="margin-left:20px;padding-left:10px;">'
  );
  
  result = result.replace(
    /<li(\s[^>]*)?>|<li>/gi,
    '<li$1 style="margin:5px 0;">'
  );

  // 13. 表格样式
  result = result.replace(
    /<table(\s[^>]*)?>|<table>/gi,
    '<table$1 style="border-collapse:collapse;width:100%;margin:10px 0;">'
  );
  
  result = result.replace(
    /<(th|td)(\s[^>]*)?>|<(th|td)>/gi,
    '<$1$2 style="border:1px solid #ddd;padding:8px;text-align:left;">'
  );
  
  result = result.replace(
    /<th(\s[^>]*style="[^"]*")?>|<th(\s[^>]*)?>|<th>/gi,
    function(match, withStyle, withoutStyle) {
      if (withStyle) {
        return match.replace('style="', 'style="background-color:rgba(0,0,0,0.05);font-weight:bold;');
      }
      return '<th' + (withoutStyle || '') + ' style="background-color:rgba(0,0,0,0.05);font-weight:bold;border:1px solid #ddd;padding:8px;text-align:left;">';
    }
  );

  // 14. 段落基础样式
  result = result.replace(
    /<p(\s[^>]*)?>|<p>/gi,
    '<p$1 style="margin:0.5em 0;line-height:1.6;">'
  );

  return result;
}

/**
 * 主格式化函数（结合 marked.js）
 */
export function formatMessage(text, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!text) return "";

  let mes = text;

  // 1. 自动修复 Markdown
  if (cfg.autoFixMarkdown) {
    mes = fixMarkdown(mes, true);
  }

  // 2. HTML 转义（可选）
  if (cfg.encodeTags) {
    mes = mes.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  // 3. 处理引号和小括号（在 Markdown 转换前）
  if (!cfg.encodeTags) {
    mes = mes.replace(/<([^>]+)>/g, function (_, contents) {
      return "<" + contents.replace(/"/g, "\ufffe") + ">";
    });
  }

  // 处理引号
  mes = processQuotes(mes);
  
  // 处理小括号（转为 <em> 标签）
  mes = processParentheses(mes);

  if (!cfg.encodeTags) {
    mes = mes.replace(/\ufffe/g, '"');
  }

  // 4. LaTeX 公式处理
  mes = mes.replaceAll("\\begin{align*}", "$$");
  mes = mes.replaceAll("\\end{align*}", "$$");

  // 5. 使用 marked.js 转换 Markdown
  try {
    mes = marked.parse(mes);
  } catch (error) {
    console.error("Marked.js 解析错误:", error);
  }

  // 6. 添加内联样式（rich-text 不支持外部 class）
  mes = addInlineStyles(mes, cfg.colors);

  // 7. 清理
  mes = mes.trim();

  return mes;
}