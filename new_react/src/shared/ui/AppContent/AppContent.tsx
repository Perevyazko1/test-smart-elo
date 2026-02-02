import {HTMLAttributes} from "react";

interface AppContentProps extends HTMLAttributes<HTMLDivElement> {

}

export const AppContent = (props: AppContentProps) => {
    const {children, ...otherProps} = props;

    return (
        <div className={'d-flex justify-content-center'} data-bs-theme={'light'}>
            <div style={{
                maxWidth: 2400,
                minWidth: 1280,
                maxHeight: "calc(100dvh - 50px)",
                overflowY: "auto",
            }}
                 {...otherProps}
            >
                {children}
            </div>
        </div>
    );
};