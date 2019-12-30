declare type Dictionary<T> = {
    [index: string]: T;
};
declare type ErrorInfo = {
    type: string;
    message: string;
    params?: string[];
    code?: string;
};
declare type ErrorExtendedInfo = Dictionary<any>;
declare type ErrorManager = {
    (...args: any[]): errorset.MMOError;
    [key: string]: (...args: any[]) => errorset.MMOError;
};
declare type CreateErrorType = {
    (type: string): void;
    (typeDef: ErrorInfo): void;
    (typeDefs: ErrorInfo[]): void;
    (type: string, message: string): void;
    (type: string, message: string, code: string): void;
    (type: string, message: string, code: string, params: string[]): void;
    (type: string, code: string, params: string[]): void;
    (type: string, code: string): void;
};
declare function errorset(source: string): ErrorManager;
declare namespace errorset {
    interface MMOError extends Error {
        readonly type: string;
        readonly source: string;
        readonly info: ErrorExtendedInfo;
        readonly code: string;
    }
    const createErrorType: CreateErrorType;
    function setCodes(codes: Dictionary<string>): void;
}
export default errorset;
