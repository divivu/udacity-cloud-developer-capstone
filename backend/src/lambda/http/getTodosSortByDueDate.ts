import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodosSortedByDueDate } from '../../helpers/todos'
import { getUserId, getSortOrder } from '../utils';

// import { createLogger } from '../../utils/logger'
// const logger = createLogger('Delete TODO')

/**
 * Get all TODOitems for a current user
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
  const userId = getUserId(event)
  const sortOrder = getSortOrder(event);
  const todos = await getTodosSortedByDueDate(userId, sortOrder);

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
