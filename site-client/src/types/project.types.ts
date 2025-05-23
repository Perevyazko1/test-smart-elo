export interface ProjectImage {
    id: number;
    image_url: string;
    thumbnail_url: string;
    sort_order: number;
    description: string;
    is_published: boolean;
    is_preview: boolean;
}

export interface Project {
    id: number;
    name: string;
    about: string;
    public: boolean;
    preview_image: ProjectImage;
}

export interface ProjectListData {
    total: number;
    limit: number;
    offset: number;
    data: Project[];
}


export interface ProjectImagesListData {
    total: number;
    limit: number;
    offset: number;
    data: ProjectImage[];
}
