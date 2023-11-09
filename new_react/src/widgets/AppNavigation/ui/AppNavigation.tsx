import {Button} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";
import {useCallback, useContext} from "react";

import {AppInCompactMode, CurrentUserContext} from "@app";
import {testEmployee} from "@entities/Employee";
import {getUserRouteConfig} from "@shared/lib";
import {AppDropdown, AppSwitch} from "@shared/ui";
import {APP_COMPACT_MODE, CURRENT_USER} from "@shared/consts";

export const AppNavigation = () => {
    const currentUser = useContext(CurrentUserContext);

    if (!currentUser) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }

    const compactModeContext = useContext(AppInCompactMode);
    if (!compactModeContext) {
        throw new Error("SomeComponent must be used within a AppInCompactMode.Provider");
    }

    const {isCompactMode, setCompactMode} = compactModeContext;

    const switchCompactMode = (value: boolean) => {
        setCompactMode(!isCompactMode);
        value ? localStorage.setItem(APP_COMPACT_MODE, String(value))
            : localStorage.removeItem(APP_COMPACT_MODE);
    };

    const location = useLocation();

    const getRoutesConfig = useCallback(() => {
        return getUserRouteConfig(currentUser.currentUser, true);
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

    const getSelectedName = () => {
        const user = currentUser.currentUser;

        if (user.last_name) {
            return `${user.first_name} ${user.last_name[0]}.`
        } else {
            return `${user.first_name}`
        }
    }

    const exitHandle = () => {
        currentUser.setCurrentUser(testEmployee);
        localStorage.removeItem(CURRENT_USER);
    }

    return (
        <AppDropdown selected={getSelectedName()}>
            {renderOptions}
            <div className={'py-2'}>
                <AppSwitch checked={isCompactMode} label={'Сжатый вид'} onSwitch={switchCompactMode}/>
            </div>

            <div>
                <Button onClick={exitHandle} className={'w-100 bg-black'} variant={'dark'}>
                    Выход
                </Button>
            </div>
        </AppDropdown>
    )
}