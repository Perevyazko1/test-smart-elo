import {memo, ReactNode} from 'react';

interface StickyHeaderProps {
    children?: ReactNode
}


export const StickyHeader = memo((props: StickyHeaderProps) => {
    const {
        children,
        ...otherProps
    } = props

    return (
            <div
                className="fw-bold bg-light bg-gradient border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"
                style={{top: "0", position: "sticky", margin: "0", padding: "0", zIndex: "999"}}
                data-bs-smooth-scroll="true"
                {...otherProps}
            >
                <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
                {children}
                <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
            </div>
    );
});