import * as AWS from 'aws-sdk';
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import * as uuid from 'uuid'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('GenerateUploadUrl')
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

import {TodosAccess} from "../../helpers/todosAcess";
const todoAccess = new TodosAccess();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const attachmentId = uuid.v4();

  // Return a presigned URL to upload a file for a TODOS item with the provided id
  logger.info("Generating upload URL:", {
    todoId: todoId,
    attachmentId: attachmentId
  });

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: parseInt(urlExpiration)
  });

  const userId = getUserId(event);
  await todoAccess.updateTodoAttachmentUrl(todoId, userId, attachmentId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}
