import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

/**
 * Get all TODOitems for a current user
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
  const userId = getUserId(event)
  const todos = await getTodosForUser(userId);

  // Send results
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: todos
    })
  }
}
