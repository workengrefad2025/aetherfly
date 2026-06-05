export interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'AetherFly Concierge <concierge@aetherfly.com>';
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const getApiKey = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('RESEND_API_KEY is not configured. Set the environment variable and redeploy.');
  }
  return apiKey;
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return { statusText: response.statusText };
};

export const sendEmail = async (options: ResendEmailOptions) => {
  const apiKey = getApiKey();
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: options.from ?? DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    })
  });

  const body = await parseResponse(response);
  if (!response.ok) {
    const message = body?.error?.message || body?.message || response.statusText || 'Unknown Resend error';
    const error = new Error(`Resend API error ${response.status}: ${message}`);
    (error as any).retryable = RETRYABLE_STATUSES.has(response.status);
    (error as any).status = response.status;
    throw error;
  }

  return {
    id: body?.id ?? null,
    status: 'queued',
    provider: 'resend',
    raw: body
  };
};

export const sendEmailWithRetry = async (
  options: ResendEmailOptions,
  retryCount = 2
) => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const result = await sendEmail(options);
      console.log('[ResendService] email dispatched to', options.to, 'subject:', options.subject);
      return result;
    } catch (error) {
      lastError = error as Error;
      const retryable = (error as any)?.retryable === true;

      if (!retryable || attempt === retryCount) {
        console.error('[ResendService] email delivery failed:', error);
        throw error;
      }

      const backoffMs = 300 * Math.pow(2, attempt);
      console.warn(`[ResendService] retrying email delivery to ${options.to} in ${backoffMs}ms`, {
        attempt: attempt + 1,
        error: error instanceof Error ? error.message : error
      });
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError ?? new Error('Unknown ResendService failure');
};
