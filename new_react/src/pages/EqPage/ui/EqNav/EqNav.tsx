import {AppNavbar} from "@widgets/AppNavbar";
import {AppDropdown} from "@shared/ui";
import {useState} from "react";
import {useQueryParams} from "@shared/hooks";
import {EqSeriesSize} from "@pages/EqPage/ui/EqNav/EqSeriesSize";

interface EqNavProps {
    showCanvas: boolean;
    closeClb: () => void;
}


export const EqNav = (props: EqNavProps) => {
    const {
        showCanvas,
        closeClb
    } = props;

    const baseViewMode = 'Личные наряды';
    const baseProject = 'Все проекты';


    const [department, setDepartment] = useState('Конструктора');
    const {queryParameters, setQueryParam} = useQueryParams();

    const viewModeClb = (item: string) => {
        item === baseViewMode ?
            setQueryParam('view_mode', '')
            :
            setQueryParam('view_mode', item)
    }

    const projectClb = (item: string) => {
        item === baseProject ?
            setQueryParam('project', '')
            :
            setQueryParam('project', item)
    }

    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }


    return (
        <AppNavbar showNav={showCanvas} closeClb={closeClb}>
            <AppDropdown
                selected={department}
                items={['Конструктора', 'Обивка', 'Крой']}
                onSelect={setDepartment}
            />
            <AppDropdown
                selected={queryParameters.view_mode || baseViewMode}
                active={!!queryParameters.view_mode}
                items={[baseViewMode, 'Режим бригадира', 'Недоделки', 'Борисенко А.']}
                onSelect={viewModeClb}
            />
            <AppDropdown
                selected={queryParameters.project || baseProject}
                active={!!queryParameters.project}
                items={[baseProject, 'Серийная мебель', 'Valo']}
                onSelect={projectClb}
            />

            <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>

        </AppNavbar>
    );
};
