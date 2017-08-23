import { IRouter } from 'express';
import { GetRoute, HttpResult, UrlParams, GenericInternalServerError } from './route';
import * as Bluebird from 'bluebird';

export function useRoute<RouterType, RouteParams extends string, ResultType extends HttpResult>(router: IRouter<RouterType>, route: GetRoute<RouteParams, ResultType>, handler: (routeParams: UrlParams<RouteParams>) => Bluebird<ResultType>): void {
    router.get(route.urlTemplate, (req, res, next) => {
        Bluebird.try(() => {
            const { params } = req;
            if (route.validateParams(params)) {
                return handler(params);
            } else {
                throw new Error('Invalid route parameters');
            }
        })
        .catch((err): ResultType | GenericInternalServerError => {
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
