import {useCurrentUser, useEmployeeName, usePermission, useQueryParams} from "@shared/hooks";
import {SALARY_URL} from "@shared/consts/serverConfig/serverConfig";
import {APP_PERM} from "@shared/consts";
import {useEmployeeList} from "@entities/Employee";
import {useCallback} from "react";


interface WagesInfoProps {
    startDate: string;
    endDate: string;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, endDate} = props;

    const {queryParameters} = useQueryParams();
    const viewMode = queryParameters.view_mode;

    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();
    
    const {data: users} = useEmployeeList({});

    const isAdmin = usePermission(APP_PERM.ADMIN);
    const isWages = usePermission(APP_PERM.WAGES_PAGE);

    const getTargetId = useCallback(() => {
        const numericViewMode = Number(viewMode);
        if (isNaN(numericViewMode)) {
            return currentUser.id;
        }
        const targetUser = users?.find(user => user.id === numericViewMode);
        if (!targetUser) {
            return currentUser.id;
        }
        if (targetUser.boss === currentUser.id || isAdmin || isWages) {
            return targetUser.id;
        }
        return currentUser.id;
    }, [viewMode, users, currentUser.id, isAdmin, isWages])

    return (
        <div
            className={'p-3'}
            style={{
                width: '95dvw',
                height: '95dvh',
            }}
        >
            <div>
                Детализация по заработной плате {getNameById(getTargetId(), 'listNameInitials')}
            </div>
            {currentUser && (
                <iframe
                    src={`${SALARY_URL}/user_wage/${getTargetId()}/${startDate}/${endDate}/`}
                    title="Мои расчеты по зарплате"
                    width="100%"
                    height="100%"
                    style={{border: 'none'}}
                >
                    Ваш браузер не поддерживает iframes.
                </iframe>
            )}
        </div>
    )
};
