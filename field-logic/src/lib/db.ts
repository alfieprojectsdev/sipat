import Dexie, { type Table } from 'dexie';

export interface ResponseRecord {
    id?: string; // Compound index key [sessionId+nodeId]
    sessionId: string;
    nodeId: string;
    value: any;
    timestamp: number;
}

export interface AudioBlobRecord {
    id?: string; // Compound index key [sessionId+nodeId]
    sessionId: string;
    nodeId: string;
    blob: Blob;
    timestamp: number;
    synced: boolean;
}

export class FieldLogicDB extends Dexie {
    responses!: Table<ResponseRecord>;
    blobs!: Table<AudioBlobRecord>;

    constructor() {
        super('FieldLogicDB');
        this.version(1).stores({
            responses: '[sessionId+nodeId], sessionId, nodeId',
            blobs: '[sessionId+nodeId], sessionId, nodeId, synced'
        });
    }
}

export const db = new FieldLogicDB();

// Helper to save answer (Text/Choice/Boolean)
export const saveResponse = async (sessionId: string, nodeId: string, value: any) => {
    await db.responses.put({
        sessionId,
        nodeId,
        value,
        timestamp: Date.now()
    });
};

// Helper to save Audio Blob
export const saveAudio = async (sessionId: string, nodeId: string, blob: Blob) => {
    await db.blobs.put({
        sessionId,
        nodeId,
        blob,
        timestamp: Date.now(),
        synced: false
    });
};

// Get all responses for a session
export const getSessionResponses = async (sessionId: string) => {
    return await db.responses.where('sessionId').equals(sessionId).toArray();
};

export const getAudioBlob = async (sessionId: string, nodeId: string) => {
    return await db.blobs.get({ sessionId, nodeId });
};
