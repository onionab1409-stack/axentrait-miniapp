import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

const botToken = process.env.TG_BOT_TOKEN || '';
const miniAppUrl = process.env.TG_MINIAPP_URL || '';
const webhookSecret = process.env.TG_WEBHOOK_SECRET_TOKEN || '';
const port = Number(process.env.BOT_PORT || '3001');

if (!botToken) {
  throw new Error('TG_BOT_TOKEN is required');
}

const sanitizeStartParam = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const cleaned = value.trim().slice(0, 64);
  return /^[A-Za-z0-9_-]{1,64}$/.test(cleaned) ? cleaned : undefined;
};

const telegramApi = `https://api.telegram.org/bot${botToken}`;

const sendMessage = async (chatId: number, startParam?: string): Promise<void> => {
  const text = startParam
    ? `Добро пожаловать в AXENTRAIT. Стартовый параметр: ${startParam}`
    : 'Добро пожаловать в AXENTRAIT.';

  const body = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть приложение',
            web_app: {
              url: miniAppUrl,
            },
          },
        ],
      ],
    },
  };

  const response = await fetch(`${telegramApi}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${errorText}`);
  }
};

app.post('/telegram/webhook', async (req, res) => {
  const providedToken = req.header('x-telegram-bot-api-secret-token');
  if (!providedToken || providedToken !== webhookSecret) {
    return res.status(401).json({ ok: false, error: 'Invalid webhook secret token' });
  }

  const update = req.body as {
    message?: {
      chat?: { id: number };
      text?: string;
    };
  };

  try {
    const message = update.message;
    const text = message?.text || '';

    if (message?.chat?.id && text.startsWith('/start')) {
      const [, rawStartParam] = text.split(/\s+/, 2);
      const startParam = sanitizeStartParam(rawStartParam);
      await sendMessage(message.chat.id, startParam);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook handling failed:', error);
    return res.status(500).json({ ok: false });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Telegram bot webhook server listening on :${port}`);
});
