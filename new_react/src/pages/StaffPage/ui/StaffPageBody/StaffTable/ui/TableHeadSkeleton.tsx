import {AppSkeleton} from "@shared/ui";

export const TableHeadSkeleton = () => {

    return (
        <th className={'align-top'}>
            <div className={'h-50'}>
                <AppSkeleton style={{height: 14, minWidth: 100}} showSpinner={false}/>
                <hr className={'m-1 p-0'}/>
            </div>
            <div className={'d-flex gap-1 flex-column h-50 p-1'}>
                <AppSkeleton style={{height: 13}} showSpinner={false}/>
                <AppSkeleton style={{height: 13}} showSpinner={false}/>
            </div>
        </th>
    );
};
