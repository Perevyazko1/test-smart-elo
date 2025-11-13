import {useCurrentUser, useEmployeeName, useQueryParams} from "@shared/hooks";
import {SALARY_URL} from "@shared/consts/serverConfig/serverConfig";
import {useCallback} from "react";


interface WagesInfoProps {
    startDate: string;
    endDate: string;
    is_boss: boolean;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, endDate, is_boss} = props;

    const {queryParameters} = useQueryParams();
    const viewMode = queryParameters.view_mode;

    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();

    const getTargetId = useCallback(() => {
        const numericViewMode = Number(viewMode);
        if (isNaN(numericViewMode)) {
            return currentUser.id;
        }
        if (is_boss) {
            return numericViewMode;
        }
        return currentUser.id;
    }, [viewMode, is_boss, currentUser.id])

    return (
        <div
            className={'pt-2 pb-5 px-2'}
            style={{
                width: '95dvw',
                height: '95dvh',
            }}
        >
            <div className={'mb-2'}>
                Детализация по заработной плате {getNameById(getTargetId(), 'listNameInitials')}
            </div>

            <iframe
                src={`${SALARY_URL}/user_wage/${getTargetId()}/${startDate}/${endDate}/`}
                title="Мои расчеты по зарплате"
                width="100%"
                height="100%"
                style={{border: 'none'}}
            >
                Ваш браузер не поддерживает iframes.
            </iframe>
        </div>
    )
};
