import type {TableHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";
import {useShowDayPrice} from "@/shared/state/payroll/showDayPrice.ts";
import {useShowEarnedDetail} from "@/shared/state/payroll/showEarnedDetail.ts";

interface PayrollRowDepartmentProps extends TableHTMLAttributes<HTMLTableCellElement> {

}

export const PayrollDepartment = (props: PayrollRowDepartmentProps) => {
    const {children, className = "", ...otherProps} = props;
    const showDayPrice = useShowDayPrice(s => s.showDayPrice);
    const showEarnedDetail = useShowEarnedDetail(s => s.showEarnedDetail);

    const getColSpan = () => {
        let base = 15;
        if (showDayPrice) {
            base += 1;
        }
        if (showEarnedDetail) {
            base += 1;
        }
        return base;
    }

    return (
        <tr className="bg-gray-100 font-bold">
            <td
                className={twMerge([
                    "py-1 px-2 border-b border-gray-300 text-left",
                    className
                ])}
                colSpan={getColSpan()}
                {...otherProps}
            >
                {children}
            </td>
        </tr>
    );
};