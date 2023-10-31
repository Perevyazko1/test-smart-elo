import React, {useContext, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {IsDesktopContext} from "@app";

export const TestPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const isDesktop = useContext(IsDesktopContext);

    return (
        <div>
            <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
            <div className={'appBody'}>
                <h3>
                    Тестовая страница
                </h3>
                {!isDesktop &&
                    <button className={'appBtn p-3 rounded m-3'}
                         onClick={() => setShowCanvas(true)}
                    >
                        <i className="fas fa-filter fs-6"/>
                    </button>
                }
            </div>
        </div>
    );
};
