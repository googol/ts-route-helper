# ts-route-helpers

This repository includes some helpers I've been playing with for making http requests in projects where both the frontend and backend are written in typescript.

# Usage

## In some common location

You can define your http routes in some common file:

```ts
// routes.ts
import { url, getRoute } from 'ts-route-helpers';

interface OrderResponse {
    statusCode: 200;
    body: {
        order: {
            id: string;
        };
    }
}

const validateOrdersResponse = (input: any): input is OrdersResponse => true; // Some proper validation

export const getOrder = getRoute(url`/orders/${'orderId'}`, validateOrdersResponse);
```

## On the backend

You can use the route you defined to create a route in express:

```ts
// server.ts
import { getOrder } from './routes';
import * as express from 'express';
import { useRoute } from 'ts-route-helpers';
import * as Bluebird from 'bluebird';

const app = express();

useRoute(app, getOrders, ({ orderId }) => Bluebird.resolve({ statusCode: 200, body: { order: { id: orderId } } }));
```

The handler function will receive url parameters (and for post, put & delete the body of the request) and must return a promise of the return type defined for the route.
The status code and the result body will be sent to the client.
The result will be verified both on the type system level and at runtime.
If the validaton fails, a 500 error with a body type of `{ errorMessage: string }` will be sent.

You can also reject the promise with an object that has a statusCode and a body as properties. The error will be handled as if it was the result value of the promise.

## On the client

To call the route:
```ts
// client.ts
import { getOrder } from './routes';
import Axios from 'axios';
import { requestRoute } from 'ts-route-helpers';

requestRoute(getOrder, { orderId: 'myOrderId' })
    .then((response) => /* response :: { statusCode: 200, body: { order: { id: string } } } | { statusCode: 500, body: { errorMessage: string } } */);
```

The path parameters (orderId) will be verified by the type system and at runtime.
The result type will also be checked similarly.
If the result type does not match the expected type, you will get a 500 error with a body type of `{ errorMessage: string }`.

## The url tagged template function

The `url` function is used to define url templates.
It is meant to be used as a tag in a template literal.
You should use string literals in the template expansions.

The return value is an object, that has an express style url template, a stronly typed function for filling in the parameters of that template, and a validation function.

```ts
const orderUrl = url`/orders/${'orderId'`;

/*
orderUrl.urlTemplate === '/orders/:orderId';
orderUrl.getUrl: (params: { orderId: string }) => string;
orderUrl.validateParams: (params: any) => params is { orderId: string };
*/
```
