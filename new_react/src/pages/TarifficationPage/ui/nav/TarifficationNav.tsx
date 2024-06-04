import {useState} from "react";

import {AppNavbar} from "@widgets/AppNavbar";

import {ProductNameInput} from "./ProductNameInput";
import {DepartmentDropdown} from "./DepartmentDropdown";
import {ProjectDropdown} from "./ProjectDropdown";
import {TariffStatusDropdown} from "./TariffStatusDropdown";

export const TarifficationNav = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
            <ProductNameInput/>
            <DepartmentDropdown/>
            <ProjectDropdown/>
            <TariffStatusDropdown/>
        </AppNavbar>
    );
};
