import {memo} from 'react';

import 'shared/assets/fonts/fontawesome-all.min.css';
import {StickyHeader} from "shared/ui/StickyHeader/StickyHeader";

import {EqNavBar} from "./EQNavBar/EQNavBar";


const EqPage = memo(() => {

    return (
        <div className="container-fluid p-0" style={{height: "100vh", background: "#f8f9fa"}}>
            <EqNavBar/>

            <section style={{height: "93vh", background: "#929292"}}>

                <div className="row" style={{height: "100%", margin: "0"}}>
                    {/*Левый блок*/}
                    <div className="col-xl-6" style={{width: "50%", padding: "0"}}>
                        {/*<EqInWorkBlock/>*/}
                        <div>Список в работе</div>

                        {/*<EqWeekBlock/>*/}
                        <div>Контролер недель</div>

                        {/*<EqReadyBlock/>*/}
                        <div>Список готовых</div>
                    </div>

                    {/*<--------------- Правый блок --------------->*/}
                    <div
                        className="col p-1 m-0"
                        style={{
                            width: "50%",
                            height: "93vh",
                            overflow: "auto",
                            overflowX: "auto",
                            overflowY: "auto",
                            borderLeftWidth: "4px",
                            borderLeftStyle: "solid"
                        }}
                    >

                        {/*<EqAwaitBlock/>*/}
                        <StickyHeader>Список изделий в очереди</StickyHeader>
                        <div>Список очереди</div>

                    </div>
                </div>
            </section>
        </div>
    );
});

export default EqPage;