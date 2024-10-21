import {Spinner} from "react-bootstrap";

import {useQueryParams} from "@shared/hooks";
import {DateRange} from "@pages/TaskPage/model/types";

import {StaffInfoRange} from "../../../../model/types";

import {TableHeadInfo} from "./TableHeadInfo";
import {TableHeadSkeleton} from "./TableHeadSkeleton";


interface StaffTableWeeksProps {
    userInfo: StaffInfoRange | null;
    isLoading: boolean;
    ids: number[];
}


export const StaffTableWeeks = (props: StaffTableWeeksProps) => {
    const {userInfo, isLoading, ids} = props;

    const {setQueryParam} = useQueryParams();

    const setTargetRange = (next_range: DateRange | undefined) => {
        setQueryParam('start_date', next_range?.start_date || "");
        setQueryParam('end_date', next_range?.end_date || "");
    };

    return (
        <>
            <th
                className={"text-center align-middle p-0 bg-success-subtle"}
                style={{width: 30, maxWidth: 30}}
            >
                <div className={'d-flex flex-column gap-2 p-1 justify-content-center h-100'}>
                    <button type={'button'}
                            className={'appBtn w-100 flex-fill'}
                            onClick={() => setTargetRange(userInfo?.I.next_range)}
                    >
                        {isLoading ? (
                            <Spinner animation={'grow'} size={'sm'} className={'my-1'}/>
                        ) : (
                            "⬅️"
                        )}
                    </button>

                    <button type={'button'}
                            className={'appBtn w-100 h-50'}
                            onClick={() => setTargetRange(userInfo?.I.previous_range)}
                    >
                        {isLoading ? (
                            <Spinner animation={'grow'} size={'sm'} className={'my-1'}/>
                        ) : (
                            "➡️"
                        )}
                    </button>

                </div>
            </th>

            {
                userInfo ? (
                    Object.entries(userInfo).map(([key, headInfo]) => (
                        <TableHeadInfo
                            ids={ids}
                            onClick={setTargetRange}
                            key={key}
                            headInfo={headInfo}
                        />
                    ))
                ) : (
                    <>
                        <TableHeadSkeleton/>
                        <TableHeadSkeleton/>
                        <TableHeadSkeleton/>
                        <TableHeadSkeleton/>
                        <TableHeadSkeleton/>
                    </>
                )
            }
        </>
    );
};
