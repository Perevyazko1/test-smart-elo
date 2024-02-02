import React, {useState} from "react";

import cls from './WagesPage.module.scss';

import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {AppNavbar} from "@widgets/AppNavbar";

import {WagesNavContent} from "./WagesNav/WagesNavContent";
import {WagesPageContent} from "./WagesContent/WagesPageContent";


export const WagesPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>

                <div className={cls.pageContainer}>
                    <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                        <WagesNavContent/>
                    </AppNavbar>

                    <WagesPageContent/>
                </div>
            </ModalProvider>
        </QueryContext>
);
};
