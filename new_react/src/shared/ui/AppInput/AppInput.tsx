import {InputHTMLAttributes, ReactNode} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
    children?: ReactNode;
}


export const AppInput = (props: InputProps) => {
    const {
        className,
        children,
        ...otherProps
    } = props


    return (
        <input
            // style={{maxHeight: '35px', height: '30px'}}
            className={"form-control fw-bold form-control-sm my-auto"}
            {...otherProps}
        >
            {children}
        </input>
    );
};