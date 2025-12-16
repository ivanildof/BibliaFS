interface SyncableItem {
  id: string;
  updatedAt: string | Date;
}

interface SyncConflict<T> {
  localItem: T;
  serverItem: T;
  conflictType: 'server_newer' | 'local_newer' | 'both_modified';
}

interface SyncResult<T> {
  toUpload: T[];
  toDownload: T[];
  conflicts: SyncConflict<T>[];
}

export function detectSyncConflicts<T extends SyncableItem>(
  localItems: T[],
  serverItems: T[],
  lastSyncedAt: Date
): SyncResult<T> {
  const toUpload: T[] = [];
  const toDownload: T[] = [];
  const conflicts: SyncConflict<T>[] = [];

  const serverMap = new Map(serverItems.map(item => [item.id, item]));
  const localMap = new Map(localItems.map(item => [item.id, item]));

  for (const local of localItems) {
    const server = serverMap.get(local.id);
    const localTime = new Date(local.updatedAt).getTime();
    const syncTime = lastSyncedAt.getTime();

    if (!server) {
      if (localTime > syncTime) {
        toUpload.push(local);
      }
    } else {
      const serverTime = new Date(server.updatedAt).getTime();
      const localModified = localTime > syncTime;
      const serverModified = serverTime > syncTime;

      if (localModified && serverModified) {
        conflicts.push({
          localItem: local,
          serverItem: server,
          conflictType: 'both_modified'
        });
      } else if (serverModified) {
        toDownload.push(server);
      } else if (localModified) {
        toUpload.push(local);
      }
    }
  }

  for (const server of serverItems) {
    if (!localMap.has(server.id)) {
      toDownload.push(server);
    }
  }

  return { toUpload, toDownload, conflicts };
}

export function resolveConflict<T extends SyncableItem>(
  conflict: SyncConflict<T>,
  strategy: 'keep_local' | 'keep_server' | 'keep_newest'
): T {
  switch (strategy) {
    case 'keep_local':
      return conflict.localItem;
    case 'keep_server':
      return conflict.serverItem;
    case 'keep_newest':
      const localTime = new Date(conflict.localItem.updatedAt).getTime();
      const serverTime = new Date(conflict.serverItem.updatedAt).getTime();
      return localTime > serverTime ? conflict.localItem : conflict.serverItem;
    default:
      return conflict.serverItem;
  }
}

const SYNC_KEY_PREFIX = 'biblia_sync_';

export function getLastSyncTime(dataType: string): Date {
  const stored = localStorage.getItem(`${SYNC_KEY_PREFIX}${dataType}`);
  return stored ? new Date(stored) : new Date(0);
}

export function setLastSyncTime(dataType: string, time: Date = new Date()): void {
  localStorage.setItem(`${SYNC_KEY_PREFIX}${dataType}`, time.toISOString());
}

export async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(data));
      controller.close();
    }
  });

  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const chunks: Uint8Array[] = [];
  const reader = compressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

export async function decompressData(compressed: Uint8Array): Promise<string> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressed);
      controller.close();
    }
  });

  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const chunks: Uint8Array[] = [];
  const reader = decompressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

export function calculateCompressionRatio(original: number, compressed: number): number {
  return Math.round((1 - compressed / original) * 100);
}
