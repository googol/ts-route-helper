import { IRouter, IRouterMatcher, Request, Response, RequestHandler } from 'express';
import { GetRoute, PostRoute, PutRoute, DeleteRoute, HttpResult, UrlParams } from './route';
import * as Bluebird from 'bluebird';

export function useRoute<RouterType, RouteParams extends string, ResultType extends HttpResult>(router: IRouter<RouterType>, route: GetRoute<RouteParams, ResultType>, handler: (routeParams: UrlParams<RouteParams>) => Bluebird<ResultType>): void;
export function useRoute<RouterType, RouteParams extends string, ResultType extends HttpResult, BodyType>(router: IRouter<RouterType>, route: PostRoute<RouteParams, ResultType, BodyType>, handler: (routeParams: UrlParams<RouteParams>, body: BodyType) => Bluebird<ResultType>): void;
export function useRoute<RouterType, RouteParams extends string, ResultType extends HttpResult, BodyType>(router: IRouter<RouterType>, route: PutRoute<RouteParams, ResultType, BodyType>, handler: (routeParams: UrlParams<RouteParams>, body: BodyType) => Bluebird<ResultType>): void;
export function useRoute<RouterType, RouteParams extends string, ResultType extends HttpResult, BodyType>(router: IRouter<RouterType>, route: DeleteRoute<RouteParams, ResultType, BodyType>, handler: (routeParams: UrlParams<RouteParams>, body: BodyType) => Bluebird<ResultType>): void;
export function useRoute<RouterType>(router: IRouter<RouterType>, route: any, handler: (routeParams: any, body?: any) => Bluebird<any>): void {
    const routerMatcher = getRouterMatcher(router, route.method);
    routerMatcher(route.urlTemplate, (req: Request, res: Response) => {
        Bluebird.try(() => {
            const { params, body } = req;
            if (!route.validateParams(params)) {
                throw new Error('Invalid route parameters');
            } else if (route.bodySchema && !route.bodySchema(body)) {
                throw new Error('Invalid body type');
            } else {
                return handler(params, body);
            }
        })
        .catch((err): any => {
            if (route.returnSchema(err)) {
                return err;
            } else {
                return {
                    statusCode: 500,
                    body: {
                        errorMessage: err.message,
                    },
                };
            }
        })
        .tap((result) => res.status(result.statusCode).json(result.body));
    });
}

function getRouterMatcher<RouterType>(router: IRouter<RouterType>, method: 'get' | 'post' | 'put' | 'delete'): IRouterMatcher<IRouter<RouterType>> {
    switch(method) {
        case 'get':
            const getHandler: IRouterMatcher<IRouter<RouterType>> = (path: string, ...handlers: RequestHandler[]) => router.get(path, ...handlers);
            return getHandler;
        case 'post':
            const postHandler: IRouterMatcher<IRouter<RouterType>> = (path: string, ...handlers: RequestHandler[]) => router.post(path, ...handlers);
            return postHandler;
        case 'put':
            const putHandler: IRouterMatcher<IRouter<RouterType>> = (path: string, ...handlers: RequestHandler[]) => router.put(path, ...handlers);
            return putHandler;
        case 'delete':
            const deleteHandler: IRouterMatcher<IRouter<RouterType>> = (path: string, ...handlers: RequestHandler[]) => router.delete(path, ...handlers);
            return deleteHandler;
    }
}
