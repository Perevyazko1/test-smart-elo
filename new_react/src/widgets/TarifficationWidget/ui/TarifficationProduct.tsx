import React, {useState} from "react";
import {Button, Table} from "react-bootstrap";

import Image from "./Стул.png";

import {AppInput} from "@shared/ui";

export const TarifficationProduct = () => {
    const [proposedInput, setProposedInput] = useState<number | "">(
        650
    );

    return (

        <div className={'d-flex'}>
            <div className={'m-1 bg-light border border-1 rounded p-1'}>
                <img src={Image} alt={"logo"} style={{maxWidth: "150px", maxHeight: "150px"}}/>
            </div>

            <div className={'m-1 bg-light border border-1 rounded p-1'}>
                <Table data-bs-theme={'light'} striped bordered hover size="sm" className={'fs-7'}>
                    <tbody>
                    <tr>
                        <td>Изделие</td>
                        <td>
                            Кресло "Classic" / 840*1010 / FP / Изделие №572_5322 / (27, опоры массив,гвозд.лента)
                        </td>
                    </tr>

                    <tr>
                        <td>Отдел</td>
                        <td>КРОЙ</td>
                    </tr>

                    <tr>
                        <td>Предложенный тариф</td>
                        <td>
                            <div className={'d-flex gap-2'}>
                                <AppInput
                                    type={'number'}
                                    style={{width: "100px"}}
                                    value={proposedInput}
                                    onChange={(e) => setProposedInput(Number(e.target.value) || "")}
                                />

                                <Button size={'sm'} variant={'secondary'} className={'fs-7 p-1'}>
                                    Предложить
                                </Button>
                                <Button size={'sm'} variant={'success'} className={'fs-7 p-1'}>
                                    Утвердить
                                </Button>
                            </div>

                        </td>
                    </tr>

                    <tr>
                        <td>Тариф предложил:</td>
                        <td>Гуков Олег 02.05.2024 12:17</td>
                    </tr>

                    <tr>
                        <td>Утвержденный тариф</td>
                        <td>
                            <AppInput
                                disabled
                                type={'number'}
                                style={{width: "100px"}}
                                value={proposedInput}
                                onChange={(e) => setProposedInput(Number(e.target.value) || "")}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td>Тариф утвердил:</td>
                        <td>Харченко дмитрий 02.05.2024 12:18</td>
                    </tr>

                    </tbody>
                </Table>
            </div>
        </div>
    );
};
