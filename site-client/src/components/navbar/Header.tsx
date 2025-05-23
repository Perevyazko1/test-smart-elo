import {HeaderTop} from "@/components/navbar/HeaderTop";
import {cx} from "@/utils/class-builder";
import {Container} from "@/ui/containers/Container";


export const Header = () => {
    return (
        <header className={cx([
            'pt-15 sticky top-0 left-0 right-0 z-50  bg-b_FF',
            'sm:pt-12',
            'md:pt-25',
            'lg:pt-35',
        ])}>
            <HeaderTop/>
            {/*<HeaderBottom/>*/}
            <Container>
                <hr className={cx([
                    'border-t-b_D9 border-top-1 mt-15',
                    'sm:mt-12',
                    'md:mt-25',
                    'lg:mt-35',
                ])}/>
            </Container>
        </header>
    );
};