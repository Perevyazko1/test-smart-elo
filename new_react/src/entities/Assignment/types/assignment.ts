import {Employee} from "@entities/Employee";
import {Department} from "@entities/Department";
import {Tariff} from "@entities/Tariff";

export interface BaseAssignment {
    id: number;
    number: number;
    notes: string;
    status: 'in_work' | 'await' | 'ready' | 'created';
    department: number;
    executor: number;
    inspector: number;
    tariff: number;
}

type ExtendedFields = 'department' | 'executor' | 'inspector' | 'tariff';

export interface Assignment extends Omit<BaseAssignment, ExtendedFields> {
    executor: Employee;
    inspector: Employee;
    department: Department;
    tariff: Tariff;
}