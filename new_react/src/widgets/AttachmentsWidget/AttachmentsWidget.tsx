import {useState, ChangeEvent, useEffect} from "react";
import {AppVoiceInput} from "@shared/ui";
import {$axiosAPI} from "@shared/api";
import {useAppModal, useCurrentUser} from "@shared/hooks";

// Определяем типы ввода
type IInputTypes = 'image' | 'video' | 'audio' | 'text' | 'file';

interface AttachmentItem {
    id: string | number;
    type: IInputTypes;
    content?: File | string;
    name: string;
    url?: string;
    author?: number;
    file?: string; // URL файла с бэкенда
    text?: string; // Текст с бэкенда
}

interface Props {
    contentType: 'product' | 'order' | 'task' | string; // Тип контента
    objectId: string | number;                         // ID объекта, к которому прикрепляем
    onSave?: (data: { type: IInputTypes; content: File | string; id?: string | number }) => void;
}

export const AttachmentsWidget = (props: Props) => {
    const MAX_FILE_SIZE_MB = 100;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const {handleOpen} = useAppModal();


    const {contentType, objectId, onSave} = props;
    const [textValue, setTextValue] = useState("");
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {currentUser} = useCurrentUser();

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

    const deleteAttachment = async (id: string | number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту заметку?')) return;

        try {
            setIsLoading(true);
            await $axiosAPI.delete(`/attachments/${id}/`);
            // Обновляем локальный стейт после успешного удаления
            setAttachments(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting attachment:', error);
            alert('Ошибка при удалении вложения');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: IInputTypes) => {
        const file = e.target.files?.[0];
        if (file) {
            // Проверка размера файла
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE_MB} МБ. Ваш файл: ${(file.size / (1024 * 1024)).toFixed(2)} МБ`);
                // Сбрасываем значение инпута, чтобы пользователь мог выбрать другой файл
                e.target.value = '';
                return;
            }
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
        fontSize: '2rem',
        border: '2px dashed #dee2e6',
        width: '80px',
        height: '80px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '12px',
        backgroundColor: '#fff',
        transition: 'all 0.2s ease'
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
        <div className={'d-flex flex-column gap-4 border p-4 bg-white shadow-sm rounded-3'}
             style={{minHeight: '300px', opacity: isUploading ? 0.7 : 1, pointerEvents: isUploading ? 'none' : 'auto'}}>
            <style>
                {`
                .attachment-type-btn:hover {
                    border-color: #0d6efd !important;
                    background-color: #f8f9fa !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                }
                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                `}
            </style>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="m-0">
                    Вложения
                    {contentType && <span className="text-muted ms-1">({contentType}</span>}
                    {objectId && <span className="text-muted"> ID: {objectId})</span>}
                </h4>
                {isUploading && <span className="spinner-border spinner-border-sm text-primary" role="status"></span>}
            </div>

            {/* ВЕРХНЯЯ ПАНЕЛЬ ВЫБОРА (БЕЗ ТЕКСТА) */}
            <div className={'d-flex gap-3 flex-wrap'}>
                <div style={boxStyle} title="Сделать фото" className="attachment-type-btn">
                    <span>📸</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'image')}
                    />
                </div>

                <div style={boxStyle} title="Записать голос" className="attachment-type-btn">
                    <span>🎙️</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="audio/*"
                        capture
                        onChange={(e) => handleFileChange(e, 'audio')}
                    />
                </div>

                <div style={boxStyle} title="Записать видео" className="attachment-type-btn">
                    <span>🎥</span>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'video')}
                    />
                </div>

                <div style={boxStyle} title="Прикрепить файл" className="attachment-type-btn">
                    <span>📁</span>
                    <input
                        style={inputStyle}
                        type="file"
                        onChange={(e) => handleFileChange(e, 'file')}
                    />
                </div>

                <AppVoiceInput
                    style={{
                        maxWidth: '800px'
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
                <h5 className="mb-3">Список вложений:</h5>
                {isLoading && <div className="text-center my-4">
                    <div className="spinner-border text-primary"></div>
                </div>}
                {!isLoading && attachments.length === 0 &&
                    <p className="text-muted text-center my-4">Нет добавленных файлов</p>}

                <div className="row g-3">
                    {attachments.map((item) => {
                        const previewUrl = item.file || item.url;
                        const textContent = item.text || (typeof item.content === 'string' ? item.content : '');
                        const fileName = item.name || (previewUrl ? previewUrl.split('/').pop() : '');

                        return (
                            <div key={item.id} className="col-12 col-sm-6 col-md-4 d-flex">
                                <div className="card shadow-sm border-0 w-100 overflow-hidden"
                                     style={{minHeight: '250px', transition: 'transform 0.2s'}}>
                                    <div
                                        className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-1 px-2">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <span className="badge bg-secondary-subtle text-secondary text-uppercase"
                                                  style={{fontSize: '0.7rem'}}>
                                                {item.type}
                                            </span>
                                            <small className="text-truncate fw-semibold" title={fileName}>
                                                Вложение {item.id} ({fileName || `ID: ${item.id}`})
                                            </small>
                                        </div>
                                        {currentUser.id === item.author && (
                                            <button
                                                className="btn btn-link text-danger p-0 p-2 ms-2"
                                                onClick={() => deleteAttachment(item.id)}
                                                title="Удалить"
                                                style={{
                                                    fontSize: '2rem',
                                                    lineHeight: 1,
                                                    backgroundColor: 'rgba(248,248,248,0.59)'
                                                }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>

                                    <div
                                        className="position-relative card-body p-0 d-flex flex-column justify-content-center bg-light-subtle">
                                        <div
                                            className="attachment-preview w-100 d-flex align-items-center justify-content-center overflow-hidden h-100">
                                            {item.type === 'image' && (
                                                <img
                                                    onClick={() => handleOpen(
                                                        <img
                                                            src={previewUrl}
                                                            alt="preview"
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '93dvh',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                    src={previewUrl}
                                                    alt="preview"
                                                    style={{width: '100%', height: '220px', objectFit: 'cover'}}
                                                />
                                            )}

                                            {item.type === 'video' && (
                                                <video
                                                    onClick={() => handleOpen(
                                                        <video
                                                            src={previewUrl}
                                                            controls
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '93dvh',
                                                                backgroundColor: '#000',
                                                                objectFit: 'contain'
                                                            }}/>
                                                    )}
                                                    src={previewUrl}
                                                    style={{
                                                        width: '100%',
                                                        height: '220px',
                                                        backgroundColor: '#000',
                                                        objectFit: 'contain'
                                                    }}/>
                                            )}

                                            {item.type === 'audio' && (
                                                <div className="p-3 w-100 h-100 d-flex align-items-center">
                                                    <audio src={previewUrl} controls className="w-100"/>
                                                </div>
                                            )}

                                            {item.type === 'text' && (
                                                <div className="p-3 w-100 overflow-auto h-100"
                                                     style={{maxHeight: '220px'}}
                                                     onClick={() => handleOpen(
                                                         <div style={{whiteSpace: 'pre-wrap', fontSize: '1.2rem'}}>
                                                             {textContent}
                                                         </div>
                                                     )}
                                                >
                                                    <div style={{whiteSpace: 'pre-wrap', fontSize: '0.9rem'}}>
                                                        {textContent}
                                                    </div>
                                                </div>
                                            )}

                                            {item.type === 'file' && (
                                                <div
                                                    className="p-4 w-100 text-center h-100 d-flex flex-column justify-content-center">
                                                    <div className="display-4 mb-2">📄</div>
                                                    <div
                                                        className="text-truncate mb-3 px-2 small fw-bold">{fileName}</div>
                                                    <div>
                                                        <a
                                                            href={previewUrl}
                                                            download={fileName}
                                                            className="btn btn-sm btn-primary rounded-pill px-3"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Скачать
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};