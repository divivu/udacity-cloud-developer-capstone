import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const logger = createLogger('TodosAccess')

// Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODOS_ITEM_TABLE,
    private readonly indexName = process.env.TODOS_CREATED_AT_INDEX,
    private readonly indexNameDueDate = process.env.TODOS_DUE_DATE_INDEX,
    ) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Fetching todos for userId: ${userId}`)
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    const items = result.Items
    logger.info('Fetching done', items)
    return items as TodoItem[]
  }

  async getTodosSortedByDueDate(userId: string, order: string = null): Promise<TodoItem[]> {
    logger.info(`Fetching todos by due date for userId: ${userId}`)
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.indexNameDueDate,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: order != 'DESC'
    }).promise()
    const items = result.Items
    logger.info('Fetching done', items)
    return items as TodoItem[]
  }

  /**
   * Create todoItem
   * @param todoItem
   */
  async createTodo(todoItem): Promise<TodoItem> {
    logger.info(`Creating new todo item with id ${todoItem.todoId}`)
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem;
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info("Deleting todo:", {todoId: todoId});
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId
      }
    }).promise();
    logger.info("Delete complete.", {todoId: todoId});
  }

  async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest){

    logger.info("Updating todo:", {
      todoId: todoId,
      updatedTodo: updatedTodo
    });
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: "set #todoName = :name, done = :done, dueDate = :dueDate",
      ExpressionAttributeNames: {
        "#todoName": "name"
      },
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":done": updatedTodo.done,
        ":dueDate": updatedTodo.dueDate
      }
    }).promise()
    logger.info("Update complete.")
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string){
    logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentUrl}`)
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
      }
    }).promise();
  }
}
