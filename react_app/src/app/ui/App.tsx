import {SalaryPage} from "@/pages/salary/SalaryPage.tsx";
import {Navbar} from "@/widgets/navbar/Navbar.tsx";


export const App = () => {
    return (
        <div className={'bg-gray-500'}>
            <Navbar/>
            <SalaryPage/>
        </div>
    )
}
