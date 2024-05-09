import {memo, ReactNode, useContext, useEffect, useMemo} from "react";
import {Button, Offcanvas} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

import {IsDesktopContext} from "@app";
import {AppNavigation} from "@widgets/AppNavigation";
import {NotificationWidget} from "@widgets/NotificationWidget";

import Logo from '@shared/assets/images/SZMK Logo White Horizontal 900х352.png';
import {IndicatorWrapper} from "@shared/ui";
import {useAppDispatch, useAppModal, useAppSelector, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";

import {DynamicComponent, ReducersList} from "@features";
import {appNavbarReducer} from "../model/slice";
import {getNavHasNotifications, getNavHasUpdated, getNavIsLoading} from "../model/selectors";
import {fetchHasNotifications} from "../model/api/fetchHasNotifications";


interface AppNavbarProps {
    showNav: boolean;
    closeClb: () => void;
    children?: ReactNode;
}


const initialReducers: ReducersList = {
    appNavbar: appNavbarReducer,
}

export const AppNavbar = memo((props: AppNavbarProps) => {
    const {showNav, closeClb, children} = props;
    const isLoading = useAppSelector(getNavIsLoading);
    const hasUpdated = useAppSelector(getNavHasUpdated);
    const navHasNotifications = useAppSelector(getNavHasNotifications);
    const dispatch = useAppDispatch();
    
    
    const isDesktop = useContext(IsDesktopContext);
    const {openModal, closeModal} = useAppModal();
    const {currentUser} = useCurrentUser();
    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);


    useEffect(() => {
        if (isBoss) {
            dispatch(fetchHasNotifications({}))
        }
    }, [isBoss, currentUser.current_department, hasUpdated, dispatch])


    let navigate = useNavigate();

    const notificationHandler = () => {
        openModal(
            <NotificationWidget closeClb={closeModal}/>
        )
    }

    const backHandler = () => {
        navigate(-1);
    }

    const logoOpacity = useMemo(() => (
        window.history.length > 1 ? '1' : '0.6'
    ), [])

    if (isDesktop) {
        return (
            <DynamicComponent reducers={initialReducers} removeAfterUnmount={false}>
                <div className={'bg-black text-white d-flex align-items-center justify-content-center p-3 appNavbar'}>
                    <div className={'d-flex'}
                         style={{minWidth: '1150px', maxWidth: '100%'}}
                    >
                        <div className={'d-flex justify-content-between align-items-center gap-3'}
                             style={{minWidth: '1150px', maxWidth: '100%'}}
                        >
                            <div className={'d-flex flex-fill align-items-center gap-3'}
                                 style={{maxWidth: '85%'}}>
                                <div>
                                    <img src={Logo} alt={'SZMK logo'} style={{
                                        maxHeight: '38px',
                                        opacity: logoOpacity,
                                    }} onClick={backHandler}/>
                                </div>
                                <div className={'d-flex gap-1'}>
                                    {children}
                                    <Button variant={'outline-dark'}
                                            onClick={() => window.location.reload()}
                                    >
                                        <i className="text-white fas fa-sync-alt fs-6"/>
                                    </Button>
                                </div>
                            </div>

                            <div className={'d-flex align-items-center'}>
                                {isBoss &&
                                    <Button variant={'black'}
                                            onClick={notificationHandler}
                                    >
                                        {isLoading ?
                                            <i className="far fa-bell text-muted"/>
                                            :
                                            <>
                                                {navHasNotifications ?

                                                    <IndicatorWrapper indicator={"comment"} color={" bg-danger"}>
                                                        <i className="far fa-bell"/>
                                                    </IndicatorWrapper>
                                                    :
                                                    <i className="far fa-bell"/>
                                                }
                                            </>
                                        }
                                    </Button>
                                }

                                <AppNavigation isDesktop={isDesktop}/>
                            </div>
                        </div>

                    </div>
                </div>
            </DynamicComponent>
        )
    }

    return (
        <DynamicComponent reducers={initialReducers} removeAfterUnmount={false}>
            <Offcanvas show={showNav} onHide={closeClb} data-bs-theme={'dark'} style={{maxWidth: '320px'}}>
                <Offcanvas.Header closeButton className={'p-3 pb-1'}>
                    <Offcanvas.Title>
                        <img src={Logo} alt={'SZMK logo'} style={{maxWidth: '80px'}}/>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className={'d-flex flex-column gap-3 p-2'}>
                    {children}
                    <AppNavigation isDesktop={isDesktop}/>
                </Offcanvas.Body>
            </Offcanvas>
        </DynamicComponent>
    )
})