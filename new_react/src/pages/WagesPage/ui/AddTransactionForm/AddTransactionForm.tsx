import React, {ChangeEvent, useEffect, useMemo, useState} from "react";
import {Col, Form, InputGroup, Row} from "react-bootstrap";


import {WagesItem} from "../../model/types/types";
import {UseCreateTransaction, UseDeleteTransaction, UseUpdateTransaction} from "../../model/api/api";
import {Transaction, TRANSACTION_DETAILS, TRANSACTION_TYPES} from "@entities/Transaction";
import {useCurrentUser, useEmployeeName, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";


interface AddTransactionFormProps {
    employee: WagesItem;
    title: string;
    transaction?: Transaction;
    transaction_type?: keyof typeof TRANSACTION_TYPES;
    details?: keyof typeof TRANSACTION_DETAILS;
    deleteClb?: () => void;
}


export const AddTransactionForm = (props: AddTransactionFormProps) => {
    const {
        employee,
        transaction,
        transaction_type,
        details,
        title,
        deleteClb,
    } = props;

    const {currentUser} = useCurrentUser();
    
    const {getNameById} = useEmployeeName();

    const addPermission = usePermission(APP_PERM.WAGES_ADD_TRANSACTION);
    const confirmPermission = usePermission(APP_PERM.WAGES_CONFIRM_TRANSACTION);
    const deletePermissions = usePermission(APP_PERM.WAGES_DELETE_TRANSACTION);

    const initialTransaction: Transaction = {
        transaction_type: transaction_type || 'cash',
        details: details || 'wages',
        amount: '',
        description: '',
    };

    const [formData, setFormData] = useState<Transaction>(transaction || initialTransaction);

    const [updateTransaction, {
        isLoading: isUpdating,
        data: updatedData,
    }] = UseUpdateTransaction();

    const [deleteTransaction, {isLoading: isDeleting}] = UseDeleteTransaction();
    const [createTransaction, {isLoading, isError, data}] = UseCreateTransaction();

    const getEmployeeName = useMemo(() => {
        if (formData.id) {
            return getNameById(formData.employee, 'nameLastName')
        } else {
            return getNameById(employee.id, 'nameLastName')
        }
    }, [employee.id, formData.employee, formData.id, getNameById])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCreate = () => {
        createTransaction({
            transactionData: {
                ...formData,
                employee_id: employee.id,
                executor_id: currentUser.id,
            },
        });
    }

    useEffect(() => {
        if (data?.id) {
            alert('Транзакция успешно создана!');
            setFormData(data);
        }
    }, [data])

    const handleConfirm = async () => {
        if (formData?.id && currentUser?.id) {
            await updateTransaction({
                id: formData.id,
                transactionData: {inspector_id: currentUser?.id}
            });
        }
    };

    useEffect(() => {
        if (updatedData?.id) {
            alert('Транзакция успешно завизирована!');
            setFormData(updatedData);
        }
    }, [updatedData])

    const handleDelete = async () => {
        if (formData?.id) {
            try {
                await deleteTransaction(formData.id);
                alert("Транзакция успешно удалена!");
                deleteClb && deleteClb();
            } catch (error) {
                alert("Ошибка при удалении транзакции!");
                console.error("Ошибка при удалении транзакции:", error);
            }
        }
    };

    return (
        <>
            <h5>{title}</h5>
            <Form className={'p-2'} onSubmit={handleCreate} data-bs-theme={'light'}>
                {isError && <p>Ошибка создания транзакции!</p>}
                <Row className="mb-3">
                    <Form.Group controlId="add_date" as={Col} md="4">
                        <Form.Label>Дата создания</Form.Label>
                        <Form.Control type="date" name="add_date" value={formData?.add_date?.slice(0, 10) || ''}
                                      disabled/>
                    </Form.Group>

                    <Form.Group controlId="inspect_date" as={Col} md="4">
                        <Form.Label>Дата визирования</Form.Label>
                        <Form.Control type="date" name="inspect_date" value={formData?.inspect_date?.slice(0, 10) || ''}
                                      disabled/>
                    </Form.Group>
                </Row>


                <Row className="mb-3">
                    <Form.Group controlId="transactionType" as={Col} md="4">
                        <Form.Label>Тип транзакции</Form.Label>
                        <Form.Select name="transaction_type" value={formData.transaction_type}
                                     onChange={handleChange}
                                     disabled={!!formData.id}
                        >
                            {Object.keys(TRANSACTION_TYPES).map(typeKey => (
                                <option key={typeKey} value={typeKey} className={'fs-7'}>
                                    {TRANSACTION_TYPES[typeKey as keyof typeof TRANSACTION_TYPES]}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group controlId={"transactionDetails"} as={Col} md={'4'}>
                        <Form.Label>Детализация транзакции</Form.Label>
                        <Form.Select name={'details'} value={formData.details}
                                     onChange={handleChange}
                                     disabled={!!formData.id}
                        >
                            {Object.keys(TRANSACTION_DETAILS).map(typeKey => (
                                <option key={typeKey} value={typeKey} className={'fs-7'}>
                                    {TRANSACTION_DETAILS[typeKey as keyof typeof TRANSACTION_DETAILS]}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group controlId="amount" as={Col} md={'4'}>
                        <Form.Label>Сумма</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange}
                                          placeholder="Введите сумму" disabled={!!formData.id}
                            />
                            <InputGroup.Text>₽</InputGroup.Text>
                            <InputGroup.Text>0.00</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="starting_balance" as={Col} md={'4'}>
                        <Form.Label>Начальный баланс</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" name="starting_balance" disabled
                                          value={formData.id ? formData.starting_balance :
                                              employee.current_balance}
                            />
                            <InputGroup.Text>₽</InputGroup.Text>
                            <InputGroup.Text>0.00</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="ending_balance" as={Col} md={'4'}>
                        <Form.Label>Конечный баланс</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" name="ending_balance"
                                          value={formData.id ? formData.ending_balance : ""}
                                          disabled
                            />
                            <InputGroup.Text>₽</InputGroup.Text>
                            <InputGroup.Text>0.00</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group controlId="description" as={Col} md={'12'}>
                        <Form.Label>Основание начисления</Form.Label>
                        <Form.Control type="text" name="description" value={formData.description}
                                      onChange={handleChange}
                                      placeholder="Введите основание" disabled={!!formData.id}
                        />
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group controlId="employee" as={Col} md="4">
                        <Form.Label>Получатель</Form.Label>
                        <Form.Control type="text" name="employee"
                                      value={getEmployeeName} disabled={true}
                        />
                    </Form.Group>

                    <Form.Group controlId="executor" as={Col} md="4">
                        <Form.Label>Транзакцию провел</Form.Label>
                        <Form.Control type="text" name="executor"
                                      value={getNameById(formData.executor, "nameLastName")} disabled
                        />
                    </Form.Group>

                    <Form.Group controlId="inspector" as={Col} md="4">
                        <Form.Label>Транзакцию завизировал</Form.Label>
                        <Form.Control type="text" name="inspector" value={getNameById(formData.inspector, 'nameLastName')} disabled/>
                    </Form.Group>
                </Row>

                <div className={'d-flex gap-3 pt-3'}>
                    {!transaction && !formData.id && addPermission &&
                        <button
                            className={'p-1 appBtn greyBtn px-2 text-black'}
                            onClick={handleCreate}
                            disabled={isLoading}
                        >
                            Создать транзакцию
                        </button>
                    }
                    {!transaction?.inspect_date && !formData.inspect_date &&
                        <>
                            {confirmPermission &&
                                <button
                                    className={'p-1 appBtn greenBtn px-2 text-black'}
                                    onClick={handleConfirm}
                                    disabled={isUpdating}
                                >
                                    Завизировать
                                </button>
                            }
                            {deletePermissions &&
                                <button
                                    className={'p-1 appBtn redBtn px-2 text-black'}
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    Удалить
                                </button>
                            }
                        </>
                    }
                </div>
            </Form>
        </>
    )
}