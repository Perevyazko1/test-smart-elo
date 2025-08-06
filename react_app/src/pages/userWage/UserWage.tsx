import {useParams} from "react-router-dom";
import {SalaryDetailWidget} from "@/widgets/salary/detail/SalaryDetailWidget.tsx";
import {SalaryPanel} from "@/pages/salary/panel/SalaryPanel.tsx";
import {useWeeks} from "@/shared/utils/date.ts";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";
import {Navbar} from "@/widgets/navbar/Navbar.tsx";
import React from "react";

export const UserWage = () => {
    const {userId, date_from} = useParams();

    if (!userId || isNaN(Number(userId))) {
        return <div>Invalid user ID provided</div>;
    }

    const {weeks, currentWeek} = useWeeks({initialDateFrom: date_from});

    const canNavigate = usePermission([
        APP_PERM.WAGES_PAGE,
        APP_PERM.ADMIN,
    ]);

    return (
        <div className={'bg-gray-500 min-h-screen'}>
            {canNavigate && (
                <Navbar/>
            )}

            <SalaryPanel
                url={'/user_wage/' + userId}
                weeks={weeks}
                currentWeek={currentWeek}
            />

            {currentWeek && (
                <SalaryDetailWidget
                    selectedUserId={Number(userId)}
                    date_from={currentWeek.date_from}
                    date_to={currentWeek.date_to}
                />
            )}
        </div>
    );
};