import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {App} from '@/app/App.tsx';
import {ContextProvider} from "@/app/ContextProvider.tsx";

import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {CashPage} from "@/pages/cash/CashPage.tsx";
import {ShipmentPage} from "@/pages/shipment/ShipmentPage.tsx";
import {PlanPage} from "@/pages/plan/PlanPage.tsx";
import {AiPlanPage} from "@/pages/aiPlan/AiPlanPage.tsx";
import {SkladPage} from "@/pages/skladPage/SkladPage.tsx";
import {ShipmentDetailPage} from "@/pages/shipmentDetail/ShipmentDetailPage.tsx";
import {UserWage} from "@/pages/userWage/UserWage.tsx";

import '@/shared/styles/index.css';

import {RequirePermission} from "@/app/RequirePermission.tsx";
import {RequireAuth} from "@/components/RequireAuth.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {APP_PERM} from "@/entities/user";
import {DefaultRedirect} from "@/components/DefaultRedirect.tsx";
import {CashNav} from "@/widgets/navbar/cashNav/CashNav.tsx";
import {PlanNav} from "@/widgets/navbar/planNav/PlanNav.tsx";
import {ShipmentNav} from "@/widgets/navbar/shipmentNav/ShipmentNav.tsx";
import {SkladNav} from "@/widgets/navbar/skladNav/SkladNav.tsx";
import {TransfersPage} from "@/pages/transfers/TransfersPage.tsx";
import {TariffingPage} from "@/pages/tariffing/TariffingPage.tsx";
import {TariffingNav} from "@/pages/tariffing/TariffingNav.tsx";

// @ts-ignore
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Toaster position="top-center" toastOptions={{duration: 1200}}/>
        <ContextProvider>
            <Routes>
                <Route path="/" element={<RequireAuth/>}>
                    {/* Default landing based on permissions */}
                    <Route index element={<DefaultRedirect/>}/>

                    <Route path="/" element={<App nav={<CashNav/>}/>}>
                        <Route
                            element={<RequirePermission requiredPermissions={[APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]}/>}>
                            {/* Explicit routes for salary/cash */}
                            <Route path="/salary/:date_from?/:date_to?/" element={<SalaryPage/>}/>
                            <Route path="/cash" element={<CashPage/>}/>
                            <Route path="/transfers" element={<TransfersPage/>}/>
                        </Route>
                    </Route>
                    <Route path="/" element={<App nav={<TariffingNav/>}/>}>
                        <Route
                            element={<RequirePermission requiredPermissions={[APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]}/>}>
                            <Route path="/tariffing" element={<TariffingPage/>}/>

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
                            <Route path="/plan" element={<PlanPage/>}/>
                            <Route path="/ai-plan" element={<AiPlanPage/>}/>
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
                            <Route path="/shipment/:shipmentId" element={<ShipmentDetailPage/>}/>
                        </Route>
                    </Route>

                    <Route path="/" element={<App nav={<SkladNav/>}/>}>
                        <Route
                            element={
                                <RequirePermission
                                    requiredPermissions={
                                        [APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]
                                    }/>
                            }>
                            <Route path="/sklad" element={<SkladPage/>}/>
                        </Route>
                    </Route>
                </Route>

                <Route path="/user_wage/:userId/:date_from/:date_to/" element={<UserWage/>}/>
                {/* Fallback for permission denials */}
                <Route path="/unauthorized" element={<div style={{padding: 24}}>Нет доступа</div>}/>
            </Routes>
        </ContextProvider>
    </BrowserRouter>,
)
