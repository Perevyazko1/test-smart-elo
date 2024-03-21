import {HTMLAttributes} from "react";
import {Spinner} from "react-bootstrap";

interface AppSkeletonProps extends HTMLAttributes<HTMLDivElement> {

}

export const AppSkeleton = (props: AppSkeletonProps) => {
    const {...otherProps} = props;

    return (
        <div {...otherProps}>
            <div className={'w-100 h-100 rounded bg-secondary px-1'}>
                <Spinner size={'sm'} animation={'grow'}/>
            </div>

        </div>
    );
};
