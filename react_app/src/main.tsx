import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {App} from '@/app/App.tsx';
import {ContextProvider} from "@/app/ContextProvider.tsx";

import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {CashPage} from "@/pages/cash/CashPage.tsx";

import '@/shared/styles/index.css';
import {RequireAuth} from "@/components/RequireAuth.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {UserWage} from "@/pages/userWage/UserWage.tsx";
import {RequirePermission} from "@/app/RequirePermission.tsx";
import {APP_PERM} from "@/entities/user";

// @ts-ignore
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Toaster position="top-center" toastOptions={{duration: 1200}}/>
        <ContextProvider>
            <Routes>
                <Route path="/" element={<RequireAuth/>}>
                    <Route path="/" element={<App/>}>
                        <Route element={<RequirePermission requiredPermissions={[APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]}/>}>
                            <Route index path="/salary/:date_from?/:date_to?/" element={<SalaryPage/>}/>
                            <Route path="cash" element={<CashPage/>}/>
                        </Route>
                    </Route>
                </Route>
                <Route path="/user_wage/:userId/:date_from/:date_to/" element={<UserWage/>}/>
            </Routes>
        </ContextProvider>
    </BrowserRouter>,
)
