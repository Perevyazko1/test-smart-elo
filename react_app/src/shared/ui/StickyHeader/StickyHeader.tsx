import React, {memo, ReactNode, HTMLAttributes} from 'react';
import {Spinner} from 'react-bootstrap'

import {classNames} from "../../lib/classNames/classNames";
import cls from './StickyHeader.module.scss';

interface StickyHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    loading?: boolean;
    className?: string;
}


export const StickyHeader = memo((props: StickyHeaderProps) => {
    const {
        children,
        loading = false,
        className,
        ...otherProps
    } = props;

    return (
        <div
            className={cls.stickyContainer}
            data-bs-smooth-scroll="true"
            {...otherProps}
        >
            <div
                className={classNames(
                    cls.mainBody,
                    {},
                    ['bg-light bg-gradient border rounded border-2 border-dark']
                )}>

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
        </div>
    );
});