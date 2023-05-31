import React, {memo, ReactNode} from 'react';
import {Spinner} from 'react-bootstrap'

interface StickyHeaderProps {
    children?: ReactNode
    loading?: boolean
}


export const StickyHeader = memo((props: StickyHeaderProps) => {
    const {
        children,
        loading = false,
        ...otherProps
    } = props

    return (
        <div
            className="fw-bold bg-light bg-gradient border rounded border-2 border-dark d-flex justify-content-xl-center align-items-xl-center"
            style={{top: "0", position: "sticky", margin: "0", padding: "0", zIndex: "999"}}
            data-bs-smooth-scroll="true"
            {...otherProps}
        >
            {loading
                ?
                <Spinner size={'sm'} animation={'grow'} className={'m-0 p-0 mx-xl-3'}/>
                :
                <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
            }

            {children}

            {loading
                ?
                <Spinner size={'sm'} animation={'grow'} className={'m-0 p-0 mx-xl-3'}/>
                :
                <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
            }
        </div>
    );
});