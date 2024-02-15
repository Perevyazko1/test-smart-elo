import {useState} from "react";

import {TechProcessList} from "@widgets/TechProcessWidget/ui/TechProcessList";
import {EqCardType} from "@pages/EqPage/model/types/eqCardType";
import {TechProcess, TechProcessSchema} from "@entities/TechProcess";
import {TpSelected} from "@widgets/TechProcessWidget/ui/TPSelected";


interface TechProcessWidgetProps {
    card: EqCardType;
    updCallback?: () => void;
}


export const TechProcessWidget = (props: TechProcessWidgetProps) => {
    const {card, updCallback} = props;

    const [showNewTP, setShowNewTP] = useState<boolean>(false);
    const [edited, setEdited] = useState<boolean>(false);

    const [showTPList, setShowTPList] = useState<boolean>(!card.product.technological_process);

    const [submitTP, setSubmitTP] = useState<TechProcess | null>(card.product.technological_process);

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
    }

    return (
        <div>
            {submitTP &&
                <TpSelected
                    variant={'current'}
                    imageUrl={submitTP?.image || ""}
                    schema={submitTP.schema}
                    title={`Текущий технологический процесс: ${submitTP?.name || 'Новый'}`}
                    editClb={editClb}
                    closeEditClb={hideAll}
                    edited={edited}
                    inspector={`${card.product.technological_process_confirmed?.first_name || ''} ${card.product.technological_process_confirmed?.last_name || ''}`}
                />
            }

            {showNewTP &&
                <TpSelected
                    setNewTP={setSubmitTP}
                    productId={card.product.id}
                    variant={'selected'}
                    imageUrl={selectedTechProcess?.image || ""}
                    techProcess={selectedTechProcess}
                    edited={true}
                    closeEditClb={selectedTPCloseClb}
                    setSchema={setSelectedSchema}
                    schema={selectedSchema || selectedTechProcess?.schema}
                    title={`Предложенный технологический процесс: ${selectedTechProcess?.name || 'Новый'}`}
                    newProduct={!card.product.technological_process_confirmed}
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
