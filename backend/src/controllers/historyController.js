import QuizHistory from '../models/QuizHistory.js';
import { AppError } from '../middleware/errorHandler.js';
import axios from 'axios';

const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── GET /api/history  — paginated list for logged-in user ────────────────────
export const getMyHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [records, total] = await Promise.all([
            QuizHistory.find({ user: req.user._id })
                .select('-attempts -aiSuggestion')          // light list — no heavy fields
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            QuizHistory.countDocuments({ user: req.user._id }),
        ]);

        res.json({
            success: true,
            data: {
                history: records,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/history/:id  — full detail with all attempts ───────────────────
export const getHistoryDetail = async (req, res, next) => {
    try {
        const record = await QuizHistory.findOne({
            _id: req.params.id,
            user: req.user._id,        // owner-only
        });

        if (!record) throw new AppError('History record not found', 404);

        res.json({ success: true, data: { record } });
    } catch (error) {
        next(error);
    }
};

// ─── POST /api/history/:id/suggestion  — generate/return AI suggestion ───────
export const getAISuggestion = async (req, res, next) => {
    try {
        const record = await QuizHistory.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!record) throw new AppError('History record not found', 404);

        // Return cached suggestion if already generated (within 7 days)
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (
            record.aiSuggestion &&
            record.suggestionGeneratedAt &&
            Date.now() - record.suggestionGeneratedAt.getTime() < sevenDays
        ) {
            return res.json({ success: true, data: { suggestion: record.aiSuggestion, cached: true } });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new AppError('Gemini API key configure नहीं है', 503);
        }

        // Build mistake summary for the prompt
        const wrongAttempts = record.attempts.filter((a) => !a.isCorrect && !a.isSkipped);
        const skippedAttempts = record.attempts.filter((a) => a.isSkipped);

        const mistakeLines = wrongAttempts
            .map(
                (a, i) =>
                    `${i + 1}. प्रश्न: "${a.questionText}"\n` +
                    `   आपका उत्तर: "${a.options[a.selectedOption] ?? 'कोई नहीं'}"\n` +
                    `   सही उत्तर: "${a.options[a.correctAnswer]}"\n` +
                    `   व्याख्या: ${a.explanation || 'उपलब्ध नहीं'}`
            )
            .join('\n\n');

        const prompt = `आप एक अनुभवी शिक्षक हैं। एक छात्र ने "${record.quizTitle}" quiz दी।

परिणाम:
- कुल प्रश्न: ${record.totalQuestions}
- सही उत्तर: ${record.correctCount}
- गलत उत्तर: ${record.incorrectCount}
- छोड़े गए: ${record.skippedCount}
- सटीकता: ${record.accuracy}%
- अंक: ${record.finalScore}
- रैंक: ${record.rank} / ${record.totalPlayers}

${wrongAttempts.length > 0 ? `गलत उत्तरों का विवरण:\n${mistakeLines}` : 'सभी प्रश्न सही थे!'}
${skippedAttempts.length > 0 ? `\n${skippedAttempts.length} प्रश्न छोड़े गए।` : ''}

कृपया हिंदी में विस्तृत सुझाव दें जिसमें शामिल हो:
1. **प्रदर्शन सारांश** — छात्र कहाँ मजबूत है और कहाँ कमजोर
2. **गलतियों का विश्लेषण** — हर गलती का कारण और सही अवधारणा समझाएं
3. **सुधार के उपाय** — कौन से टॉपिक दोबारा पढ़ें, कैसे अभ्यास करें
4. **अगला कदम** — आगे की तैयारी के लिए 3-5 सुझाव

उत्तर प्रेरणादायक और सकारात्मक भाषा में दें।`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
        );

        const suggestion =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!suggestion) throw new AppError('AI से सुझाव प्राप्त नहीं हुआ', 502);

        // Cache it
        record.aiSuggestion = suggestion;
        record.suggestionGeneratedAt = new Date();
        await record.save();

        res.json({ success: true, data: { suggestion, cached: false } });
    } catch (error) {
        next(error);
    }
};

// ─── DELETE /api/history/:id  — delete one record ────────────────────────────
export const deleteHistory = async (req, res, next) => {
    try {
        const record = await QuizHistory.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!record) throw new AppError('Record not found', 404);
        res.json({ success: true, message: 'History record deleted' });
    } catch (error) {
        next(error);
    }
};