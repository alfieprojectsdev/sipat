import Dexie, { type Table } from 'dexie';

export interface ResponseRecord {
    id?: string; // Compound index key [sessionId+nodeId]
    sessionId: string;
    nodeId: string;
    value: any;
    timestamp: number;
}

export interface AudioBlobRecord {
    id: string; // Unique ID: sessionId_nodeId_timestamp
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

        this.version(2).stores({
            blobs: 'id, sessionId, nodeId, [sessionId+nodeId], synced'
        }).upgrade(async tx => {
            // Migrate existing blobs to have a unique string ID if they don't have one
            return tx.table('blobs').toCollection().modify(record => {
                if (!record.id) {
                    // Use existing fields to recreate the ID convention
                    const ts = record.timestamp || Date.now();
                    record.id = `${record.sessionId}_${record.nodeId}_${ts}`;
                }
            });
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
    const timestamp = Date.now();
    const id = `${sessionId}_${nodeId}_${timestamp}`;
    await db.blobs.put({
        id,
        sessionId,
        nodeId,
        blob,
        timestamp,
        synced: false
    });
    return id;
};

// Get all responses for a session
export const getSessionResponses = async (sessionId: string) => {
    return await db.responses.where('sessionId').equals(sessionId).toArray();
};

// Get the latest audio blob for a specific node in a session
export const getAudioBlob = async (sessionId: string, nodeId: string) => {
    return await db.blobs.where({ sessionId, nodeId }).first();
};

export const getAudioBlobById = async (id: string) => {
    return await db.blobs.get(id);
};
