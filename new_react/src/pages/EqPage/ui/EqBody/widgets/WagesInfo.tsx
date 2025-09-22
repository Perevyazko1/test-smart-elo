import {useCurrentUser, useEmployeeName, usePermission, useQueryParams} from "@shared/hooks";
import {SALARY_URL} from "@shared/consts/serverConfig/serverConfig";
import {APP_PERM} from "@shared/consts";
import {useEmployeeList} from "@entities/Employee";
import {useCallback, useState} from "react";


interface WagesInfoProps {
    startDate: string;
    endDate: string;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, endDate} = props;

    const {queryParameters} = useQueryParams();
    const viewMode = queryParameters.view_mode;
    const [pinCode, setPinCode] = useState<number | null>(null);

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
            className={'pt-2 pb-5 px-2'}
            style={{
                width: '95dvw',
                height: '95dvh',
            }}
        >
            <div className={'mb-2'}>
                Детализация по заработной плате {getNameById(getTargetId(), 'listNameInitials')}
            </div>

            {(Number(pinCode) === Number(currentUser.pin_code)) ? (
                <iframe
                    src={`${SALARY_URL}/user_wage/${getTargetId()}/${startDate}/${endDate}/`}
                    title="Мои расчеты по зарплате"
                    width="100%"
                    height="100%"
                    style={{border: 'none'}}
                >
                    Ваш браузер не поддерживает iframes.
                </iframe>
            ) : (
                <div className={'d-flex flex-column gap-4 justify-content-center align-items-center pt-5'}>
                    <div className={'fs-3'}>Переход на страницу Зарплаты</div>
                    <div className={'fs-3'}>Введите ПИН-КОД ЭЛО</div>
                    {pinCode && pinCode > 99999 ? (
                        <div className={'text-danger fw-bold'}>
                            Неверный код
                        </div>) : null}
                    <input
                        className={"password-field form-control text-center form-control-lg my-2 w-25"}
                        type="text"
                        placeholder="ПИН-код (6 цифр)"
                        title="Разрешено использовать только цифры"
                        pattern="[0-9]+$"
                        autoFocus
                        inputMode="numeric"
                        maxLength={6}
                        minLength={6}
                        required
                        autoComplete="new-password"
                        onChange={(e) => setPinCode(Number(e.target.value))}
                    />
                </div>
            )}
        </div>
    )
};
