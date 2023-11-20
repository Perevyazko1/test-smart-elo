import {HTMLAttributes} from "react";

interface AppSkeletonProps extends HTMLAttributes<HTMLDivElement> {

}

export const AppSkeleton = (props: AppSkeletonProps) => {
    const {...otherProps} = props;

    return (
        <div {...otherProps}>
            <div className={'w-100 h-100 rounded bg-secondary'}>

            </div>

        </div>
    );
};
