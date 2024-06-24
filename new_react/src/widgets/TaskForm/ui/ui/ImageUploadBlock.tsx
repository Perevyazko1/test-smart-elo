import React, {ChangeEvent, useState} from "react";
import {Button} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import {AppSlider} from "@shared/ui";
import {styled} from "@mui/material/styles";
import {CreateTask} from "@widgets/TaskForm/model/types";
import {Task} from "@pages/TaskPage";


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

export const ImageUploadBlock = (props: ImageUploadBlockProps) => {
    const {task, formTask, setFormTask, disabled} = props;
    const [imagesUrl, setImagesUrl] = useState<string[]>(
        task?.task_images ? task.task_images.map(image => image.image) : []
    );

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (validFiles.length > 0) {
            const newImagesUrl = validFiles.map(file => URL.createObjectURL(file));
            setImagesUrl(newImagesUrl);
            setFormTask({
                ...formTask,
                images: validFiles,
            });
        } else {
            setImagesUrl([]);
            alert('Please upload valid image files.');
        }
        console.log(imagesUrl)
    };

    return (<div className={'d-flex gap-3 flex-fill'}>
            <Button
                disabled={disabled}
                component="label"
                role={undefined}
                variant="outlined"
                color={'inherit'}
                tabIndex={-1}
                startIcon={<CloudUploadIcon/>}
            >
                <AddAPhotoIcon/>
                <VisuallyHiddenInput type="file" onChange={handleFileChange} multiple/>
            </Button>

            <div className={'bg-light border border-1 border-black rounded p-1'}>
                <AppSlider
                    images={imagesUrl}
                    width={'180px'}
                    height={'180px'}
                />
            </div>
        </div>
    );
};
