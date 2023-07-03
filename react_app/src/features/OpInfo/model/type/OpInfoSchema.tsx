import {tech_process_schema, technological_process} from "entities/TechnologicalProcess";



export interface OpInfoSchema {
    tech_process_list?: technological_process[],
    constructor_schema?: tech_process_schema,
    show_constructor: boolean,
    change_tech_process: boolean,
}