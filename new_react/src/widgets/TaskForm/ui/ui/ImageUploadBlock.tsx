import React, {ChangeEvent, useEffect, useMemo, useState} from "react";
import {Button} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import {AppSlider} from "@shared/ui";
import {styled} from "@mui/material/styles";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {Task} from "@pages/TaskPage";
import {GET_STATIC_URL} from "@shared/consts";
import ClearIcon from "@mui/icons-material/Clear";
import {useDeleteTaskImage} from "@widgets/TaskForm/model/api";


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface ImageUploadBlockProps {
    task?: Task;
    formTask: CreateTask;
    setFormTask: (task: CreateTask) => void;
    disabled: boolean;
}

interface NewImage {
    url: string,
    file: File
}

interface EditImage {
    url: string,
    isNew: boolean,
}

export const ImageUploadBlock = (props: ImageUploadBlockProps) => {
    const {task, formTask, setFormTask, disabled} = props;
    const [initialImages, setInitialImages] = useState<string[]>(
        task?.task_images ? task.task_images.map(image => image.image) : []
    );
    const [newImages, setNewImages] = useState<NewImage[]>([]);
    const [deleteTaskImage] = useDeleteTaskImage();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (validFiles.length > 0) {
            // const newImagesUrl = validFiles.map(file => URL.createObjectURL(file));
            const newImagesList: NewImage[] = validFiles.map(file => {
                return {
                    url: URL.createObjectURL(file),
                    file: file
                }
            })
            setNewImages([...newImages, ...newImagesList]);
        } else {
            alert('Please upload valid image files.');
        }
    };

    useEffect(() => {
        const fileList = newImages.map(newImage => newImage.file)
        if (fileList !== formTask.images) {
            setFormTask({
                ...formTask,
                images: fileList,
            });
        }
    }, [formTask, newImages, setFormTask])

    const deleteClb = async (imageUrl: string) => {
        if (imageUrl.startsWith('blob')) {
            setNewImages(newImages.filter(newImage => newImage.url !== imageUrl));
        } else {
            if (window.confirm("Удалить изображение?")) {
                const targetImageObj = task?.task_images?.find(image => image.image === imageUrl);
                if (targetImageObj) {
                    try {
                        await deleteTaskImage(targetImageObj.id).unwrap();
                        // Успешно удалено
                        alert("Изображение удалено. ");
                        setInitialImages(initialImages.filter(url => url !== imageUrl));
                    } catch (error) {
                        // Обработка ошибок
                        alert("Ошибка удаления. ");
                    }
                }
            }
        }
    }

    const sliderUrls = useMemo(() => {
        const newImagesUrls = newImages.map(newImage => newImage.url)
        return [...newImagesUrls, ...initialImages]
    }, [initialImages, newImages])

    const editImagesList: EditImage[] = useMemo(() => {
        const newImagesUrls: EditImage[] = newImages.map(newImage => ({
            url: newImage.url,
            isNew: true,
        }))
        const initialImagesList: EditImage[] = initialImages.map(url => ({
            url: url,
            isNew: false,
        }))
        return [...newImagesUrls, ...initialImagesList]
    }, [initialImages, newImages])

    return (
        <div className={'d-flex gap-3 flex-fill'}>
            <Button
                disabled={disabled}
                component="label"
                role={undefined}
                variant="outlined"
                color={'inherit'}
                tabIndex={-1}
            >
                <AddAPhotoIcon fontSize={'inherit'} className={'fs-3'}/>
                <VisuallyHiddenInput type="file" onChange={handleFileChange} multiple/>
            </Button>

            <div className={'bg-light border border-1 border-black rounded p-1'}>
                <AppSlider
                    images={sliderUrls}
                    width={'180px'}
                    height={'180px'}
                />
            </div>

            {!disabled && sliderUrls.length > 0 &&
                <div className={'d-block h-100 border border-1 border-black rounded p-2'}
                     style={{
                         overflowY: 'auto',
                         overflowX: 'hidden',
                         maxHeight: '190px'
                     }}
                >
                    {editImagesList.map(image => (
                        <div key={image.url} className={'position-relative'}>
                            <button
                                className={'appBtn border-1 border-secondary flex-fill ms-1 fs-6 position-absolute'}
                                type={'button'}
                                style={{
                                    borderRadius: '50%',
                                    padding: '.2rem',
                                    top: '-5px',
                                    right: '-5px',
                                }}
                                onClick={() => deleteClb(image.url)}
                            >
                                <ClearIcon fontSize={'inherit'} className={'text-secondary fs-5'}/>
                            </button>

                            <img
                                src={image.url.startsWith("http") || image.url.startsWith("blob")
                                    ? image.url
                                    : GET_STATIC_URL() + image.url
                                }
                                style={{maxWidth: "70px", maxHeight: "70px"}}
                                className={`rounded m-0 p-0 ${image.isNew && "border-success border-2 border"}`}
                                alt={"Slide"}
                                loading={"lazy"}
                            />
                            <hr/>
                        </div>
                    ))}
                </div>
            }
        </div>
    );
};
