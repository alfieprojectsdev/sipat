import React from 'react';

interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
    confidence: number;
    flagged?: boolean;
}

interface TranscriptData {
    meta: {
        file: string;
        duration: number;
        engine: string;
    };
    segments: TranscriptSegment[];
}

interface Props {
    data: TranscriptData;
}

export const TranscriptViewer: React.FC<Props> = ({ data }) => {
    const handleDeepLink = (e: React.MouseEvent, start: number) => {
        e.preventDefault();
        const file = data.meta.file;
        // Construct custom protocol link
        const url = `fieldlogic://open?file=${file}&t=${start}`;
        window.location.href = url;
    };

    return (
        <div className="transcript-viewer" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
            <h2>Transcription Review: {data.meta.file}</h2>

            <div className="segments">
                {data.segments.map((seg, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: seg.confidence < 0.6 ? '#fef3c7' : 'transparent'
                        }}
                    >
                        <span style={{ color: '#64748b', marginRight: '10px', userSelect: 'none' }}>
                            [{new Date(seg.start * 1000).toISOString().substr(14, 5)}]
                        </span>

                        <span style={{ marginRight: '10px' }}>{seg.text}</span>

                        <div style={{ float: 'right' }}>
                            {/* Primary: In-browser audio (mock) */}
                            <button onClick={() => console.log('Seek audio to', seg.start)} style={{ marginRight: '5px' }}>
                                ▶
                            </button>

                            {/* Secondary: VLC Deep Link */}
                            <a
                                href="#"
                                onClick={(e) => handleDeepLink(e, seg.start)}
                                title="Open in VLC"
                                style={{ textDecoration: 'none' }}
                            >
                                🚀
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
