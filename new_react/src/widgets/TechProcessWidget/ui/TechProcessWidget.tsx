import {useState} from "react";

import {TechProcessList} from "@widgets/TechProcessWidget/ui/TechProcessList";
import {TechProcess, TechProcessSchema} from "@entities/TechProcess";
import {TpSelected} from "@widgets/TechProcessWidget/ui/TPSelected";
import {Product} from "@entities/Product";


interface TechProcessWidgetProps {
    product: Product;
    updCallback?: () => void;
}


export const TechProcessWidget = (props: TechProcessWidgetProps) => {
    const {product, updCallback} = props;

    const [showNewTP, setShowNewTP] = useState<boolean>(false);
    const [edited, setEdited] = useState<boolean>(false);

    const [showTPList, setShowTPList] = useState<boolean>(!product.technological_process);

    const [submitTP, setSubmitTP] = useState<TechProcess | null>(product.technological_process);

    const initialCurrentSchema = () => {
        if (submitTP && submitTP.image) {
            return submitTP.schema;
        } else {
            return {};
        }
    }
    const initialCurrentTechProcess = () => {
        if (submitTP && submitTP.image) {
            return submitTP;
        } else {
            return undefined;
        }
    }
    const [selectedSchema, setSelectedSchema] = useState<TechProcessSchema>(initialCurrentSchema());
    const [selectedTechProcess, setSelectedTechProcess] = useState<TechProcess | undefined>(initialCurrentTechProcess());

    // Коллбек на кнопку изменения выбранного техпроцесса
    const editClb = () => {
        // Показываем список техпроцессов
        setShowTPList(true);
        // Меняем состояние изменения
        setEdited(true);

        // Если текущий техпроцесс без изображения схему этого процесса устанавливаем как выбранную и показываем виджет
        if (!submitTP?.image && submitTP) {
            setSelectedSchema(submitTP.schema);
            setShowNewTP(true);
        } else {
            // Иначе обнуляем состояние
            setSelectedTechProcess(undefined);
        }
    }

    // Коллбек для сброса на изначальное состояние
    const hideAll = () => {
        setShowTPList(false);
        setEdited(false);
        setShowNewTP(false);
        setSelectedSchema({});
        setSelectedTechProcess(undefined);
    }

    // Коллбек при выборе технологического процесса из списка
    const setTechProcessClb = (techProcess: TechProcess) => {
        setSelectedSchema(techProcess.schema);
        setSelectedTechProcess(techProcess);
        setShowTPList(false);
        setShowNewTP(true);
    }

    // Коллбек при выборе схемы из списка для конструктора
    const setConstructorClb = (schema: TechProcessSchema) => {
        setShowNewTP(true);
        setSelectedSchema(schema);
        setShowTPList(false);
    }

    // Коллбек при отмене изменения в выбранном техпроцессе
    const selectedTPCloseClb = () => {
        setShowTPList(!!submitTP);
        setEdited(false);
        setShowNewTP(false);
        setShowTPList(false);
    }

    return (
        <div data-bs-theme={'light'}>
            {submitTP &&
                <TpSelected
                    variant={'current'}
                    imageUrl={submitTP?.image || ""}
                    schema={submitTP.schema}
                    title={`Текущий технологический процесс: ${submitTP?.name || 'Новый'}`}
                    editClb={editClb}
                    closeEditClb={hideAll}
                    edited={edited}
                    inspector={`${product.technological_process_confirmed?.first_name || ''} ${product.technological_process_confirmed?.last_name || ''}`}
                />
            }

            {showNewTP &&
                <TpSelected
                    setNewTP={setSubmitTP}
                    productId={product.id}
                    variant={'selected'}
                    imageUrl={selectedTechProcess?.image || ""}
                    techProcess={selectedTechProcess}
                    edited={true}
                    closeEditClb={selectedTPCloseClb}
                    setSchema={setSelectedSchema}
                    schema={selectedSchema || selectedTechProcess?.schema}
                    title={`Предложенный технологический процесс: ${selectedTechProcess?.name || 'Новый'}`}
                    updateClb={updCallback}
                />
            }

            {showTPList &&
                <TechProcessList constructorCallback={setConstructorClb}
                                 submitCallback={setTechProcessClb}/>
            }
        </div>
    );
};
