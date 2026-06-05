import EmailService, { SupportRequestPayload } from './emailService';

export type { SupportRequestPayload } from './emailService';

export const SupportService = {
  async submitSupportRequest(payload: SupportRequestPayload) {
    return EmailService.sendSupportRequest(payload);
  }
};

export default SupportService;
