import {Offcanvas} from "react-bootstrap";
import {memo, ReactNode, useContext} from "react";

import {IsDesktopContext} from "@app";
import Logo from '@shared/assets/images/SZMK Logo White Horizontal 900х352.png';
import {AppNavigation} from "@widgets/AppNavigation";

interface AppNavbarProps {
    showNav: boolean;
    closeClb: () => void;
    children?: ReactNode;
}

export const AppNavbar = memo((props: AppNavbarProps) => {
    const {showNav, closeClb, children} = props;

    const isDesktop = useContext(IsDesktopContext);

    if (isDesktop) {
        return (
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
                                <img src={Logo} alt={'SZMK logo'} style={{maxHeight: '38px'}}/>
                            </div>
                            <div className={'d-flex gap-1'}>
                                {children}
                            </div>
                        </div>

                        <div>
                            <AppNavigation/>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    return (
        <Offcanvas show={showNav} onHide={closeClb} data-bs-theme={'dark'} style={{maxWidth: '320px'}}>
            <Offcanvas.Header closeButton className={'p-3 pb-1'}>
                <Offcanvas.Title>
                    <img src={Logo} alt={'SZMK logo'} style={{maxWidth: '80px'}}/>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className={'d-flex flex-column gap-3 p-2'}>
                {children}
                <AppNavigation/>
            </Offcanvas.Body>
        </Offcanvas>
    )
})