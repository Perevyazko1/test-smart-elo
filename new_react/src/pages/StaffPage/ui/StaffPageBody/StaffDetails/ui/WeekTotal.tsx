import {Table} from "react-bootstrap";

import {StaffInfo} from "../../../../model/types";

import {StaffTableWeeks} from "../../StaffTable/ui/StaffTableWeeks";


interface WeekTotalProps {
    isLoading: boolean;
    userInfo: StaffInfo | undefined;
}

export const WeekTotal = (props: WeekTotalProps) => {
    const {userInfo, isLoading} = props;

    return (
        <Table size={'sm'} bordered hover className={'border border-black'}>
            <thead>
            <tr>
                <StaffTableWeeks
                    isLoading={isLoading}
                    ids={userInfo?.id ? [userInfo?.id] : []}
                    userInfo={userInfo?.user_total_info || null}
                />
            </tr>
            </thead>
        </Table>
    );
};
