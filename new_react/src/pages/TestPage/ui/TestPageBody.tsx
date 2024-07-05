import {useEmployeeList} from "@widgets/TaskForm/model/api";
import {Tree} from 'react-d3-tree';
import {Employee} from "@entities/Employee";

interface RawNodeDatum {
    name: string;
    children?: RawNodeDatum[];
}

function buildOrgChart(employees: Employee[]): RawNodeDatum | undefined {
    const employeeMap = new Map<number, RawNodeDatum>();

    // Create a node for each employee and store it in the map
    for (const employee of employees) {
        employeeMap.set(employee.id, {name: employee.first_name || employee.username, children: []});
    }

    let root: RawNodeDatum | undefined;

    // Build the tree structure
    for (const employee of employees) {
        const node = employeeMap.get(employee.id)!;
        if (employee.boss) {
            const bossNode = employeeMap.get(employee.boss)!;
            bossNode.children!.push(node);
        } else {
            root = node;
        }
    }

    return root;
}

export const TestPageBody = () => {
    const {data: employees} = useEmployeeList({});

    const orgChart = buildOrgChart(employees || []);

    return (
        <div style={{width: '100%', height: '90vh'}}>
            {orgChart ? (
                <Tree data={orgChart}/>
            ) : (
                <div>No data available</div>
            )}
        </div>
    );
};
