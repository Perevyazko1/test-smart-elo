import React, {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";

import {BaseEmployee, Employee, useEmployeeList} from "@entities/Employee";
import {AppSelect, AppSwitch} from "@shared/ui";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {useCreateUser, useUpdateUser} from "../model/api/api";
import {APP_PERM} from "@shared/consts";


interface UserFormProps {
    userId?: number;
}

type excludeUserFields =
    'username' |
    'boss' |
    'current_department' |
    'favorite_users' |
    'groups' |
    'current_balance' |
    'token';

interface UpdateUser extends Omit<Employee, excludeUserFields> {

}


export const UserForm = (props: UserFormProps) => {
    const {userId} = props;
    
    const {data, isLoading} = useEmployeeList({user_departments_only: true});
    
    const user = useMemo(() => {
        return data?.find(user => user.id === userId)
    }, [data, userId]);

    const [showPinCode, setShowPinCode] = useState(false);

    const initialData: Partial<UpdateUser> = user ? {} : {
        is_active: true,
        piecework_wages: false,
    }

    const [userData, setUserData] = useState<Partial<UpdateUser>>(initialData);

    const [createUser, {isLoading: isCreating, error: createError}] = useCreateUser();
    const [updateUser, {isLoading: isUpdating, error: updateError}] = useUpdateUser();

    const {currentUser} = useCurrentUser();
    const isAdmin = usePermission(APP_PERM.ADMIN);

    const disabled = useMemo(() => {
        return isCreating || isUpdating || isLoading;
    }, [isCreating, isLoading, isUpdating]);

    const setFormDataClb = <K extends keyof UpdateUser>(key: K, value: UpdateUser[K]) => {
        setUserData((prevFormData) => {
            const newFormData = {...prevFormData};

            if (user) {
                if (user[key] !== value) {
                    newFormData[key] = value;
                } else {
                    delete newFormData[key];
                }
            } else {
                newFormData[key] = value;
            }

            return newFormData;
        });
    };

    const getFormValue = useCallback(<K extends keyof UpdateUser>(key: K, defaultValue: any) => {
        return userData[key] !== undefined
            ?
            userData[key] || defaultValue
            :
            user
                ?
                user[key] || defaultValue
                : defaultValue;
    }, [user, userData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        setFormDataClb(name as keyof UpdateUser, value);
    };

    const submitHandle = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updateData: Partial<BaseEmployee> = {
            ...(userData.last_name !== undefined && {
                last_name: userData.last_name
            }),
            ...(userData.first_name !== undefined && {
                first_name: userData.first_name
            }),
            ...(userData.patronymic !== undefined && {
                patronymic: userData.patronymic
            }),
            ...(userData.pin_code !== undefined && {
                pin_code: userData.pin_code
            }),
            ...(userData.description !== undefined && {
                description: userData.description
            }),
            ...(userData.piecework_wages !== undefined && {
                piecework_wages: userData.piecework_wages
            }),
            ...(userData.is_active !== undefined && {
                is_active: userData.is_active
            }),
            ...(userData.departments !== undefined && {
                departments: userData.departments.map(item => item.id)
            }),
            ...(userData.permanent_department !== undefined && {
                permanent_department: userData.permanent_department?.id
            }),
        }

        if (user?.id) {
            updateUser({
                id: user.id,
                data: updateData
            }).then(() => alert('Пользователь успешно изменен!'))
        } else {
            createUser(updateData).then(() => alert('Пользователь успешно создан!'))
        }
    }


    return (
        <Form className={'p-3'} onSubmit={submitHandle} data-bs-theme={'light'}>
            {(createError || updateError) &&
                <p>
                    Ошибка создания создания / обновления пользователя. Проверьте поля или обратитесь к
                    администратору
                </p>
            }
            <Row className={'mb-3'}>
                <Form.Group controlId="last_name" as={Col} md={'4'}>
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control type="text"
                                  name="last_name"
                                  value={getFormValue('last_name', '')}
                                  onChange={handleChange}
                                  required
                                  placeholder="Фамилия"
                    />
                </Form.Group>

                <Form.Group controlId="name" as={Col} md={'4'}>
                    <Form.Label>Имя</Form.Label>
                    <Form.Control type="text"
                                  name="first_name"
                                  value={getFormValue('first_name', '')}
                                  onChange={handleChange}
                                  required
                                  placeholder="Имя"
                    />
                </Form.Group>


                <Form.Group controlId="patronymic" as={Col} md={'4'}>
                    <Form.Label>Отчество</Form.Label>
                    <Form.Control type="text"
                                  name="patronymic"
                                  value={getFormValue('patronymic', '')}
                                  onChange={handleChange}
                                  placeholder="Отчество"
                    />
                </Form.Group>
            </Row>

            <Row className={'mb-3'}>
                <Form.Group controlId="name" as={Col} md={'8'}>
                    <Form.Label>Отделы</Form.Label>

                    <AppSelect
                        bordered
                        variant={'multiple'}
                        value={getFormValue('departments', [])}
                        options={currentUser.departments}
                        getOptionLabel={option => option.name}
                        readOnly={disabled}
                        colorScheme={'lightInput'}
                        onSelect={newValue => setFormDataClb("departments", newValue)}
                    />
                </Form.Group>

                <Form.Group controlId="last_name" as={Col} md={'4'}>
                    <Form.Label>Постоянный отдел</Form.Label>
                    <AppSelect
                        bordered
                        variant={'select'}
                        value={getFormValue('permanent_department', null)}
                        options={currentUser.departments}
                        getOptionLabel={option => option ? option.name : ""}
                        colorScheme={'lightInput'}
                        readOnly={disabled}
                        onSelect={newValue => setFormDataClb("permanent_department", newValue)}
                    />
                </Form.Group>
            </Row>

            <Row className="mb-3">
                <Form.Group controlId="pin_code" as={Col} md={'4'}>
                    <Form.Label>Пин-Код</Form.Label>
                    <InputGroup>
                        <input
                            className={"form-control" + (showPinCode ? "" : " password-field")}
                            type="text"
                            name="pin_code"
                            placeholder="ПИН-код (6 цифр)"
                            title="Разрешено использовать только цифры"
                            pattern="[0-9]+$"
                            autoFocus
                            disabled={disabled}
                            inputMode="numeric"
                            maxLength={6}
                            minLength={6}
                            required
                            autoComplete="new-password"
                            onChange={handleChange}
                            value={getFormValue('pin_code', "")}
                        />
                        <Button
                            onMouseDown={() => setShowPinCode(true)}
                            disabled={!isAdmin}
                            onMouseUp={() => setShowPinCode(false)}
                            variant={'outline-dark'}
                        >
                            👁️
                        </Button>
                    </InputGroup>
                </Form.Group>

                <Form.Group controlId="is_active" as={Col} md={'4'}>
                    <Form.Label>Активный</Form.Label>
                    <InputGroup className={'pt-2'}>
                        <AppSwitch
                            checked={getFormValue('is_active', false)}
                            disabled={disabled}
                            onSwitch={newValue => setFormDataClb("is_active", newValue)}
                            handleContent={''}
                            label={getFormValue('is_active', false) ? 'Активен' : 'Уволен'}
                        />
                    </InputGroup>
                </Form.Group>

                <Form.Group controlId="piecework_wages" as={Col} md={'4'}>
                    <Form.Label>Форма оплаты труда</Form.Label>
                    <InputGroup className={'pt-2'}>
                        <AppSwitch
                            checked={getFormValue('piecework_wages', false)}
                            disabled={disabled}
                            onSwitch={newValue => setFormDataClb("piecework_wages", newValue)}
                            handleContent={''}
                            label={getFormValue('piecework_wages', false) ? "Сделка" : "Оклад"}
                        />
                    </InputGroup>
                </Form.Group>

            </Row>

            <Row className={'mb-3'}>
                <Form.Group controlId="last_name" as={Col} md={'12'}>
                    <Form.Label>Описание</Form.Label>
                    <Form.Control type="text"
                                  name="description"
                                  disabled={disabled}
                                  value={getFormValue('description', '')}
                                  onChange={handleChange}
                                  placeholder="Описание"
                    />
                </Form.Group>
            </Row>

            <button
                type={'submit'}
                disabled={disabled}
                className={'appBtn p-1 px-2 blueBtn'}
            >
                {user ? 'Изменить' : 'Создать'}
            </button>
        </Form>
    );
};
