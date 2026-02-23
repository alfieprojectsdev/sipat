import React from "react";

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
    <div className="transcript-viewer">
      <h2>Transcription Review: {data.meta.file}</h2>

      <div className="segments">
        {data.segments.map((seg, idx) => (
          <div
            key={idx}
            className={`segment-item ${seg.confidence < 0.6 ? "low-confidence" : ""}`}
          >
            <span className="segment-timestamp">
              [{new Date(seg.start * 1000).toISOString().substr(14, 5)}]
            </span>

            <span className="segment-text">{seg.text}</span>

            <div className="segment-actions">
              {/* Primary: In-browser audio (mock) */}
              <button
                onClick={() => console.log("Seek audio to", seg.start)}
                className="action-btn"
              >
                ▶
              </button>

              {/* Secondary: VLC Deep Link */}
              <a
                href="#"
                onClick={(e) => handleDeepLink(e, seg.start)}
                title="Open in VLC"
                className="deep-link"
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
