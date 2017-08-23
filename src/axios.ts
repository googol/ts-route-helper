import * as A from 'axios';
import { GetRoute, PostRoute, PutRoute, DeleteRoute, HttpResult, UrlParams, GenericInternalServerError } from './route';
import * as Bluebird from 'bluebird';

function requestRoute<RouteParams extends string, ResultType extends HttpResult>(axios: A.AxiosInstance, route: GetRoute<RouteParams, ResultType>, routeParams: UrlParams<RouteParams>): Bluebird<ResultType | GenericInternalServerError>;
function requestRoute<RouteParams extends string, ResultType extends HttpResult, BodyType>(axios: A.AxiosInstance, route: PostRoute<RouteParams, ResultType, BodyType>, routeParams: UrlParams<RouteParams>, body: BodyType): Bluebird<ResultType | GenericInternalServerError>;
function requestRoute<RouteParams extends string, ResultType extends HttpResult, BodyType>(axios: A.AxiosInstance, route: PutRoute<RouteParams, ResultType, BodyType>, routeParams: UrlParams<RouteParams>, body: BodyType): Bluebird<ResultType | GenericInternalServerError>;
function requestRoute<RouteParams extends string, ResultType extends HttpResult, BodyType>(axios: A.AxiosInstance, route: DeleteRoute<RouteParams, ResultType, BodyType>, routeParams: UrlParams<RouteParams>, body: BodyType): Bluebird<ResultType | GenericInternalServerError>;
function requestRoute(axios: A.AxiosInstance, route: any, routeParams: any, body?: any): any {
    return Bluebird.try(() => axios.request({ url: route.getUrl(routeParams), method: route.method, data: body, validateStatus: () => true }))
        .then((axiosResponse) => {
            if (axiosResponse.status === 500 && typeof axiosResponse.data === 'object' && typeof axiosResponse.data.errorMessage === 'string') {
                const response: GenericInternalServerError = {
                    statusCode: 500,
                    body: {
                        errorMessage: axiosResponse.data.errorMessage,
                    },
                };
                return response;
            }

            const response = {
                statusCode: axiosResponse.status,
                body: axiosResponse.data,
            };

            if (route.returnSchema(response)) {
                return response;
            }

            throw new Error('Received unexpected result from server');
        });
}
