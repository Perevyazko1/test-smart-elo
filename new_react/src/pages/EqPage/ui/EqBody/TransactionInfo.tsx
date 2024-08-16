import {Transaction, TRANSACTION_DETAILS, TRANSACTION_TYPES} from "@entities/Transaction";
import {Col, Form, InputGroup, Row} from "react-bootstrap";
import React from "react";
import {getEmployeeName, getHumansDatetime} from "@shared/lib";


interface TransactionInfoProps {
    transaction: Transaction;
}

export const TransactionInfo = (props: TransactionInfoProps) => {
    const {transaction} = props;


    return (
        <div className={'d-flex flex-column'}>
            <h5>
                Информация по транзакции № {transaction.id} за {getHumansDatetime(
                transaction.add_date || "")}
            </h5>
            <Form className={'p-2'} data-bs-theme={'light'}>
                <Row className="mb-3">
                    <Form.Group controlId="add_date" as={Col} md="4">
                        <Form.Label>Дата создания</Form.Label>
                        <Form.Control type="date" name="add_date" value={transaction?.add_date?.slice(0, 10) || ''}
                                      disabled/>
                    </Form.Group>

                    <Form.Group controlId="inspect_date" as={Col} md="4">
                        <Form.Label>Дата визирования</Form.Label>
                        <Form.Control type="date" name="inspect_date"
                                      value={transaction?.inspect_date?.slice(0, 10) || ''}
                                      disabled/>
                    </Form.Group>
                </Row>


                <Row className="mb-3">
                    <Form.Group controlId="transactionType" as={Col} md="4">
                        <Form.Label>Тип транзакции</Form.Label>
                        <Form.Select name="transaction_type" value={transaction.transaction_type}
                                     disabled
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
                        <Form.Select name={'details'} value={transaction.details}
                                     disabled
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
                            <Form.Control type="number" name="amount" value={transaction.amount}
                                          placeholder="Введите сумму" disabled
                            />
                            <InputGroup.Text>₽</InputGroup.Text>
                            <InputGroup.Text>0.00</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="starting_balance" as={Col} md={'4'}>
                        <Form.Label>Начальный баланс</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" name="starting_balance" disabled
                                          value={transaction.starting_balance}
                            />
                            <InputGroup.Text>₽</InputGroup.Text>
                            <InputGroup.Text>0.00</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="ending_balance" as={Col} md={'4'}>
                        <Form.Label>Конечный баланс</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" name="ending_balance"
                                          value={transaction.ending_balance}
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
                        <Form.Control type="text" name="description" value={transaction.description}
                                      placeholder="Введите основание" disabled
                        />
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group controlId="employee" as={Col} md="4">
                        <Form.Label>Получатель</Form.Label>
                        <Form.Control type="text" name="employee"
                                      value={getEmployeeName(transaction.employee)} disabled
                        />
                    </Form.Group>

                    <Form.Group controlId="executor" as={Col} md="4">
                        <Form.Label>Транзакцию провел</Form.Label>
                        <Form.Control type="text" name="executor"
                                      value={getEmployeeName(transaction.executor)} disabled
                        />
                    </Form.Group>

                    <Form.Group controlId="inspector" as={Col} md="4">
                        <Form.Label>Транзакцию завизировал</Form.Label>
                        <Form.Control type="text" name="inspector" value={getEmployeeName(transaction.inspector)}
                                      disabled/>
                    </Form.Group>
                </Row>

            </Form>
        </div>
    );
};
