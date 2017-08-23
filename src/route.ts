export type UrlParams<K extends string> = { [P in K]: string };

export interface UrlTemplate<K extends string> {
    validateParams: (input: any) => input is UrlParams<K>;
    getUrl: (urlParams: UrlParams<K>) => string;
    urlTemplate: string;
}

export type Schema<T> = (value: any) => value is T;

export interface HttpResult {
    statusCode: number;
    body: any;
}

export interface BaseRoute<PathParams extends string, ReturnType extends HttpResult> extends UrlTemplate<PathParams> {
    returnSchema: Schema<ReturnType>;
}

export interface GetRoute<PathParams extends string, ReturnType extends HttpResult> extends BaseRoute<PathParams, ReturnType> {
    readonly method: 'get';
}

export interface PostRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType> extends BaseRoute<PathParams, ReturnType> {
    readonly method: 'post';

    bodySchema: Schema<RequestBodyType>;
}

export interface PutRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType> extends BaseRoute<PathParams, ReturnType> {
    readonly method: 'put';

    bodySchema: Schema<RequestBodyType>;
}

export interface DeleteRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType> extends BaseRoute<PathParams, ReturnType> {
    readonly method: 'delete';

    bodySchema: Schema<RequestBodyType>;
}

export function url<K extends string>(strings: TemplateStringsArray, ...keys: K[]): UrlTemplate<K> {
    const urlTemplate = intersperse(strings, keys).join('');
    const validateParams = (input: any): input is UrlParams<K> => {
        if (input === undefined || input === null) {
            return false;
        }
        if (typeof input !== 'object') {
            return false;
        }
        for (const key of keys) {
            if (typeof input[key] !== 'string') {
                return false;
            }
        }
        return true;
    };
    const getUrl = (params: any) => {
        if (!validateParams(params)) {
            throw new Error(`Url parameters given to route ${urlTemplate} are invalid.`);
        } else {
            return intersperse(strings, keys.map((key) => params[key])).join('');
        }
    };
    return {
        validateParams,
        urlTemplate,
        getUrl,
    };
}

function intersperse(first: ReadonlyArray<string>, second: ReadonlyArray<string>): ReadonlyArray<string> {
    if (first.length !== second.length + 1) {
        throw new Error('Second array has to be one element shorter than the first');
    }
    const result: string[] = [];
    for (let i = 0; i < first.length - 1; i++) {
        result.push(first[i]);
        result.push(second[i]);
    }
    result.push(first[first.length - 1]);
    return result;
}

export function getRoute<PathParams extends string, ReturnType extends HttpResult>(urlTemplate: UrlTemplate<PathParams>, returnSchema: Schema<ReturnType>): GetRoute<PathParams, ReturnType> {
    return {
        method: 'get',
        getUrl: urlTemplate.getUrl,
        urlTemplate: urlTemplate.urlTemplate,
        validateParams: urlTemplate.validateParams,
        returnSchema,
    };
}

export function postRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType>(urlTemplate: UrlTemplate<PathParams>, returnSchema: Schema<ReturnType>, bodySchema: Schema<RequestBodyType>): PostRoute<PathParams, ReturnType, RequestBodyType> {
    return {
        method: 'post',
        getUrl: urlTemplate.getUrl,
        urlTemplate: urlTemplate.urlTemplate,
        validateParams: urlTemplate.validateParams,
        returnSchema,
        bodySchema,
    };
}

export function putRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType>(urlTemplate: UrlTemplate<PathParams>, returnSchema: Schema<ReturnType>, bodySchema: Schema<RequestBodyType>): PutRoute<PathParams, ReturnType, RequestBodyType> {
    return {
        method: 'put',
        getUrl: urlTemplate.getUrl,
        urlTemplate: urlTemplate.urlTemplate,
        validateParams: urlTemplate.validateParams,
        returnSchema,
        bodySchema,
    };
}

export function deleteRoute<PathParams extends string, ReturnType extends HttpResult, RequestBodyType>(urlTemplate: UrlTemplate<PathParams>, returnSchema: Schema<ReturnType>, bodySchema: Schema<RequestBodyType>): DeleteRoute<PathParams, ReturnType, RequestBodyType> {
    return {
        method: 'delete',
        getUrl: urlTemplate.getUrl,
        urlTemplate: urlTemplate.urlTemplate,
        validateParams: urlTemplate.validateParams,
        returnSchema,
        bodySchema,
    };
}

export interface GenericInternalServerError extends HttpResult {
    statusCode: 500;
    body: {
        errorMessage: string;
    };
}
