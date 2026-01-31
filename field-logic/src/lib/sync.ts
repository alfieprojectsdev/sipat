import { db, saveResponse } from './db';

const uploadAudioToDrive = async (blob: Blob, filename: string, token: string): Promise<string> => {
    // STUB: Simulate GDrive API upload
    console.log(`[Stub] Uploading ${filename} to Google Drive with token ${token}...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return a fake URL
    return `https://drive.google.com/file/d/stub_id_${Date.now()}`;
};

export const flushAudioBlobs = async (token: string = 'test_token') => {
    // 1. Find all unsynced blobs
    // Dexie boolean index mapping can be tricky, using filter for safety on small datasets
    const unsyncedBlobs = await db.blobs.filter(blob => !blob.synced).toArray();

    console.log(`Found ${unsyncedBlobs.length} items to sync.`);
    const results = [];

    for (const record of unsyncedBlobs) {
        const { sessionId, nodeId, blob } = record;
        const filename = `${sessionId}_${nodeId}.webm`;

        try {
            // A. Upload
            const url = await uploadAudioToDrive(blob, filename, token);

            // B. Update Responses Table with the link
            const metadata = {
                type: 'audio',
                url: url,
                synced_at: new Date().toISOString()
            };
            await saveResponse(sessionId, nodeId, metadata);

            // C. Delete local blob (free space)
            // Using compound key [sessionId, nodeId]
            await db.blobs.where({ sessionId, nodeId }).delete();

            console.log(`Synced & Flushed: ${filename}`);
            results.push({ sessionId, nodeId, status: 'synced', url });

        } catch (e) {
            console.error(`Failed to sync ${filename}`, e);
            results.push({ sessionId, nodeId, status: 'failed', error: e });
        }
    }
    return results;
}
