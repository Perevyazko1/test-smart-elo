import type {TableHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface PayrollRowDepartmentProps extends TableHTMLAttributes<HTMLTableCellElement> {

}

export const PayrollDepartment = (props: PayrollRowDepartmentProps) => {
    const {children, className = "", ...otherProps} = props;

    return (
        <tr className="bg-gray-100 font-bold">
            <td
                className={twMerge([
                    "py-1 px-2 border-b border-gray-300 text-left",
                    className
                ])}
                colSpan={9}
                {...otherProps}
            >
                {children}
            </td>
        </tr>
    );
};