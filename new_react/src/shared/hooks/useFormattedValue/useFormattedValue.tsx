import {useCallback} from "react";


export interface FormattedValue {
    strValue: string;
    intValue: number | null;
}


export const useFormattedValue = () => {
    const formatValue = useCallback((
        value: string | number | null | undefined,
        numberOnly?: boolean): FormattedValue => {
        if (value == null) {
            return {
                strValue: '',
                intValue: null,
            };
        }

        const intValue = typeof value === 'string'
            ? parseInt(value.replace(/\s+/g, ''), 10)
            : value;

        if (isNaN(intValue)) {
            return {
                strValue: '',
                intValue: null,
            };
        }

        const isPositive = intValue >= 0;
        const formattedValue = Math.abs(intValue).toLocaleString('ru-RU');
        const strValue = (intValue === 0 || numberOnly)
            ? formattedValue // Если 0, возвращаем только само число без знака
            : `${isPositive ? '➕' : '➖'}${formattedValue}`
        ;

        return {
            strValue,
            intValue,
        };
    }, []);

    return {formatValue};
}