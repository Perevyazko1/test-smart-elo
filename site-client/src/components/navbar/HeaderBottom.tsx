import {Container} from "@/ui/containers/Container";
import {cx} from "@/utils/class-builder";
import {NavLinkList} from "@/ui/links/nav-bottom/NavLinkList";
import {ComingSoon} from "@/ui/src/ComingSoon";
import {InputSearch} from "@/ui/inputs/InputSearch";

export const HeaderBottom = () => {
    return (
        <Container>
            <section className={cx([
                'hidden flex-wrap justify-between items-center gap-x-26 gap-y-20',
                'sm:flex sm:pe-1 sm:py-12',
                'md:flex md:pe-1 md:py-20',
                'lg:flex lg:pe-1 lg:py-30',
            ])}>
                <NavLinkList/>

                <ComingSoon className={'ms-auto'}>
                    <InputSearch placeholder={'Поиск по каталогу'}/>
                </ComingSoon>
            </section>
        </Container>
    );
};