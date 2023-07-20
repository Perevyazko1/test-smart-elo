import React from "react";
import {useParams} from "react-router-dom";
import {Container, Nav} from "react-bootstrap";

import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {classNames} from "shared/lib/classNames/classNames";

import cls from "./ProductDetailsPage.module.scss";

const ProductDetailsPage = () => {
    const {id} = useParams();

    return (
        <Container className={classNames(cls.pageContainer, {}, [])}
                   fluid
                   data-bs-theme={'dark'}
        >
            <AppNavbar>
                <Nav className="me-auto">
                    <UpdatePageBtn
                        className={'ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1 bg-body-tertiary px-3'}
                    />

                </Nav>

                <Nav>
                    <UserInfoWithRouts
                        className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                        active
                    />
                </Nav>

            </AppNavbar>

            <Container className={'mt-2'} data-bs-theme={'light'}>
                <div className={classNames(cls.stickyWrapper, {}, ['bg-light'])}>
                    <div className="d-flex align-items-center">
                        <h3>
                            Страница детализации по изделию id: {id}
                        </h3>
                    </div>
                    <hr className={'p-0 m-1 mb-2 w-25'}/>
                </div>

            </Container>
        </Container>
    );
};

export default ProductDetailsPage;

