import React, {ChangeEvent, useState} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";

import {Transaction, TRANSACTION_DETAILS, TRANSACTION_TYPES} from "entities/Transaction";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {getEmployeeAuthData} from "entities/Employee";

import {WagesItem} from "../../model/types/types";
import {UseCreateTransaction, UseDeleteTransaction, UseUpdateTransaction} from "../../model/api/api";


interface AddTransactionFormProps {
    employee: WagesItem;
    transaction?: Transaction | null;
}


export const AddTransactionForm = (props: AddTransactionFormProps) => {
    const {
        employee,
        transaction,
    } = props;

    const currentUser = useAppSelector(getEmployeeAuthData);
    const [updateTransaction, {isLoading: isUpdating, data: updatedData}] = UseUpdateTransaction();
    const [deleteTransaction, {isLoading: isDeleting}] = UseDeleteTransaction();

    const getInspectorName = () => {
        if (transaction) {
            return (`${transaction.executor?.first_name} ${transaction.executor?.last_name}`)
        } else {
            return (`${currentUser?.first_name} ${currentUser?.last_name}`)
        }
    }
    const getExecutorName = () => {
        if (transaction) {
            return (`${transaction.executor?.first_name} ${transaction.executor?.last_name}`)
        } else {
            return (`${currentUser?.first_name} ${currentUser?.last_name}`)
        }
    }

    const getEmployeeName = () => {
        if (transaction) {
            return (`${transaction.employee?.first_name} ${transaction.employee?.last_name}`)
        } else {
            return (`${employee?.first_name} ${employee?.last_name}`)
        }
    }

    const [formData, setFormData] = useState<Transaction>({
        transaction_type: transaction ? transaction.transaction_type : 'cash',
        details: transaction ? transaction.details : 'wages',
        amount: transaction ? transaction.amount : '',
        description: transaction ? transaction.description : '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const [createTransaction, {isLoading, isError, error, data}] = UseCreateTransaction();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentUser?.id) {
            try {
                await createTransaction({
                    transactionData: {
                        ...formData,
                        employee_id: employee.id,
                        executor_id: currentUser.id,
                    },
                });

                if (data) {
                    setFormData(data)
                }
                console.log('Transaction created successfully');
            } catch (error) {
                console.error('Error creating transaction:', error);
            }
        }
    };

    const handleConfirm = async () => {
        const id = transaction?.id || formData.id
        if (id && currentUser?.id) {
            try {
                await updateTransaction({
                    id: id,
                    transactionData: {inspector_id: currentUser?.id}
                });

                if (updatedData) {
                    setFormData({...formData, ...updatedData})
                }
            } catch (error) {
                console.error("Ошибка при обновлении транзакции:", error);
            }
        }

    };

    const handleDelete = async () => {
        const id = transaction?.id || formData.id
        if (id) {
            try {
                const response = await deleteTransaction(id);

                alert("Транзакция успешно удалена!");
            } catch (error) {
                console.error("Ошибка при удалении транзакции:", error);
            }
        }
    };

    return (
        <Form className={'p-2'} onSubmit={handleSubmit}>
            {isError && <p>Ошибка создания транзакции!</p>}
            {formData.id && (
                <div>
                    <p>Транзакция успешно создана!</p>
                    <p>Сумма: {formData.amount}</p>
                </div>
            )}
            <Row className="mb-3">
                <Form.Group controlId="add_date" as={Col} md="4">
                    <Form.Label>Дата создания</Form.Label>
                    <Form.Control type="date" name="add_date" value={transaction?.add_date?.slice(0, 10)}
                                  disabled={true}/>
                </Form.Group>

                <Form.Group controlId="inspect_date" as={Col} md="4">
                    <Form.Label>Дата визирования</Form.Label>
                    <Form.Control type="date" name="inspect_date" value={transaction?.inspect_date?.slice(0, 10)}
                                  disabled={true}/>
                </Form.Group>
            </Row>


            <Row className="mb-3">
                <Form.Group controlId="transactionType" as={Col} md="4">
                    <Form.Label>Тип транзакции</Form.Label>
                    <Form.Select name="transaction_type" value={formData.transaction_type}
                                 onChange={handleChange}
                                 disabled={!!transaction}
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
                                 disabled={!!transaction}
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
                                      placeholder="Введите сумму" disabled={!!transaction}
                        />
                        <InputGroup.Text>₽</InputGroup.Text>
                        <InputGroup.Text>0.00</InputGroup.Text>
                    </InputGroup>
                </Form.Group>

                <Form.Group controlId="starting_balance" as={Col} md={'4'}>
                    <Form.Label>Начальный баланс</Form.Label>
                    <InputGroup>
                        <Form.Control type="number" name="starting_balance" disabled={true}
                                      value={transaction ? transaction.starting_balance :
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
                                      value={transaction ? transaction.ending_balance : ""}
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
                    <Form.Control type="text" name="description" value={formData.description} onChange={handleChange}
                                  placeholder="Введите основание" disabled={!!transaction}
                    />
                </Form.Group>
            </Row>

            <Row className="mb-3">
                <Form.Group controlId="employee" as={Col} md="4">
                    <Form.Label>Получатель</Form.Label>
                    <Form.Control type="text" name="employee"
                                  value={getEmployeeName()} disabled={true}
                    />
                </Form.Group>

                <Form.Group controlId="executor" as={Col} md="4">
                    <Form.Label>Транзакцию провел</Form.Label>
                    <Form.Control type="text" name="executor"
                                  value={getExecutorName()} disabled
                    />
                </Form.Group>

                <Form.Group controlId="inspector" as={Col} md="4">
                    <Form.Label>Транзакцию завизировал</Form.Label>
                    <Form.Control type="text" name="inspector" value={getInspectorName()} disabled/>
                </Form.Group>
            </Row>

            <div className={'d-flex gap-3 pt-3'}>
                {!transaction && !formData.id &&
                    < Button type="submit">Создать транзакцию</Button>
                }
                {!transaction?.inspect_date && !formData.inspect_date &&
                    <>
                        <Button variant={'success'} onClick={handleConfirm}>
                            Завизировать
                        </Button>
                        <Button variant={'danger'} onClick={handleDelete}>
                            Удалить
                        </Button>
                    </>
                }
            </div>
        </Form>
    )
}