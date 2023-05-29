import React, {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Placeholder} from "react-bootstrap";

interface SkeletonProps {
    className?: string;
    all_size?: number;
    current_size?: number;
    pagination_size?: number;
    rounded?: boolean;
    width: string;
    height: string;
    scaled?: boolean;
}


export const Skeleton = memo((props: SkeletonProps) => {
    const {
        className,
        all_size = 0,
        current_size = 0,
        pagination_size = 0,
        rounded = true,
        width = '100%',
        height = '100px',
        scaled = false,
        ...otherProps
    } = props

    const getSkeletonCount = () => {
        if (all_size && current_size) {
            if (all_size - current_size > pagination_size) {
                return pagination_size
            } else {
                return all_size - current_size
            }
        } else if (pagination_size) {
            return pagination_size
        } else {
            return 1
        }
    }

    const mods: Mods = {
        'rounded': rounded,
        'scaled': scaled,
    };

    const skeleton = (
        <Placeholder as="div" animation="wave">
            <Placeholder style={{height: height, width: width}}
                         className={classNames('', mods, [className])}
                         {...otherProps}
            />
        </Placeholder>
    )
    
    if (getSkeletonCount() === 1) {
        return skeleton
    } else {
        const repeatedElementsArray = Array(getSkeletonCount()).fill(skeleton)
        return (
            <>
                {repeatedElementsArray.map((element, index) => (
                    <div key={index}>
                        {element}
                    </div>
                ))}
            </>
        )
    }
});