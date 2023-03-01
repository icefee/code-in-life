declare module "*.module.css";

declare interface ApiJsonType<T = unknown> {
    code: number;
    data: T | null;
    msg: string;
}

interface ToastMsg<T = unknown> {
    msg: string;
    type: T;
}

interface SearchTask<T = unknown> {
    keyword?: string;
    data: T[];
    pending: boolean;
    complete: boolean;
    success: boolean;
}
