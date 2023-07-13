import React, {memo} from 'react';
import {Nav} from "react-bootstrap";

import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";

const TestPage = memo(() => {

    return (
        <div>
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
            <h1 >Test page</h1>
        </div>
    );
});

export default TestPage;