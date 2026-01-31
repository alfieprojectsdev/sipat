import { describe, it, expect, beforeEach } from 'vitest';
import { SurveyEngine } from './SurveyEngine';
import type { SurveyDefinition } from '../types/schema';

const mockSurvey: SurveyDefinition = {
    meta: {
        survey_id: "test_v1",
        title: "Test Survey",
        version: "1.0",
        created_at: "2023-01-01"
    },
    config: {
        allow_back_navigation: true,
        save_progress_automatically: false
    },
    nodes: [
        {
            id: "start",
            type: "info",
            content: { text: "Welcome" },
            routing: { default: "q1" }
        },
        {
            id: "q1",
            type: "boolean",
            content: { question: "Yes or No?" },
            routing: {
                rules: [
                    { operator: "equals", value: true, target: "q2_yes" },
                    { operator: "equals", value: false, target: "q2_no" }
                ],
                default: "end"
            }
        },
        {
            id: "q2_yes",
            type: "text",
            content: { question: "Why yes?" },
            routing: { default: "end" }
        },
        {
            id: "q2_no",
            type: "text",
            content: { question: "Why no?" },
            routing: { default: "end" }
        },
        {
            id: "end",
            type: "summary",
            content: { text: "Done" },
            routing: { default: null }
        }
    ]
};

describe('SurveyEngine', () => {
    let engine: SurveyEngine;

    beforeEach(() => {
        engine = new SurveyEngine(mockSurvey, 'test_session');
    });

    it('should start at the first node', () => {
        const node = engine.start();
        expect(node.id).toBe('start');
    });

    it('should navigate to next node via default route', () => {
        engine.start();
        const node = engine.submitAnswer(null); // 'info' type has no answer
        expect(node?.id).toBe('q1');
    });

    it('should handle boolean branching (true)', () => {
        engine.start();
        engine.submitAnswer(null); // move to q1
        const node = engine.submitAnswer(true); // Answer true to q1
        expect(node?.id).toBe('q2_yes');
    });

    it('should handle boolean branching (false)', () => {
        engine.start();
        engine.submitAnswer(null); // move to q1
        const node = engine.submitAnswer(false); // Answer false to q1
        expect(node?.id).toBe('q2_no');
    });

    it('should record answers in session', () => {
        engine.start();
        engine.submitAnswer(null); // q1
        engine.submitAnswer(true); // q2_yes
        const session = engine.getSession();

        expect(session.responses['q1']).toBe(true);
        expect(session.visitedNodes).toContain('q1');
        expect(session.visitedNodes).toContain('q2_yes');
    });
});
