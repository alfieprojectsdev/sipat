import React, { useState, useRef } from 'react';
import { saveAudio } from '../lib/db';

interface Props {
    sessionId: string;
    nodeId: string;
    onRecordingComplete: (blobKey: string) => void;
}

export const AudioRecorder: React.FC<Props> = ({ sessionId, nodeId, onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Fallback mime type check
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                // Save to Dexie DB
                await saveAudio(sessionId, nodeId, blob);
                // We pass the nodeId as the "key" reference for now
                onRecordingComplete(nodeId);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please ensure permissions are granted.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="audio-recorder" style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
                {!isRecording ? (
                    <button className="primary" onClick={startRecording} style={{ background: '#ef4444' }}>
                        Record Answer 🎙️
                    </button>
                ) : (
                    <button className="primary" onClick={stopRecording} style={{ background: '#3b82f6' }}>
                        Stop Recording ⏹️
                    </button>
                )}
            </div>

            {isRecording && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Recording...</div>}

            {audioUrl && (
                <div style={{ marginTop: '1rem' }}>
                    <p>Review Recording:</p>
                    <audio controls src={audioUrl} />
                </div>
            )}
        </div>
    );
};
