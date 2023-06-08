import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import {StoreProvider} from "./app/providers/StoreProvider";

import {BrowserRouter} from 'react-router-dom';
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StoreProvider>
        <DndProvider backend={TouchBackend}
                     options={{enableMouseEvents: true}}
        >
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </DndProvider>
    </StoreProvider>
);
