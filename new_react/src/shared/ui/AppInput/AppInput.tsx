import {InputHTMLAttributes, ReactNode, useId, useMemo} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    children?: ReactNode;
}


export const AppInput = (props: InputProps) => {
    const {
        className,
        ...otherProps
    } = props;

    const id: string = useId();

    const inputId = useMemo(() => {
        const date: string = new Date().toISOString();
        return id + date;
    }, [id]);

    return (
        <input
            id={inputId}
            className={"form-control form-control-sm my-auto rounded-0 " + className}
            {...otherProps}
        />
    );
};
