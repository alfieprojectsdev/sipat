import type { SurveyDefinition, SurveyNode, UserSession } from '../types/schema';

export class SurveyEngine {
    private definition: SurveyDefinition;
    private session: UserSession;
    private currentNodeId: string | null = null;

    constructor(definition: SurveyDefinition, sessionId: string = 'default') {
        this.definition = definition;
        this.session = {
            sessionId,
            responses: {},
            visitedNodes: []
        };
    }

    // --- Core State Management ---

    start(): SurveyNode {
        const startNode = this.definition.nodes.find(n => n.id === 'start') || this.definition.nodes[0];
        if (!startNode) throw new Error('Survey has no nodes');

        this.currentNodeId = startNode.id;
        this.session.visitedNodes = [startNode.id];
        return startNode;
    }

    getCurrentNode(): SurveyNode {
        if (!this.currentNodeId) throw new Error('Survey not started');
        const node = this.definition.nodes.find(n => n.id === this.currentNodeId);
        if (!node) throw new Error(`Node ${this.currentNodeId} not found`);
        return node;
    }

    getSession(): UserSession {
        return this.session;
    }

    // --- The Interpreter Logic ---

    submitAnswer(answer: any): SurveyNode | null {
        if (!this.currentNodeId) throw new Error('Survey not active');

        // 1. Save Answer
        this.session.responses[this.currentNodeId] = answer;

        // 2. Determine Next Node
        const nextNodeId = this.evaluateRouting(answer);

        // 3. Transition
        if (nextNodeId) {
            this.currentNodeId = nextNodeId;
            this.session.visitedNodes.push(nextNodeId);
            return this.getCurrentNode();
        } else {
            // End of survey
            this.currentNodeId = null;
            return null;
        }
    }

    private evaluateRouting(answer: any): string | null {
        const currentNode = this.getCurrentNode();
        const rules = currentNode.routing.rules;

        // A. Check conditional rules
        if (rules && rules.length > 0) {
            for (const rule of rules) {
                if (this.checkCondition(rule.operator, rule.value, answer)) {
                    return rule.target;
                }
            }
        }

        // B. Fallback to default
        return currentNode.routing.default;
    }

    private checkCondition(operator: string, expected: any, actual: any): boolean {
        switch (operator) {
            case 'equals':
                return actual === expected;
            default:
                return false;
        }
    }
}
