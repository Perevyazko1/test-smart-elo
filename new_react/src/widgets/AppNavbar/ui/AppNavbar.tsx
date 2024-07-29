import {memo, ReactNode, useContext, useEffect, useMemo} from "react";
import {Button} from "react-bootstrap";
import {Link, useLocation, useNavigate} from "react-router-dom";

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
import {Box, Drawer} from "@mui/material";


interface AppNavbarProps {
    showNav?: boolean;
    closeClb?: () => void;
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

    const location = useLocation();

    const isDesktop = useContext(IsDesktopContext);

    const {handleOpen, handleClose} = useAppModal();
    const {currentUser} = useCurrentUser();
    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);


    useEffect(() => {
        if (isBoss) {
            dispatch(fetchHasNotifications({}))
        }
    }, [isBoss, currentUser.current_department, hasUpdated, dispatch])


    let navigate = useNavigate();

    const notificationHandler = () => {
        handleOpen(<NotificationWidget closeClb={handleClose}/>)
    }

    const backHandler = () => {
        navigate(-1);
    }

    const backBtnActive = useMemo(() => {
        return window.history.length > 1;
    }, [])

    if (isDesktop) {
        return (
            <DynamicComponent reducers={initialReducers} removeAfterUnmount={false}>
                <div
                    className={'bg-black text-white d-flex justify-content-center align-items-stretch appNavbar'}
                >
                    <div className={'d-flex align-items-stretch'}
                         style={{minWidth: '1150px', maxWidth: '1600px'}}
                    >
                        <div className={'d-flex justify-content-between align-items-stretch gap-3'}
                             style={{minWidth: '1220px', maxWidth: '100%'}}
                        >
                            <div className={'d-flex align-self-center flex-nowrap gap-1'} style={{width: '175px'}}>
                                <Button variant={'outline-dark'}
                                        onClick={backHandler}
                                        disabled={!backBtnActive}
                                        style={{
                                            width: '35px',
                                        }}
                                >
                                    <i className={`${backBtnActive && 'text-white'} fas fa-chevron-left`}/>
                                </Button>

                                <Button variant={'outline-dark'}
                                        onClick={() => window.location.reload()}
                                        style={{
                                            width: '35px',
                                        }}
                                        className={'px-0'}
                                >
                                    <i className="text-white fas fa-sync-alt"/>
                                </Button>

                                <div className={'align-self-center'}>
                                    <Link to={location.pathname !== '/task'
                                        ? '/task'
                                        : '/'
                                    }>
                                        <img
                                            src={Logo}
                                            alt={'SZMK logo'}
                                            style={{
                                                maxHeight: '38px',
                                            }}
                                        />
                                    </Link>
                                </div>
                            </div>
                            <div
                                className={'d-flex gap-1 flex-fill justify-content-start align-items-center'}
                                style={{
                                    maxWidth: 'calc(100wv - 400px)',
                                    minHeight: '45px'
                                }}
                            >
                                {children}
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
            <Drawer
                open={showNav}
                onClose={closeClb}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: 'black',
                        color: 'white',
                    },
                }}
            >
                <Box data-bs-theme={'dark'}>
                    <div className={'d-flex flex-column gap-3 p-2'}>
                        <div>
                            <img src={Logo} alt={'SZMK logo'} style={{maxWidth: '120px'}}/>
                        </div>
                        <div className={'d-flex flex-column gap-3 p-2'} style={{
                            minWidth: '320px',
                        }}>
                            {children}
                            <AppNavigation isDesktop={isDesktop}/>
                        </div>
                    </div>
                </Box>
            </Drawer>
        </DynamicComponent>
    )
})