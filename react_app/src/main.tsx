import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {App} from '@/app/App.tsx';
import {ContextProvider} from "@/app/ContextProvider.tsx";

import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {CashPage} from "@/pages/cash/CashPage.tsx";

import '@/shared/styles/index.css';
import {LoginPage} from "@/pages/login/LoginPage.tsx";
import {RequireAuth} from "@/components/RequireAuth.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

// @ts-ignore
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Toaster position="top-center" toastOptions={{duration: 1400}}/>
        <ContextProvider>
            <Routes>
                <Route path="/" element={<RequireAuth/>}>
                    <Route path="/" element={<App/>}>
                        <Route index element={<SalaryPage/>}/>
                        <Route path="cash" element={<CashPage/>}/>
                    </Route>
                </Route>
            </Routes>
        </ContextProvider>
    </BrowserRouter>,
)
