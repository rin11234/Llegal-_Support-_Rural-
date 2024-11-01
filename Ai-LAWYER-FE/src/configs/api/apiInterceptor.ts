import axios from 'axios';
import type {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from './apiResponses';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from 'utils/localStorageUtils';

class AuthUtils {
    private static refreshingToken: Promise<AxiosResponse> | undefined = undefined;

    static async refreshToken(config?: AxiosRequestConfig<null>) {
        if (!this.refreshingToken) {
            this.refreshingToken = axios
                .post(`auth/refresh-token`, undefined, config)
                .finally(() => (this.refreshingToken = undefined));
        }
        return this.refreshingToken;
    }
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value || defaultValue!;
};

export const apiRequestInterceptor = (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    const keyStoreAccessToken = getEnvVariable('REACT_APP_API_KEY_STORE_ACCESS_TOKEN');
    const headerKey = getEnvVariable('REACT_APP_API_ACCESS_TOKEN_HEADER', 'Authorization');
    const token = getLocalStorageItem(keyStoreAccessToken) as string;
    if (token) config.headers[headerKey] = `${token}`;
    return config;
};

export const apiFailureRequestInterceptor = async (error: unknown) => {
    return Promise.resolve(error);
};

export const apiSuccessResponseInterceptor = async (
    response: AxiosResponse
): Promise<AxiosResponse['data']> => {
    return response.data;
};

export const apiFailureResponseInterceptor = async (error: AxiosError) => {
    if (error.response) {
        if (error.response.status === 401) {
            try {
                const config = error.response.config;
                const res = await AuthUtils.refreshToken(config);
                const { accessToken } = res.data;
                const key = getEnvVariable('REACT_APP_API_KEY_STORE_ACCESS_TOKEN');
                setLocalStorageItem(key, accessToken);
                const headerKey = getEnvVariable('REACT_APP_API_ACCESS_TOKEN_HEADER', 'Authorization');
                config.headers[headerKey] = `${accessToken}`;
                return await axios.request(config);
            } catch (_err) {
                removeLocalStorageItem(getEnvVariable('REACT_APP_API_KEY_STORE_ACCESS_TOKEN'));
                Object.assign(error, _err);
            }
        }

        const dataErr = error.response.data as ApiResponse;
        const message = dataErr.metadata.message;
        const _error = dataErr.metadata.error;
        const errMessage =
            _error?.message ?? message ?? 'Internal Server Response Format Error';
        const responseError = {
            message: errMessage,
            code: _error?.code ?? 'AE-APP-5000',
            action: _error?.action ?? 'DEFAULT',
            title: _error?.title ?? ' "Internal server error",',
            errorType: _error?.errorType ?? 'INTERNAL_ERROR',
        };

        return Promise.reject({ ...error, ...responseError });
    } else if (error.request) {
        console.error('Request Error ', error.request);
    } else {
        //
    }

    return Promise.reject(error);
};
