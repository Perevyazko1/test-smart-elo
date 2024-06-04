import {Department} from "@entities/Department";
import {Employee} from "@entities/Employee";

interface Tariff {
    id: number;
    amount: number;
    add_date: string;
    created_by: Employee;
    comment: string;
}

export interface TarifficationAssignments {
    id: number;
    number: number;
    department: Department;
    date_completion: string;
    appointment_date: string;
    inspect_date: string;
    status: string;
    project: string;
    order_number: string;
    executor: Employee;
    inspector: Employee;
}

export interface PostTarifficationData {
    id: number;
    department: Department;
    product_name: string;
    product_thumbnails: string[];
    assignments: TarifficationAssignments[];
    proposed_tariff: Tariff;
}

export interface PostTarifficationSchema {
    isLoading: boolean;
    hasUpdated: boolean;
    data?: PostTarifficationData;
}