import {HTMLAttributes} from "react";

interface AppContentProps extends HTMLAttributes<HTMLDivElement> {

}

export const AppContent = (props: AppContentProps) => {
    const {children, ...otherProps} = props;

    return (
        <div className={'d-flex justify-content-center'}>
            <div style={{
                maxWidth: 2400,
                minWidth: 1280,
            }}
                 {...otherProps}
            >
                {children}
            </div>
        </div>
    );
};