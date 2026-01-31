export type NodeType = 'info' | 'text' | 'single_choice' | 'boolean' | 'summary' | 'audio';

export interface SurveyMeta {
    survey_id: string;
    title: string;
    version: string;
    created_at: string;
}

export interface SurveyConfig {
    allow_back_navigation: boolean;
    save_progress_automatically: boolean;
}

export interface RoutingRule {
    operator: 'equals';
    value: any;
    target: string;
}

export interface Routing {
    default: string | null;
    rules?: RoutingRule[];
}

export interface NodeOption {
    label: string;
    value: string;
}

export interface NodeContent {
    text?: string;
    label?: string;
    question?: string;
    helper_text?: string;
    options?: NodeOption[];
    label_true?: string;
    label_false?: string;
}

export interface Validation {
    required?: boolean;
    regex?: string;
}

export interface SurveyNode {
    id: string;
    type: NodeType;
    content: NodeContent;
    validation?: Validation;
    routing: Routing;
}

export interface SurveyDefinition {
    meta: SurveyMeta;
    config: SurveyConfig;
    nodes: SurveyNode[];
}

// User Session State
export interface UserSession {
    sessionId: string;
    responses: Record<string, any>; // nodeId -> answer
    visitedNodes: string[];
}
