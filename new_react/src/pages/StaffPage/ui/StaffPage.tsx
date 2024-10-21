import {ModalProvider} from "@app";
import {QueryContext} from "@features";


import {StaffPageNav} from "./StaffPageNav/StaffPageNav";
import {StaffPageBody} from "@pages/StaffPage/ui/StaffPageBody/StaffPageBody";


export const StaffPage = () => {
    return (
        <QueryContext>
            <ModalProvider>
                <div className={'pageContainer'}>
                    <StaffPageNav/>

                    <StaffPageBody/>
                </div>
            </ModalProvider>
        </QueryContext>
    );
};
