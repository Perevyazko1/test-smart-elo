import Logo from "./UserLogo.png";
import {Employee} from "@entities/Employee";
import {useAppModal, useEmployeeName} from "@shared/hooks";
import {TRANSACTION_DETAILS, TRANSACTION_TYPES} from "@entities/Transaction";

import {StaffTransactionForm} from "../../../StaffTransactionForm/StaffTransactionForm";
import {UserForm} from "@widgets/UserForm";


interface StaffDetailsHeadProps {
    selectedEmployee: Employee;
}


export const StaffDetailsHead = (props: StaffDetailsHeadProps) => {
    const {selectedEmployee} = props;

    const {getNameById} = useEmployeeName();

    const {handleOpen} = useAppModal();

    const showWagesModalClb = (props: {
        transaction_type: keyof typeof TRANSACTION_TYPES,
        details: keyof typeof TRANSACTION_DETAILS,
    }) => {
        handleOpen(
            <StaffTransactionForm
                title={`Создание фин транзакции сотруднику: ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                employee={selectedEmployee}
                transaction_type={props.transaction_type}
                details={props.details}
            />
        )
    };

    const editUserHandle = () => {
        handleOpen(
            <UserForm userId={selectedEmployee.id}/>
        );
    };

    return (
        <div className={'p-1 bg-success-subtle d-flex justify-content-between border border-black'}>
            <img src={Logo} alt="Пользователь" width={100} height={100}/>

            <div className={'flex-fill'}>
                <b>ФИО: </b> {getNameById(selectedEmployee.id, 'full')}
                <br/>
                <b>Отдел: </b> {selectedEmployee.permanent_department?.name || "Не выбран"}
                <br/>
                <b>Форма оплаты: </b> {selectedEmployee.piecework_wages ? ("Сделка") : ("Оклад")}
                <br/>
                <b>Описание: </b> {selectedEmployee.description || 'Без описания.'}
            </div>

            <div className={'d-flex gap-2 p-2'}>
                <div className={'d-flex gap-2 flex-column'}>
                    <button type={'button'}
                            onClick={() => showWagesModalClb(
                                {transaction_type: 'accrual', details: 'wages'}
                            )}
                            className={'appBtn greenBtn p-1 w-100 fw-bold'}
                            style={{minWidth: 110}}
                    >
                        + Начислить
                    </button>
                    <button type={'button'}
                            className={'appBtn redBtn p-1 w-100 fw-bold'}
                            style={{minWidth: 110}}
                            onClick={() => showWagesModalClb({
                                transaction_type: 'debiting',
                                details: 'fine'
                            })}
                    >
                        - Штраф
                    </button>
                </div>

                <div className={'d-flex gap-2 flex-column'}>

                    <button type={'button'}
                            className={'appBtn yellowBtn p-1 w-100 fw-bold'}
                            style={{minWidth: 110}}
                            onClick={() => showWagesModalClb(
                                {transaction_type: 'cash', details: 'wages'}
                            )}
                    >
                        - Выдать
                    </button>

                    <button
                        type={'button'}
                        className={'appBtn blueBtn p-1 w-100 fw-bold'}
                        style={{minWidth: 110}}
                        onClick={editUserHandle}
                    >
                        Изменить
                    </button>
                </div>

            </div>

        </div>
    );
};
