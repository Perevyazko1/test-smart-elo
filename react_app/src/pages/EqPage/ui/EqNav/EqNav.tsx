import {Container, Nav, Navbar} from "react-bootstrap";
import {UserInfoWithRouts} from "../../../../widgets/UserInfoWithRouts";
import {AppDropdown} from "widgets/AppDropdown";
import {UpdatePageBtn} from "../../../../widgets/UpdatePageBtn";
import React from "react";

export const EqNav = () => {
    return (
        <Navbar data-bs-theme={'dark'} className={'bg-body-tertiary p-0'} style={{height: "45px"}}>
            <Container fluid className={"mx-xxl-4 p-0"}>
                <Container fluid className={'d-flex justify-content-between p-0 gap-3'}>
                    <Nav className="gap-3 flex-fill" style={{
                        overflowX: 'auto',
                        overflowY: "hidden",
                    }}>
                        <AppDropdown
                            active
                            title={'Конструктора'}
                            onChange={(item) => console.log(item)}
                            items={['Конструктора', 'Обивка', 'Крой']}
                        />
                        <AppDropdown
                            title={'Домашка'}
                            onChange={(item) => console.log(item)}
                            items={['Домашка', 'Випы']}
                        />
                        <AppDropdown
                            title={'Режим бригадира'}
                            onChange={(item) => console.log(item)}
                            items={['Режим бригадира', 'Личные наряды']}
                        />
                        <AppDropdown
                            title={'Режим бригадира'}
                            onChange={(item) => console.log(item)}
                            items={['Режим бригадира', 'Личные наряды']}
                        />
                        <AppDropdown
                            title={'Режим бригадира'}
                            onChange={(item) => console.log(item)}
                            items={['Режим бригадира', 'Личные наряды']}
                        />

                        <UpdatePageBtn/>
                    </Nav>

                    <Nav>
                        <UserInfoWithRouts/>
                    </Nav>
                </Container>
            </Container>
        </Navbar>
    )
}