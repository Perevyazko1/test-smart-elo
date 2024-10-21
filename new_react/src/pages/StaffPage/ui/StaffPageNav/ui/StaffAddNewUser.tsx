import {useAppModal} from "@shared/hooks";
import {UserForm} from "@widgets/UserForm";

export const StaffAddNewUser = () => {
    const {handleOpen} = useAppModal();

    const newUserHandle = () => {
        handleOpen(
            <UserForm/>
        );
    };

    return (
        <button className={'appBtn blackBtn fs-7 fw-bold p-1 px-2 rounded'} type={'button'} onClick={newUserHandle}>
            Добавить
        </button>
    );
};
