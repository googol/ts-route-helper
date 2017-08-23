import * as A from 'axios';
import { GetRoute, HttpResult, UrlParams, GenericInternalServerError } from './route';
import * as Bluebird from 'bluebird';

function requestRoute<RouteParams extends string, ResultType extends HttpResult>(axios: A.AxiosInstance, route: GetRoute<RouteParams, ResultType>, routeParams: UrlParams<RouteParams>): Bluebird<ResultType | GenericInternalServerError> {
    return Bluebird.try(() => axios.get(route.getUrl(routeParams), { validateStatus: () => true }))
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
