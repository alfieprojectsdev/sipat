import React, { useState, useEffect } from 'react';
import { SurveyEngine } from '../lib/engine';
import type { SurveyDefinition, SurveyNode } from '../lib/types';
import '../styles/main.css';

interface Props {
    definition: SurveyDefinition;
}

export const SurveyWizard: React.FC<Props> = ({ definition }) => {
    const [engine] = useState(() => new SurveyEngine(definition));
    const [currentNode, setCurrentNode] = useState<SurveyNode | null>(null);
    const [inputValue, setInputValue] = useState<any>(null);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        // Start the engine
        try {
            const startNode = engine.start();
            setCurrentNode(startNode);
            setIsStarted(true);
        } catch (e) {
            console.error(e);
        }
    }, [engine]);

    const handleNext = () => {
        if (currentNode?.type === 'summary') {
            alert('Survey Completed! Data would be saved here.');
            return;
        }

        const nextNode = engine.next(inputValue);
        setCurrentNode(nextNode);
        setInputValue(null); // Reset input for next question
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleChoiceSelect = (value: any) => {
        setInputValue(value);
    };

    if (!currentNode) {
        if (isStarted) return <div className="survey-container">Survey Completed</div>;
        return <div className="survey-container">Loading...</div>;
    }

    const renderContent = () => {
        const { type, content } = currentNode;

        switch (type) {
            case 'info':
                return (
                    <div>
                        <h1>{content.label || 'Information'}</h1>
                        <p>{content.text}</p>
                    </div>
                );

            case 'text':
                return (
                    <div>
                        <h1>{content.question}</h1>
                        {content.helper_text && <p className="helper">{content.helper_text}</p>}
                        <div className="input-group">
                            <input
                                type="text"
                                value={inputValue || ''}
                                onChange={handleTextChange}
                                placeholder="Type your answer..."
                                autoFocus
                            />
                        </div>
                    </div>
                );

            case 'single_choice':
                return (
                    <div>
                        <h1>{content.question}</h1>
                        <div className="choices">
                            {content.options?.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`choice-btn ${inputValue === opt.value ? 'selected' : ''}`}
                                    onClick={() => handleChoiceSelect(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'boolean':
                return (
                    <div>
                        <h1>{content.question}</h1>
                        <div className="choices">
                            <button
                                className={`choice-btn ${inputValue === true ? 'selected' : ''}`}
                                onClick={() => handleChoiceSelect(true)}
                            >
                                {content.label_true || 'Yes'}
                            </button>
                            <button
                                className={`choice-btn ${inputValue === false ? 'selected' : ''}`}
                                onClick={() => handleChoiceSelect(false)}
                            >
                                {content.label_false || 'No'}
                            </button>
                        </div>
                    </div>
                );

            case 'summary':
                return (
                    <div>
                        <h1>Survey Complete</h1>
                        <p>{content.text}</p>
                    </div>
                );

            default:
                return <div>Unknown node type: {type}</div>;
        }
    };

    return (
        <div className="survey-container">
            {renderContent()}

            <div className="actions">
                {/* Disable next if required and no input (simplified validation) */}
                <button className="primary" onClick={handleNext}>
                    {currentNode.type === 'summary' ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};
