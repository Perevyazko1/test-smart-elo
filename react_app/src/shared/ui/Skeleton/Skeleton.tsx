import React from 'react';
import {Container} from "react-bootstrap";
import {Mods} from "shared/lib/classNames/classNames";
import {FixedSizeList as List} from 'react-window';

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


export const Skeleton = (props: SkeletonProps) => {
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
    } = props;

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

    const skeleton = () => (
        // <Placeholder
        //     as="div"
        //     // animation="glow"
        //     className={'p-0 w-100'}
        // >
        //     <Placeholder style={{height: height, width: width}}
        //                  className={classNames('', mods, [className])}
        //                  {...otherProps}
        //     />
        // </Placeholder>
        <Container fluid className={'w-100 bg-secondary rounded'} style={{height: '120px'}}>

        </Container>
    )

    if (getSkeletonCount() === 1) {
        return skeleton()
    } else {
        const repeatedElementsArray = Array(getSkeletonCount()).fill(skeleton)
        return (
            <>
                {repeatedElementsArray.map((element, index) => (
                    <div key={index} className={'p-0 mb-1'}>
                        {element}
                    </div>
                ))}
            </>
        )
    }
};