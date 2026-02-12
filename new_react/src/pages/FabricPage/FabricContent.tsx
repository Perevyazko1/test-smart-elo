import {FabricAwaitBlock} from "@pages/FabricPage/FabricAwaitBlock";
import {FabricStockBlock} from "@pages/FabricPage/FabricStockBlock";
import {FabricSkladBlock} from "@pages/FabricPage/FabricSkladBlock";

interface Props {

}


export const FabricContent = (props: Props) => {
    const {} = props;

    return (
        <div className={'d-flex flex-nowrap justify-content-between'} style={{minHeight: 'calc(100vh - 60px)', maxHeight: 'calc(100vh - 60px)'}}>
            <div className={'w-50'}>
                <div className={'h-50 bg-secondary-subtle overflow-auto'}>
                    <div className={'w-100 text-center p-1 fw-bold border border-black'}>ОЖИДАЕТ ПОСТУПЛЕНИЯ</div>
                    <div className={'d-flex flex-wrap flex-column gap-2 p-2'}>
                        <FabricAwaitBlock/>
                    </div>
                </div>
                <div className={'h-50 bg-success-subtle overflow-auto'}>
                    <div className={'d-flex flex-nowrap flex-row gap-2 justify-content-between px-4'}>
                        <div>⏮️</div>
                        <div>С </div>
                        <div>⏮️</div>
                    </div>
                    <div className={'w-100 text-center p-1 fw-bold border border-black'}>ДВИЖЕНИЯ СКЛАД</div>
                    <div className={'d-flex flex-wrap flex-column gap-2 p-2'}>
                        <FabricSkladBlock/>
                    </div>
                </div>
            </div>
            <div className={'w-50 bg-primary-subtle overflow-auto'}>
                <div className={'w-100 text-center p-1 fw-bold border border-black'}>В НАЛИЧИИ</div>
                <FabricStockBlock/>
            </div>
        </div>
    );
};
