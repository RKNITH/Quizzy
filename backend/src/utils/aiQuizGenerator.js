


import axios from 'axios';

const model = process.env.MODEL_NAME

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ─── Robust JSON sanitiser ────────────────────────────────────────────────────
// Handles: unescaped inner quotes, raw newlines in strings, markdown fences,
// control characters, extra text before/after the array.
function sanitizeJSON(raw) {
  // Remove BOM and control characters
  let str = raw
    .replace(/\uFEFF/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // Strip markdown code fences
  str = str
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Extract only the outermost JSON array
  const s = str.indexOf('[');
  const e = str.lastIndexOf(']');
  if (s === -1 || e === -1 || e <= s) return null;
  str = str.slice(s, e + 1);

  // Walk char-by-char to fix unescaped quotes and raw newlines inside strings
  let out = '';
  let inStr = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];

    if (escaped) { out += c; escaped = false; continue; }
    if (c === '\\') { out += c; escaped = true; continue; }

    if (c === '"') {
      if (!inStr) {
        // Opening a JSON string
        inStr = true;
        out += c;
        continue;
      }

      // We are inside a string — determine if this " closes it or is internal.
      // Skip ahead past any whitespace to find the next real character.
      let j = i + 1;
      while (j < str.length && (str[j] === ' ' || str[j] === '\t')) j++;
      const next = str[j];

      // Structural characters that can follow a closing quote
      const isClosing =
        next === ':' || next === ',' || next === '}' ||
        next === ']' || next === undefined || j >= str.length;

      if (isClosing) {
        inStr = false;
        out += c;
      } else {
        // Internal unescaped double-quote — escape it
        out += '\\"';
      }
      continue;
    }

    // Inside a string: replace literal newlines/tabs/carriage returns with a space
    if (inStr && (c === '\n' || c === '\r' || c === '\t')) {
      out += ' ';
      continue;
    }

    out += c;
  }

  return out;
}

// ─── Build Gemini prompt ──────────────────────────────────────────────────────
function buildPrompt(topic, numQuestions, difficultyInstruction) {
  return `You are a JSON-only output generator. Your entire response must be a single valid JSON array — no markdown, no code fences, no text before or after.

Task: Create ${numQuestions} Hindi multiple-choice quiz questions about "${topic}".
Difficulty: ${difficultyInstruction}

STRICT JSON rules (violating these will break the app):
- Use ONLY double quotes for keys and values
- NEVER put a raw newline or tab inside any string value
- NEVER put an unescaped double-quote character inside a string value
- correctAnswer must be a plain integer 0, 1, 2, or 3

LaTeX rules for mathematical expressions:
- Wrap ALL math expressions in single dollar signs: $expression$
- Example: "समीकरण $x^2 - 5x + 6 = 0$ के मूल क्या हैं?"
- Example option: "$x = 2$ और $x = 3$"
- Use LaTeX syntax: $\\frac{a}{b}$  $\\sqrt{x}$  $x^{2}$  $a_{1}$  $\\sin\\theta$  $\\pi$
- For non-math topics (history, GK, etc.) skip LaTeX entirely

Format (one compact line per object, no line breaks inside objects):
[{"question":"प्रश्न $math$ हिंदी में","options":["$opt1$","opt2","opt3","opt4"],"correctAnswer":0,"explanation":"व्याख्या $math$","difficulty":"easy","points":100}]

Begin JSON array now:`;
}

// ─── Call Gemini REST API ─────────────────────────────────────────────────────
async function callGemini(promptText) {
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.4,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000,
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API ने खाली response दिया');
  return text;
}

// ─── Parse with sanitiser, throw only if all strategies fail ─────────────────
function parseGeminiResponse(raw) {
  // Strategy 1: direct parse after stripping fences
  try {
    const stripped = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    const s = stripped.indexOf('[');
    const e = stripped.lastIndexOf(']');
    if (s !== -1 && e > s) {
      const arr = JSON.parse(stripped.slice(s, e + 1));
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (_) { }

  // Strategy 2: char-by-char sanitiser (handles unescaped quotes / newlines)
  try {
    const fixed = sanitizeJSON(raw);
    if (fixed) {
      const arr = JSON.parse(fixed);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (_) { }

  return null;
}

// ─── Validate and normalise one question object ───────────────────────────────
function normalise(q) {
  if (!q || typeof q !== 'object') return null;
  if (typeof q.question !== 'string' || q.question.trim().length < 3) return null;
  if (!Array.isArray(q.options) || q.options.length < 2) return null;

  const opts = q.options.slice(0, 4).map((o) => String(o).trim());
  while (opts.length < 4) opts.push(`विकल्प ${opts.length + 1}`);

  const ci = parseInt(q.correctAnswer, 10);
  const safeCI = Number.isFinite(ci) && ci >= 0 && ci <= 3 ? ci : 0;

  const diff = ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium';
  const pts = diff === 'easy' ? 100 : diff === 'hard' ? 200 : 150;

  return {
    question: q.question.trim(),
    options: opts,
    correctAnswer: safeCI,
    explanation: String(q.explanation || '').trim(),
    difficulty: diff,
    points: Number(q.points) || pts,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export const generateAIQuiz = async ({ topic, difficulty = 'mixed', numQuestions = 10 }) => {
  const difficultyInstruction =
    difficulty === 'mixed'
      ? 'Mix easy (points 100), medium (points 150), and hard (points 200) questions evenly'
      : `All ${difficulty} — points: ${difficulty === 'easy' ? 100 : difficulty === 'hard' ? 200 : 150}`;

  let parsed = null;

  // ── Attempt 1: normal prompt ───────────────────────────────────────────────
  try {
    const raw = await callGemini(buildPrompt(topic, numQuestions, difficultyInstruction));
    console.log('[AI] Attempt 1 raw (200 chars):', raw.slice(0, 200));
    parsed = parseGeminiResponse(raw);
    if (parsed) console.log('[AI] Attempt 1 ✅ parsed', parsed.length, 'objects');
  } catch (err) {
    console.error('[AI] Attempt 1 API error:', err.message);
  }

  // ── Attempt 2: minimal single-line prompt ──────────────────────────────────
  if (!parsed) {
    console.warn('[AI] Attempt 2 with simpler prompt…');
    try {
      const simple =
        `Output only a raw JSON array (no markdown). ` +
        `${numQuestions} Hindi MCQ questions about "${topic}". ` +
        `Each object on ONE line: ` +
        `{"question":"...","options":["a","b","c","d"],"correctAnswer":0,"explanation":"...","difficulty":"medium","points":150}`;
      const raw2 = await callGemini(simple);
      console.log('[AI] Attempt 2 raw (200 chars):', raw2.slice(0, 200));
      parsed = parseGeminiResponse(raw2);
      if (parsed) console.log('[AI] Attempt 2 ✅ parsed', parsed.length, 'objects');
    } catch (err) {
      console.error('[AI] Attempt 2 API error:', err.message);
    }
  }

  if (!parsed || parsed.length === 0) {
    throw new Error(
      'Quiz generation failed — Gemini ने valid JSON नहीं दिया। ' +
      'कृपया topic बदलकर दोबारा कोशिश करें।'
    );
  }

  // ── Normalise and filter ───────────────────────────────────────────────────
  const valid = parsed.map(normalise).filter(Boolean);

  if (valid.length === 0) {
    throw new Error(
      'Gemini के उत्तर में कोई valid प्रश्न structure नहीं मिला। दोबारा कोशिश करें।'
    );
  }

  console.log(`[AI] ✅ Final: ${valid.length}/${numQuestions} questions for "${topic}"`);
  return valid;
};