import {useState, ChangeEvent, useEffect} from "react";
import {AppVoiceInput} from "@shared/ui";
import {$axiosAPI} from "@shared/api";

// Определяем типы ввода
type IInputTypes = 'image' | 'video' | 'audio' | 'text' | 'file';

interface AttachmentItem {
    id: string | number;
    type: IInputTypes;
    content?: File | string;
    name: string;
    url?: string;
    file?: string; // URL файла с бэкенда
    text?: string; // Текст с бэкенда
}

interface Props {
    contentType: 'product' | 'order' | 'task' | string; // Тип контента
    objectId: string | number;                         // ID объекта, к которому прикрепляем
    onSave?: (data: { type: IInputTypes; content: File | string; id?: string | number }) => void;
}

export const AttachmentsWidget = (props: Props) => {
    const {contentType, objectId, onSave} = props;
    const [textValue, setTextValue] = useState("");
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка существующих вложений
    const fetchAttachments = async () => {
        try {
            setIsLoading(true);
            const response = await $axiosAPI.get('/attachments/', {
                params: {
                    content_type: contentType,
                    object_id: objectId,
                }
            });
            console.log('Attachments fetched:', response.data);
            setAttachments(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching attachments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contentType && objectId) {
            fetchAttachments();
        }
    }, [contentType, objectId]);

    // Функция для отправки на бэкенд
    const saveAttachmentToBackend = async (type: IInputTypes, content: File | string) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('content_type', String(contentType));
        formData.append('object_id', String(objectId));

        if (content instanceof File) {
            formData.append('file', content);
        } else {
            formData.append('text', content);
        }

        try {
            setIsUploading(true);
            const response = await $axiosAPI.post('/attachments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Attachment saved:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error saving attachment:', error);
            alert('Ошибка при сохранении вложения');
        } finally {
            setIsUploading(false);
        }
    };

    // Обработчик добавления вложений в список
    const addAttachment = async (type: IInputTypes, content: File | string) => {
        const backendData = await saveAttachmentToBackend(type, content);

        if (!backendData) return;

        const newItem: AttachmentItem = {
            id: backendData.id || Date.now(),
            type,
            content,
            name: content instanceof File ? content.name : `Заметка ${attachments.length + 1}`,
            url: content instanceof File ? URL.createObjectURL(content) : undefined
        };
        setAttachments(prev => [newItem, ...prev]);

        if (onSave) {
            onSave({type, content, id: backendData.id});
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: IInputTypes) => {
        const file = e.target.files?.[0];
        if (file) {
            addAttachment(type, file);
        }
    };

    const handleTextSave = () => {
        if (textValue.trim()) {
            addAttachment('text', textValue);
            setTextValue("");
        }
    };

    const boxStyle: React.CSSProperties = {
        fontSize: '4rem',
        border: 'dotted 2px #ccc',
        width: '100px',
        height: '100px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
    };

    const inputStyle: React.CSSProperties = {
        opacity: 0,
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    };

    return (
        <div className={'d-flex flex-column gap-4 border p-3 bg-white shadow-sm'}
             style={{minHeight: '400px', opacity: isUploading ? 0.7 : 1, pointerEvents: isUploading ? 'none' : 'auto'}}>
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                    Вложения
                    {contentType && <span className="text-muted ms-1">({contentType}</span>}
                    {objectId && <span className="text-muted"> ID: {objectId})</span>}
                </h4>
                {isUploading && <span className="spinner-border spinner-border-sm text-primary" role="status"></span>}
            </div>

            {/* ВЕРХНЯЯ ПАНЕЛЬ ВЫБОРА (БЕЗ ТЕКСТА) */}
            <div className={'d-flex gap-3 flex-wrap'}>
                <div style={boxStyle} title="Сделать фото">
                    <span>📸</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'image')}
                    />
                </div>

                <div style={boxStyle} title="Записать голос">
                    <span>🎙️</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="audio/*"
                        capture
                        onChange={(e) => handleFileChange(e, 'audio')}
                    />
                </div>

                <div style={boxStyle} title="Записать видео">
                    <span>🎥</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'video')}
                    />
                </div>

                <div style={boxStyle} title="Прикрепить файл">
                    <span>📁</span>
                    <input
                        style={inputStyle}
                        type="file"
                        onChange={(e) => handleFileChange(e, 'file')}
                    />
                </div>
            </div>

            {/* ТЕКСТОВЫЙ ВВОД СНИЗУ */}
            <div className="mt-auto pt-3 border-top">
                <AppVoiceInput
                    style={{
                        maxWidth:'800px'
                    }}
                    value={textValue}
                    onSubmit={handleTextSave}
                    setValue={setTextValue}
                    label={'Текстовая заметка'}
                    asTextarea={true}
                />
            </div>

            {/* СПИСОК ДОБАВЛЕННЫХ ФАЙЛОВ И ПРОСМОТР */}
            <div className="flex-grow-1 border-top pt-3">
                <h5>Список вложений:</h5>
                {isLoading && <div className="text-center">
                    <div className="spinner-border spinner-border-sm"></div>
                </div>}
                {!isLoading && attachments.length === 0 && <p className="text-muted">Нет добавленных файлов</p>}
                <div className="d-flex flex-column gap-3">
                    {attachments.map((item) => {
                        const previewUrl = item.file || item.url;
                        const textContent = item.text || (typeof item.content === 'string' ? item.content : '');
                        const fileName = item.name || (previewUrl ? previewUrl.split('/').pop() : '');

                        return (
                            <div key={item.id} className="card p-2">
                                <div className="d-flex justify-content-between mb-2 border-bottom pb-1">
                                    <strong>{item.type.toUpperCase()}:
                                        Вложение {item.id} {fileName && `(${fileName})`}</strong>
                                </div>

                                <div className="attachment-preview">
                                    {item.type === 'image' && (
                                        <img src={previewUrl} alt="preview"
                                             style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}/>
                                    )}

                                    {item.type === 'video' && (
                                        <video src={previewUrl} controls
                                               style={{maxWidth: '100%', maxHeight: '300px'}}/>
                                    )}

                                    {item.type === 'audio' && (
                                        <audio src={previewUrl} controls className="w-100"/>
                                    )}

                                    {item.type === 'text' && (
                                        <div className="p-2 bg-light border rounded" style={{whiteSpace: 'pre-wrap'}}>
                                            {textContent}
                                        </div>
                                    )}

                                    {item.type === 'file' && (
                                        <div
                                            className="p-3 border rounded bg-light d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{fontSize: '1.5rem'}}>📄</span>
                                                <span className="text-truncate"
                                                      style={{maxWidth: '300px'}}>{fileName}</span>
                                            </div>
                                            <a
                                                href={previewUrl}
                                                download={fileName}
                                                className="btn btn-sm btn-outline-primary"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Скачать
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};