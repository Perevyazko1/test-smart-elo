import {HTMLAttributes} from "react";
import {Spinner} from "react-bootstrap";

interface AppSkeletonProps extends HTMLAttributes<HTMLDivElement> {
    showSpinner?: boolean;
}

export const AppSkeleton = (props: AppSkeletonProps) => {
    const {showSpinner = true, ...otherProps} = props;

    return (
        <div {...otherProps}>
            <div className={'w-100 h-100 rounded bg-secondary px-1'}>
                {showSpinner && <Spinner size={'sm'} animation={'grow'}/>}
            </div>

        </div>
    );
};
