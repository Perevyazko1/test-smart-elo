import {useCurrentUser, useEmployeeName} from "@shared/hooks";
import {SALARY_URL} from "@shared/consts/serverConfig/serverConfig";


interface WagesInfoProps {
    startDate: string;
    endDate: string;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, endDate} = props;

    const {currentUser} = useCurrentUser();
    const {getNameById} = useEmployeeName();

    return (
        <div
            className={'p-3'}
            style={{
                width: '95dvw',
                height: '95dvh',
            }}
        >
            <div>
                Детализация по заработной плате {getNameById(currentUser.id, 'listNameInitials')}
            </div>
            {currentUser && (
                <iframe
                    src={`${SALARY_URL}/user_wage/${currentUser.id}/${startDate}/${endDate}/`}
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
