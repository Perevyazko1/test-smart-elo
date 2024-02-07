export interface Order {
    id: number;
    project: string;
    moment: string;
    planned_date: string | null;
    number: number;
}