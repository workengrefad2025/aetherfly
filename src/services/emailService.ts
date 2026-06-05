import { Booking } from '../types';
import { buildBookingConfirmationEmail, buildSupportEmail, buildTicketDeliveryEmail } from './emailTemplates';

export interface SupportRequestPayload {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  bookingRef?: string;
  submittedAt?: string;
}

const persistSentEmail = async (envelope: {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  meta: Record<string, any>;
  sentAt: string;
}) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const history = window.localStorage.getItem('aetherfly_sent_emails');
    const sentEmails = history ? JSON.parse(history) : [];
    sentEmails.unshift(envelope);
    window.localStorage.setItem('aetherfly_sent_emails', JSON.stringify(sentEmails.slice(0, 50)));
  } catch (error) {
    console.warn('[EmailService] failed to persist email history:', error);
  }
};

const handleApiResponse = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error || body?.details || body?.message || response.statusText;
    throw new Error(`Email API failed: ${message}`);
  }
  return body;
};

export const EmailService = {
  async sendSupportRequest(payload: SupportRequestPayload) {
    const timestamp = payload.submittedAt ?? new Date().toISOString();
    const emailTemplate = buildSupportEmail({
      ...payload,
      timestamp
    });

    const response = await fetch('/api/supportEmailHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp
      })
    });

    const result = await handleApiResponse(response);

    await persistSentEmail({
      id: `support-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: 'refadsaeed2025@gmail.com',
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      meta: {
        type: 'support_request',
        bookingRef: payload.bookingRef ?? 'N/A',
        customerEmail: payload.email,
        submittedAt: timestamp,
        provider: 'resend'
      },
      sentAt: new Date().toISOString()
    });

    return result;
  },

  async dispatchBookingEmail(booking: Booking, customerEmail: string) {
    const confirmationTemplate = buildBookingConfirmationEmail(booking);
    const ticketTemplate = buildTicketDeliveryEmail(booking, `https://aetherfly.com/e-ticket/${encodeURIComponent(booking.ref)}`);

    const response = await fetch('/api/bookingEmailHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking, customerEmail })
    });

    const result = await handleApiResponse(response);

    const sentAt = new Date().toISOString();

    await Promise.all([
      persistSentEmail({
        id: `booking-confirmation-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        to: customerEmail,
        subject: confirmationTemplate.subject,
        htmlContent: confirmationTemplate.html,
        meta: { type: 'booking_confirmation', bookingRef: booking.ref, provider: 'resend' },
        sentAt
      }),
      persistSentEmail({
        id: `ticket-delivery-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        to: customerEmail,
        subject: ticketTemplate.subject,
        htmlContent: ticketTemplate.html,
        meta: { type: 'ticket_delivery', bookingRef: booking.ref, provider: 'resend' },
        sentAt
      })
    ]);

    return result;
  }
};

export default EmailService;
