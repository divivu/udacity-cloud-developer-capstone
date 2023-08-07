import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);

  let newTodo: CreateTodoRequest = JSON.parse(event.body)
  newTodo = await createTodo(userId, newTodo);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newTodo
    })
  }
}
