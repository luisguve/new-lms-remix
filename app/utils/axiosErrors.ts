// Note: This file assumes axios is installed. If not, you may need to install it:
// npm install axios

import { AxiosError } from "axios";

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

interface StrapiErrorDetails {
    redirectToLogin?: boolean;
}

interface StrapiErrorObject {
    status?: number;
    name?: string;
    message?: string;
    details?: StrapiErrorDetails;
}

interface StrapiErrorData {
    data: unknown;
    error?: StrapiErrorObject;
}

export function getStrapiError(err: unknown): string {
    if (isAxiosError(err)) {
        const { response } = err;
        if (
            response &&
            response.data &&
            (response.data as StrapiErrorData).error
        ) {
            const strapiError = (response.data as StrapiErrorData).error;
            if (strapiError && typeof strapiError.message === "string") {
                return strapiError.message;
            }
        }
    }
    console.error("Unknown error:", err);
    return "";
}

export function getStrapiErrorDetails(err: unknown): StrapiErrorDetails | null {
    if (isAxiosError(err)) {
        const { response } = err;
        if (
            response &&
            response.data &&
            (response.data as StrapiErrorData).error
        ) {
            const strapiError = (response.data as StrapiErrorData).error;
            if (strapiError && strapiError.details) {
                return strapiError.details;
            }
        }
    }
    console.error("Unknown error details:", err);
    return null;
}

