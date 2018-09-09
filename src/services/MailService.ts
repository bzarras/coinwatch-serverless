export interface MailService {
    sendEmail(recipient: any, subject: string, body: string): Promise<void>;
}

export interface MailRecipient {
    email: string;
    phrase?: string;
}
