

export interface ApiList<T> {
    results: T[];
    count: number | undefined;
    next: string | undefined;
    previous: string | undefined;
}