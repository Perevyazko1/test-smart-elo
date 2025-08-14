import {Controller, useFormContext} from "react-hook-form";
import {NumericFormat} from 'react-number-format';
import {twMerge} from 'tailwind-merge';
import type {FocusEvent} from "react";
import type {InputHTMLAttributes} from "react";
import {useShowCoins} from "@/shared/state/payroll/showCoins.ts";

interface PriceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'> {
    name: string;
}

export const PriceInputForm = (props: PriceInputProps) => {
    const {name, className, onBlur, onFocus, disabled} = props;
    const {control} = useFormContext();
    const showCoins = useShowCoins(s => s.showCoins);


    return (
        <Controller
            name={name}
            control={control}
            render={({field: {onChange, onBlur: rhfOnBlur, value, ref}}) => (
                <NumericFormat
                    getInputRef={ref}
                    value={(value ?? 0) / 100}
                    onValueChange={(values) => {
                        const cents = Math.round((parseFloat(values.value || '0') || 0) * 100);
                        onChange(cents);
                    }}
                    onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        rhfOnBlur(); // react-hook-form blur
                        onBlur?.(e); // custom blur
                    }}
                    onFocus={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.select();
                        onFocus?.(e);
                    }}
                    decimalScale={showCoins ? 2 : 0}
                    fixedDecimalScale
                    allowNegative={false}
                    thousandSeparator=" "
                    decimalSeparator=","
                    placeholder="0,00"
                    className={twMerge(
                        'font-mono border-none text-end p-2',
                        !value && "text-gray-300",
                        className
                    )}
                    type="text"
                    disabled={disabled}
                />
            )}
        />
    );
};
