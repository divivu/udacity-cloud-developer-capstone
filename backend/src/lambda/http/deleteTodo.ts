import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Delete TODO')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info(`todoId: ${todoId}`)
  //  Remove a TODOS item by id
  await deleteTodo(todoId, getUserId(event))

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
