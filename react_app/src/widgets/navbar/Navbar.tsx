import {type HTMLAttributes, useState, useEffect} from "react";
import {twMerge} from "tailwind-merge";
import {useLocation} from "react-router-dom";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {ChevronDownIcon} from "lucide-react";
import {usePermission} from "@/shared/utils/permissions.ts";
import {APP_PERM} from "@/entities/user";
import {AppLink} from "@/shared/ui/nav/AppLink.tsx";

interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
    date_from?: string;
    date_to?: string;
}

export const Navbar = (props: NavbarProps) => {
    const {date_from, date_to, children, ...otherProps} = props;
    const {currentUser, setCurrentUser} = useCurrentUser();

    const [showMenu, setShowMenu] = useState(false);
    const [currentPath, setCurrentPath] = useState("");
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.split('/')[1];
        setCurrentPath('/' + path);
    }, [location]);

    const logoutHandle = () => {
        setCurrentUser(undefined);
        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
    }

    const wagesPage = usePermission([APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]);
    const cashPage = usePermission([APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]);
    const transfersPage = usePermission([APP_PERM.WAGES_PAGE, APP_PERM.ADMIN]);
    const planPage = usePermission([APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]);
    const shipmentPage = usePermission([APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]);
    const skladPage = usePermission([APP_PERM.SPECIFICATIONS_PAGE, APP_PERM.ADMIN]);
    const tariffingPage = usePermission([APP_PERM.TARIFFICATION_PAGE, APP_PERM.ADMIN]);

    const WagesLink = (props: { border: boolean }) => (
        <AppLink
            path={"/salary"}
            name={"Зарплата"}
            to={
                (date_from && date_to) ?
                    `/salary/${date_from}/${date_to}`
                    :
                    '/salary'
            }
            border={props.border}
        />
    )

    const CashLink = (props: { border: boolean }) => (
        <AppLink
            path={"/cash"}
            name={"Касса"}
            to={
                (date_from && date_to) ?
                    `/cash/${date_from}/${date_to}`
                    :
                    '/cash'
            }
            border={props.border}
        />
    )

    const PlanLink = (props: { border: boolean }) => (
        <AppLink
            path={"/plan"}
            name={"План"}
            border={props.border}
        />
    )

    const ShipmentLink = (props: { border: boolean }) => (
        <AppLink
            path={"/shipment"}
            name={"Отгрузки"}
            border={props.border}
        />
    )

    const SkladLink = (props: { border: boolean }) => (
        <AppLink
            path={"/sklad"}
            name={"Склад"}
            border={props.border}
        />
    )

    const TransfersLink = (props: { border: boolean }) => (
        <AppLink
            path={"/transfers"}
            name={"Переводы"}
            border={props.border}
        />
    )

    const TariffingLink = (props: { border: boolean }) => (
        <AppLink
            path={"/tariffing"}
            name={"Сделка"}
            border={props.border}
        />
    )
    return (
        <div
            className={twMerge([
                "noPrint sticky top-0 z-50",
                "flex flex-row flex-nowrap items-center justify-between",
                "bg-black text-white",
                "h-10 gap-5 px-4",
            ])}
            {...otherProps}
        >
            <div className={'flex flex-nowrap gap-5 items-center flex-1'}>
                <div>
                    СЗМК {
                    currentPath === "/salary" ?
                        "Зарплата" :
                        currentPath === "/cash" ?
                            "Касса" :
                            currentPath === "/shipment" ?
                                "Отгрузки" :
                                currentPath === "/plan" ?
                                    "План" :
                                    ""
                }
                </div>
                {currentPath === "/salary" && (
                    <CashLink border={false}/>
                )}
                {["/cash", "/user_wage"].includes(currentPath) && (
                    <WagesLink border={false}/>
                )}

                {children}
            </div>

            <div className={'flex gap-2 relative'}>
                <div
                    className={'flex items-center gap-2'}
                    onClick={() => setShowMenu(!showMenu)}
                >
                    {currentUser?.first_name} {currentUser?.last_name}
                    <ChevronDownIcon
                        className={twMerge(
                            "text-white transition-transform duration-300",
                            showMenu ? "rotate-180" : ""
                        )}
                    />
                </div>

                {showMenu && (
                    <div
                        onClick={() => setShowMenu(false)}
                        className={twMerge(
                            'flex flex-col gap-6',
                            'absolute top-9 right-0 min-w-[200px]',
                            'shadow-lg p-4 px-8 z-50 bg-black',
                        )}>
                        {wagesPage && (
                            <WagesLink border={true}/>
                        )}

                        {cashPage && (
                            <CashLink border={true}/>
                        )}

                        {planPage && (
                            <PlanLink border={true}/>
                        )}

                        {shipmentPage && (
                            <ShipmentLink border={true}/>
                        )}

                        {skladPage && (
                            <SkladLink border={true}/>
                        )}

                        {transfersPage && (
                            <TransfersLink border={true}/>
                        )}

                        {tariffingPage && (
                            <TariffingLink border={true}/>
                        )}


                        <Btn
                            className={'border-b-white border-b-1 p-2 bg-black text-white text-end'}
                            onClick={logoutHandle}
                        >
                            Выйти
                        </Btn>
                    </div>

                )}

            </div>
        </div>
    );
};