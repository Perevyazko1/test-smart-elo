import React, {memo, ReactNode} from 'react';
import {Spinner} from 'react-bootstrap'

import {classNames} from "../../lib/classNames/classNames";
import cls from './StickyHeader.module.scss';

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
            className={classNames(cls.stickyHeader, {}, ["bg-light bg-gradient border rounded border-2 border-dark"])}
            data-bs-smooth-scroll="true"
            {...otherProps}
        >
            {loading
                ?
                <Spinner size={'sm'} animation={'grow'} className={'m-0 p-0 mx-3'}/>
                :
                <i className="far fa-arrow-alt-circle-down mx-3"/>
            }

            {children}

            {loading
                ?
                <Spinner size={'sm'} animation={'grow'} className={'m-0 p-0 mx-3'}/>
                :
                <i className="far fa-arrow-alt-circle-down mx-3"/>
            }
        </div>
    );
});