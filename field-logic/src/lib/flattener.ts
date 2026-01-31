import type { SurveyDefinition, UserSession } from '../types/schema';

export class SurveyFlattener {
    constructor(private definition: SurveyDefinition) { }

    generateHeaderMap(): string[] {
        // Rule 1: Every node ID becomes a column header
        return this.definition.nodes.map(node => node.id);
    }

    flattenResponse(session: UserSession): any[] {
        const headers = this.generateHeaderMap();

        return headers.map(nodeId => {
            // Logic Check
            const visited = session.visitedNodes.includes(nodeId);
            const answer = session.responses[nodeId];

            if (visited) {
                // If visited but no answer, return null (undefined translates to null logic here)
                return answer !== undefined ? answer : null;
            } else {
                // If NOT visited -> Skipped
                return 'N/A';
            }
        });
    }

    toCSV(sessions: UserSession[]): string {
        const headers = this.generateHeaderMap();
        const rows = sessions.map(session => this.flattenResponse(session));

        const headerRow = headers.join(',');

        const dataRows = rows.map(row => {
            return row.map((cell: any) => {
                if (cell === null || cell === undefined) return '';
                const str = String(cell);
                // Escape quotes and wrap in quotes if contains comma or newline
                if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        return [headerRow, ...dataRows].join('\n');
    }
}
