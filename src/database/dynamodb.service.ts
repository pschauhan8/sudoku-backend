import { Injectable, OnModuleInit } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbService implements OnModuleInit {
  private docClient: DynamoDBDocumentClient;
  public usersTable: string;
  public leaderboardTable: string;

  onModuleInit() {
    const region = process.env.AWS_REGION || 'us-east-1';
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });

    this.usersTable = process.env.USERS_TABLE || 'sudoku-users-prod';
    this.leaderboardTable = process.env.LEADERBOARD_TABLE || 'sudoku-leaderboard-prod';
  }

  get client(): DynamoDBDocumentClient {
    return this.docClient;
  }

  async put(table: string, item: Record<string, any>) {
    const cmd = new PutCommand({
      TableName: table,
      Item: item,
    });
    return this.docClient.send(cmd);
  }

  async get(table: string, key: Record<string, any>) {
    const cmd = new GetCommand({
      TableName: table,
      Key: key,
    });
    const result = await this.docClient.send(cmd);
    return result.Item;
  }

  async query(params: {
    table: string;
    keyConditionExpression: string;
    expressionAttributeValues: Record<string, any>;
    scanIndexForward?: boolean; // true = ascending (fastest times first)
    limit?: number;
  }) {
    const cmd = new QueryCommand({
      TableName: params.table,
      KeyConditionExpression: params.keyConditionExpression,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ScanIndexForward: params.scanIndexForward ?? true,
      Limit: params.limit || 50,
    });
    const result = await this.docClient.send(cmd);
    return result.Items || [];
  }
}
