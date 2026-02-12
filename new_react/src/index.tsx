import React from 'react';
import ReactDOM from 'react-dom/client';

import '@app/styles/index.scss';

import {App, ContextProvider, StoreProvider} from "@app";
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";
import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                // console.log('Service Worker registered with scope:', registration.scope);
            }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}

root.render(
    <StoreProvider>
        <ContextProvider>
            <DndProvider backend={TouchBackend} options={{enableMouseEvents: true}}>
                <App/>
                <Toaster position="top-center" duration={1500}/>
            </DndProvider>
        </ContextProvider>
    </StoreProvider>
);
