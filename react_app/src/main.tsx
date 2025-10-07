import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {App} from '@/app/App.tsx';
import {ContextProvider} from "@/app/ContextProvider.tsx";

import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {CashPage} from "@/pages/cash/CashPage.tsx";
import {ShipmentPage} from "@/pages/shipment/ShipmentPage.tsx";
import {PlanPage} from "@/pages/plan/PlanPage.tsx";

import '@/shared/styles/index.css';

import {RequireAuth} from "@/components/RequireAuth.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {UserWage} from "@/pages/userWage/UserWage.tsx";
import {RequirePermission} from "@/app/RequirePermission.tsx";
import {APP_PERM} from "@/entities/user";
import {CashNav} from "@/widgets/navbar/cashNav/CashNav.tsx";
import {PlanNav} from "@/widgets/navbar/planNav/PlanNav.tsx";
import {ShipmentNav} from "@/widgets/navbar/shipmentNav/ShipmentNav.tsx";

// @ts-ignore
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Toaster position="top-center" toastOptions={{duration: 1200}}/>
        <ContextProvider>
            <Routes>
                <Route path="/" element={<RequireAuth/>}>
                    <Route path="/" element={<App nav={<CashNav/>}/>}>
                        <Route
                            element={<RequirePermission requiredPermissions={[APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]}/>}>
                            <Route index element={<SalaryPage/>}/>
                            <Route path="/salary/:date_from?/:date_to?/" element={<SalaryPage/>}/>
                            <Route path="/cash" element={<CashPage/>}/>
                        </Route>
                    </Route>

                    <Route path="/" element={<App nav={<PlanNav/>}/>}>
                        <Route
                            element={
                                <RequirePermission
                                    requiredPermissions={
                                        [APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]
                                    }/>
                            }>
                            <Route index element={<PlanPage/>}/>
                            <Route path="/plan" element={<PlanPage/>}/>
                        </Route>
                    </Route>

                    <Route path="/" element={<App nav={<ShipmentNav/>}/>}>
                        <Route
                            element={
                                <RequirePermission
                                    requiredPermissions={
                                        [APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]
                                    }/>
                            }>
                            <Route path="/shipment" element={<ShipmentPage/>}/>
                        </Route>
                    </Route>
                </Route>

                <Route path="/user_wage/:userId/:date_from/:date_to/" element={<UserWage/>}/>
            </Routes>
        </ContextProvider>
    </BrowserRouter>,
)
