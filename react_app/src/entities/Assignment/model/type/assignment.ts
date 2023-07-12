export interface assignment {
    number: number;
    notes: string;
    status: 'in_work' | 'await' | 'ready';
    department: number;
    executor: number | null;
    inspector: number | null;
}