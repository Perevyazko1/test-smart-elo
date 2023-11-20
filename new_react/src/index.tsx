import React from 'react';
import ReactDOM from 'react-dom/client';

import {App, ContextProvider, StoreProvider} from "@app";
import '@app/styles/index.scss';
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StoreProvider>
        <DndProvider backend={TouchBackend} options={{enableMouseEvents: true}}>
            <ContextProvider>
                <App/>
            </ContextProvider>
        </DndProvider>
    </StoreProvider>
);
