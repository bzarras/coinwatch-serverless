import { DynamoDB, AWSError } from 'aws-sdk';
import { ScanOutput, ScanInput, GetItemOutput, GetItemInput, DeleteItemInput, DeleteItemOutput, AttributeValue, PutItemInput, PutItemOutput, PutItemInputAttributeMap, BatchGetItemInput } from 'aws-sdk/clients/dynamodb';

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
                currencies: item.currencies as any,
                verified: item.verified as boolean
            })).filter(user => user.verified); // make sure to filter out unverified users
        }
        return users;
    }

    async getUser(email: string): Promise<CoinwatchUser | undefined> {
        if (!this.userTableName) throw new Error('process.env.USER_TABLE_NAME is not defined');
        const getOptions: GetItemInput = {
            TableName: this.userTableName,
            Key: { email: email as AttributeValue }
        };
        const getOutput = await this.getFromDynamoTable(getOptions);
        return getOutput.Item ? {
            email: getOutput.Item.email as string,
            phrase: getOutput.Item.phrase as string,
            currencies: getOutput.Item.currencies as any,
            verified: getOutput.Item.verified as boolean
        } : undefined;
    }

    async putUser(user: CoinwatchUser): Promise<void> {
        if (!this.userTableName) throw new Error('process.env.USER_TABLE_NAME is not defined');
        const putOptions: PutItemInput = {
            TableName: this.userTableName,
            Item: user as PutItemInputAttributeMap
        };
        await this.putIntoDynamoTable(putOptions);
    }

    async deleteUser(email: string): Promise<void> {
        if (!this.userTableName) throw new Error('process.env.USER_TABLE_NAME is not defined');
        const deleteOptions: DeleteItemInput = {
            TableName: this.userTableName,
            Key: { email: email as AttributeValue }
        };
        await this.deleteFromDynamoTable(deleteOptions);
    }

    private async scanDynamoTable(params: ScanInput): Promise<ScanOutput> {
        return new Promise<ScanOutput>((resolve, reject) => {
            this.dynamoClient.scan(params, (err: AWSError, data: ScanOutput) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });
    }

    private async getFromDynamoTable(params: GetItemInput): Promise<GetItemOutput> {
        return new Promise<GetItemOutput>((resolve, reject) => {
            this.dynamoClient.get(params, (err: AWSError, data: GetItemOutput) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });
    }

    private async putIntoDynamoTable(params: PutItemInput): Promise<PutItemOutput> {
        return new Promise<PutItemOutput>((resolve, reject) => {
            this.dynamoClient.put(params, (err: AWSError, data: PutItemOutput) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });
    }

    private async deleteFromDynamoTable(params: DeleteItemInput): Promise<DeleteItemOutput> {
        return new Promise<DeleteItemOutput>((resolve, reject) => {
            this.dynamoClient.delete(params, (err: AWSError, data: DeleteItemOutput) => {
                if (err) reject(err);
                else if (data) resolve(data);
            });
        });
    }
}

export interface CoinwatchUser {
    [key: string]: any
    email: string;
    phrase: string;
    currencies: any;
    verified: boolean;
}
