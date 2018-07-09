import { Coin } from './CoinDataSource';
import * as pug from 'pug';
import * as path from 'path';
import { SES, AWSError } from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';

export class MailService {
    private readonly ses = new SES();
    private readonly renderDailyEmail = pug.compileFile(path.resolve(process.cwd(), 'static/emailTemplates/dailyUpdate.pug'));

    async sendDailyAlertEmail({ recipient, coins }: { recipient: MailRecipient; coins: Coin[]; }): Promise<void> {
        const priceChanges = coins.map(coin => ({
            color: Number(coin.percentChange24hr) >= 0 ? 'green' : 'red',
            coinSymbol: coin.symbol,
            prettyPrice: formatPrice(coin.price),
            percentChange: coin.percentChange24hr
        }));
        const emailHtml = this.renderDailyEmail({ recipient, changes: priceChanges });
        await this.sendEmail(recipient, 'Coinwatch daily update', emailHtml);
    }

    private async sendEmail(recipient: MailRecipient, subject: string, body: string): Promise<void> {
        const mailOptions: SendEmailRequest = {
            Source: '"Coinwatch" <donotreply@coinwatch.fyi>',
            Destination: {
                ToAddresses: [recipient.email]
            },
            Message: {
                Subject: { Data: subject, Charset: 'utf-8' },
                Body: { Html: { Data: body, Charset: 'utf-8' } }
            }
        };
        try {
            await this.sesSendEmail(mailOptions);
            console.log(`Successfully sent email to ${recipient.email}`);
        } catch (err) {
            console.log(err);
        }
    }

    private async sesSendEmail(sendEmailRequest: SendEmailRequest): Promise<SendEmailResponse> { 
        return new Promise<SendEmailResponse>((resolve, reject) => {
            this.ses.sendEmail(sendEmailRequest, (err: AWSError | undefined, data: SendEmailResponse | undefined) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });  
    }
}

export interface MailRecipient {
    email: string;
    phrase?: string;
}

function formatPrice(priceString: string): string {
    const priceNum = Number(priceString);
    return priceNum.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
