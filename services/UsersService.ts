import { DynamoDB, AWSError } from 'aws-sdk';
import { ScanOutput, ScanInput } from 'aws-sdk/clients/dynamodb';

export class UsersService {
    private readonly userTableName = process.env.USER_TABLE_NAME;
    private readonly dynamoClient = new DynamoDB.DocumentClient();
    
    async fetchAllUsers(): Promise<CoinwatchUser[]> {
        if (!this.userTableName) throw new Error('process.env.USER_TABLE_NAME is not defined');
        const scanOutput = await this.scanDynamoTable({ TableName: this.userTableName });
        let users: CoinwatchUser[] = [];
        if (scanOutput.Items) {
            users = scanOutput.Items.map(item => ({
                email: item.email as string,
                phrase: item.phrase as string,
                currencies: item.currencies as any
            }));
        }
        return users;
    }

    private async scanDynamoTable(params: ScanInput): Promise<ScanOutput> {
        return new Promise<ScanOutput>((resolve, reject) => {
            this.dynamoClient.scan(params, (err: AWSError, data: ScanOutput) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });
    }
}

interface CoinwatchUser {
    email: string;
    phrase: string;
    currencies: any;
}
