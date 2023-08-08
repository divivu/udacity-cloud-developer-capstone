import * as AWS from 'aws-sdk';
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

import {TodosAccess} from "../../helpers/todosAcess";
const todoAccess = new TodosAccess();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId
  const attachmentUrl = event.queryStringParameters.attachmentUrl
  const attachmentId = attachmentUrl.replace(`https://${bucketName}.s3.amazonaws.com/`, '');

  s3.deleteObject({
    Bucket: bucketName,
    Key: attachmentId
  });

  const userId = getUserId(event);
  await todoAccess.removeTodoAttachmentUrl(todoId, userId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
