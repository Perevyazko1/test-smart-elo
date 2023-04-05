import React from 'react';

import logo from 'shared/assets/images/SZMK Logo Dark Horizontal.png';
import {PinCodeAuthForm} from "features/AuthByPinCode";

const LoginPage = () => {

    return (
        <section className="py-4 py-xl-5">
            <div className="container">
                <div className="row mb-5 my-xl-4">
                    <div className="col-md-8 col-xl-6 text-center mx-auto">
                        <h1 className={'fw-bold font-monospace'}>
                            Вход в систему
                        </h1>
                    </div>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-md-6 col-xl-4">
                        <div className="card mb-5">
                            <div className="card-body d-flex flex-column align-items-center">

                                <img
                                    className="px-xl-0 pe-xl-0 mx-xl-3 my-xl-1 mt-xl-0 py-xl-1"
                                    src={logo} width="50%"
                                    style={{borderRadius: "4%"}}
                                    alt={"LOGO"}
                                />

                                <PinCodeAuthForm/>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;