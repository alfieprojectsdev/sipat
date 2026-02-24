import { describe, it, expect, beforeEach } from 'vitest';
import { SurveyFlattener } from './flattener';
import type { SurveyDefinition, UserSession } from '../types/schema';

const mockSurvey: SurveyDefinition = {
    meta: {
        survey_id: "test_v1",
        title: "Test Survey",
        version: "1.0",
        created_at: "2023-01-01"
    },
    config: { allow_back_navigation: true, save_progress_automatically: false },
    nodes: [
        { id: "start", type: "info", content: { text: "Welcome" }, routing: { default: "q1" } },
        { id: "q1", type: "boolean", content: { question: "Q1" }, routing: { default: "q2" } },
        { id: "q2", type: "text", content: { question: "Q2" }, routing: { default: "end" } },
        { id: "end", type: "summary", content: { text: "Done" }, routing: { default: null } }
    ]
};

describe('SurveyFlattener', () => {
    let flattener: SurveyFlattener;

    beforeEach(() => {
        flattener = new SurveyFlattener(mockSurvey);
    });

    it('generateHeaderMap should return all node IDs in order', () => {
        const headers = flattener.generateHeaderMap();
        expect(headers).toEqual(['start', 'q1', 'q2', 'end']);
    });

    it('flattenResponse should handle answered questions', () => {
        const session: UserSession = {
            sessionId: 'sess1',
            visitedNodes: ['start', 'q1', 'q2', 'end'],
            responses: {
                'q1': true,
                'q2': 'Hello'
            }
        };
        const row = flattener.flattenResponse(session);
        // start is info, no answer -> null
        // q1 -> true
        // q2 -> 'Hello'
        // end -> null
        expect(row[1]).toBe(true);
        expect(row[2]).toBe('Hello');
    });

    it('flattenResponse should mark skipped questions', () => {
        // Simulate a branching where q2 was skipped
        const session: UserSession = {
            sessionId: 'sess2',
            visitedNodes: ['start', 'q1', 'end'], // q2 missing from visited
            responses: {
                'q1': false
            }
        };
        const row = flattener.flattenResponse(session);

        // q2 should be SKIPPED
        expect(row[2]).toBe('N/A');
    });

    it('toCSV should generate a valid CSV string', () => {
        const session: UserSession = {
            sessionId: 'sess1',
            visitedNodes: ['start', 'q1', 'q2', 'end'],
            responses: { 'q1': true, 'q2': 'Hello, World' } // Comma in text
        };
        const csv = flattener.toCSV([session]);
        const lines = csv.split('\n');

        // Header
        expect(lines[0]).toBe('start,q1,q2,end');

        // Data
        // "Hello, World" should be quoted? Or handled simply. Spec says "proper escaping".
        // Let's expect basic quoting for commas
        expect(lines[1]).toContain('"Hello, World"');
    });

    it('toCSV should escape double quotes correctly', () => {
        const session: UserSession = {
            sessionId: 'sess3',
            visitedNodes: ['start', 'q2', 'end'],
            responses: { 'q2': 'He said "Hello"' }
        };
        const csv = flattener.toCSV([session]);
        const lines = csv.split('\n');
        // Expect: ..., "He said ""Hello""", ...
        expect(lines[1]).toContain('"He said ""Hello"""');
    });

    it('toCSV should handle newlines by wrapping in quotes', () => {
        const session: UserSession = {
            sessionId: 'sess4',
            visitedNodes: ['start', 'q2', 'end'],
            responses: { 'q2': 'Line 1\nLine 2' }
        };
        const csv = flattener.toCSV([session]);

        // Since the value contains a newline, it should be wrapped in quotes
        expect(csv).toContain('"Line 1\nLine 2"');
    });

    it('toCSV should handle mixed special characters (comma, quote, newline)', () => {
        const session: UserSession = {
            sessionId: 'sess5',
            visitedNodes: ['start', 'q2', 'end'],
            responses: { 'q2': 'Line 1, "quote"\nLine 2' }
        };
        const csv = flattener.toCSV([session]);

        // Expect: "Line 1, ""quote""\nLine 2"
        // Note: internal quotes are doubled
        expect(csv).toContain('"Line 1, ""quote""\nLine 2"');
    });
});
