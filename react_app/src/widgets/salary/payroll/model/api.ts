import {type AxiosResponse} from "axios";
import {$axios} from "@/shared/api";
import type {IPayroll, IPayrollRow} from "@/entities/salary";

interface IGetPayrollProps {
    date_from: string;
}

interface IGetPayrollRowsProps {
    payroll_id: number;
}

export interface IUpdatePayrollRow {
    id: number;
    cash_payout?: number;
    comment?: string;
    is_locked?: boolean;
}


class PayrollService {
    getPayroll(props: IGetPayrollProps): Promise<AxiosResponse<IPayroll | null>> {
        return $axios.get<IPayroll | null>(
            `/salary/payrolls/${props.date_from}/`,
        );
    }

    updatePayroll(props: Partial<IPayroll>): Promise<AxiosResponse<IPayroll>> {
        const {id, ...otherProps} = props;
        return $axios.patch<IPayroll>(
            `/salary/payrolls/${props.date_from}/`,
            {...otherProps}
        )
    }

    createNewPayroll(props: IGetPayrollProps) {
        return $axios.post(
            `/salary/create_new_payroll/`,
            props,
        );
    }

    getPayrollRows(props: IGetPayrollRowsProps): Promise<AxiosResponse<IPayrollRow[] | null>> {
        return $axios.get<IPayrollRow[] | null>(
            `/salary/payrolls_rows/?payroll=${props.payroll_id}`,
        );
    }

    updatePayrollRow(props: IUpdatePayrollRow): Promise<AxiosResponse<IPayrollRow>> {
        const {id, ...otherProps} = props;
        return $axios.patch<IPayrollRow>(
            `/salary/payrolls_rows/${props.id}/`,
            {...otherProps}
        )
    }

    closePayrollRow(props: {payroll_row_id: number}): Promise<AxiosResponse<IPayrollRow>> {
        const {payroll_row_id} = props;
        return $axios.post<IPayrollRow>(
            `/salary/close_payroll_row/`,
            {payroll_row_id}
        );
    }
}

export const payrollService = new PayrollService();
