import axios, { AxiosResponse } from "axios";
import { SERVER_URL } from "@/constants/constants";
import {
  Project,
  ProjectImagesListData,
  ProjectListData,
} from "@/types/project.types";

class ProjectsService {
  getProjects(): Promise<AxiosResponse<ProjectListData>> {
    return axios.get<ProjectListData>(`${SERVER_URL}/api/v1/projects/`);
  }
  getProject(id: string): Promise<AxiosResponse<Project>> {
    return axios.get<Project>(`${SERVER_URL}/api/v1/projects/${id}`);
  }
  getProjectImages(id: string): Promise<AxiosResponse<ProjectImagesListData>> {
    return axios.get<ProjectImagesListData>(
      `${SERVER_URL}/api/v1/projects/${id}/images`
    );
  }
}

export const projectService = new ProjectsService();
