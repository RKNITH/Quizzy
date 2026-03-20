/**
 * MathText — renders a string that may contain:
 *   • Plain Hindi / English text
 *   • Inline LaTeX between $…$   e.g.  $x^2 + 3x - 4 = 0$
 *   • Display LaTeX between $$…$$  e.g.  $$\frac{a}{b}$$
 *
 * Usage:
 *   <MathText text="समीकरण $x^2 - 5x + 6 = 0$ के मूल क्या हैं?" />
 *
 * Gemini is instructed to wrap all math in $…$ so this component
 * handles both AI-generated and manually written questions.
 */

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ── Split text into plain-text and math segments ──────────────────────────────
function tokenize(text) {
    if (!text) return [];
    const tokens = [];
    // Match $$…$$ (display) first, then $…$ (inline)
    const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    let last = 0;
    let match;

    while ((match = re.exec(text)) !== null) {
        // Plain text before this match
        if (match.index > last) {
            tokens.push({ type: 'text', value: text.slice(last, match.index) });
        }

        const raw = match[0];
        if (raw.startsWith('$$')) {
            tokens.push({ type: 'display', value: raw.slice(2, -2).trim() });
        } else {
            tokens.push({ type: 'inline', value: raw.slice(1, -1).trim() });
        }

        last = match.index + raw.length;
    }

    // Remaining plain text
    if (last < text.length) {
        tokens.push({ type: 'text', value: text.slice(last) });
    }

    return tokens;
}

// ── Render one KaTeX token safely ─────────────────────────────────────────────
function KatexSpan({ latex, display }) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(latex, {
                displayMode: display,
                throwOnError: false,
                output: 'html',
                trust: false,
                strict: false,
            });
        } catch {
            // If KaTeX can't parse it, show the raw LaTeX source
            return `<span style="font-family:monospace;color:#f87171">${latex}</span>`;
        }
    }, [latex, display]);

    return (
        <span
            className={display ? 'block my-2 overflow-x-auto' : 'inline-block align-middle mx-0.5'}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MathText({ text, className = '' }) {
    const tokens = useMemo(() => tokenize(String(text || '')), [text]);

    if (tokens.length === 0) return null;

    // Fast path — no math at all
    if (tokens.length === 1 && tokens[0].type === 'text') {
        return <span className={className}>{tokens[0].value}</span>;
    }

    return (
        <span className={className}>
            {tokens.map((tok, i) => {
                if (tok.type === 'text') return <span key={i}>{tok.value}</span>;
                if (tok.type === 'inline') return <KatexSpan key={i} latex={tok.value} display={false} />;
                if (tok.type === 'display') return <KatexSpan key={i} latex={tok.value} display={true} />;
                return null;
            })}
        </span>
    );
}