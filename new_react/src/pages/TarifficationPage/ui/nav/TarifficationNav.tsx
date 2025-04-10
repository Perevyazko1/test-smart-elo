import {AppNavbar} from "@widgets/AppNavbar";

import {ProductNameInput} from "./ProductNameInput";
import {DepartmentDropdown} from "./DepartmentDropdown";
import {ProjectDropdown} from "./ProjectDropdown";
import {TariffStatusDropdown} from "./TariffStatusDropdown";


export const TarifficationNav = () => {

    return (
        <AppNavbar>
            <ProductNameInput/>
            <DepartmentDropdown/>
            <ProjectDropdown/>
            <TariffStatusDropdown/>
        </AppNavbar>
    );
};
