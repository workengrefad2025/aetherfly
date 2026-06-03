import EmailService, { EmailTemplates } from './emailService';

export interface SupportRequestPayload {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  bookingRef?: string;
  submittedAt?: string;
}

export const SupportService = {
  async submitSupportRequest(payload: SupportRequestPayload) {
    const submittedAt = payload.submittedAt ?? new Date().toISOString();
    const email = EmailTemplates.supportNotification({
      ...payload,
      submittedAt
    });

    return EmailService.prepareAndQueueEmail({
      to: 'refadsaeed2025@gmail.com',
      subject: email.subject,
      html: email.html,
      meta: {
        type: 'support_request',
        bookingRef: payload.bookingRef ?? 'N/A',
        customerEmail: payload.email,
        submittedAt
      }
    });
  }
};

export default SupportService;
