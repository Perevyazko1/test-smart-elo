import {Button} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useCallback} from "react";
import {anonEmployee} from "@entities/Employee";
import {getEmployeeName, getUserRouteConfig} from "@shared/lib";
import {AppSelect} from "@shared/ui";
import {USER_LOCALSTORAGE_TOKEN} from "@shared/consts";
import {useAppModal, useCurrentUser} from "@shared/hooks";
import {UserActions} from "@widgets/UserActions";

export const AppNavigation = () => {
    const {currentUser, setCurrentUser} = useCurrentUser();
    const {handleOpen} = useAppModal();

    // const {isCompactMode, setCompactMode} = useCompactMode();

    // const switchCompactMode = (value: boolean) => {
    //     setCompactMode(!isCompactMode);
    //     value ? localStorage.setItem(APP_COMPACT_MODE, String(value))
    //         : localStorage.removeItem(APP_COMPACT_MODE);
    // };

    const location = useLocation();

    const getRoutesConfig = useCallback(() => {
        return getUserRouteConfig(currentUser, true);
    }, [currentUser]);

    const renderOptions = getRoutesConfig().map((routeConfig) => {
        return (
            <div key={routeConfig.route.path}>
                <Link to={routeConfig.route.path || ''}>
                    <Button variant={'black'}
                            active={location.pathname === routeConfig.route.path}
                            className={'text-nowrap w-100 link-light'}
                    >
                        {routeConfig.name}
                    </Button>
                </Link>
                <hr className={'p-0 m-0'}/>
            </div>
        )
    });

    const exitHandle = () => {
        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
        setCurrentUser(anonEmployee);
    }

    const showUserActionsClb = () => {
        handleOpen(<UserActions/>)
    }

    return (
        <AppSelect
            noInput
            label={'Пользователь'}
            variant={'dropdown'}
            style={{width: 155}}
            value={getEmployeeName(currentUser, 'short')}
            colorScheme={'darkInput'}
        >
            {renderOptions}
            {/*<div className={'p-2 pt-3'}>*/}
            {/*    <AppSwitch*/}
            {/*        checked={isCompactMode}*/}
            {/*        label={'Сжатый вид'}*/}
            {/*        onSwitch={switchCompactMode}*/}
            {/*        idSwitch={'compact-mode-switch'}*/}
            {/*    />*/}
            {/*</div>*/}
            <div className={'py-2'}>
                <Button onClick={showUserActionsClb} className={'w-100 bg-black'} variant={'dark'}>
                    История
                </Button>
            </div>
            <div>
                <Button onClick={exitHandle} className={'w-100 bg-black'} variant={'dark'}>
                    Выход
                </Button>
            </div>
        </AppSelect>
    );
}