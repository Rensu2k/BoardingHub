import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUED_UPLOADS_KEY = "queued_uploads";
const UPLOAD_HISTORY_KEY = "upload_history";

export const queueUpload = async (uploadData) => {
  try {
    const queued = await AsyncStorage.getItem(QUEUED_UPLOADS_KEY);
    const uploads = queued ? JSON.parse(queued) : [];
    const newUpload = {
      ...uploadData,
      id: `upload_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "queued",
      retryCount: 0,
    };
    uploads.push(newUpload);
    await AsyncStorage.setItem(QUEUED_UPLOADS_KEY, JSON.stringify(uploads));
    return newUpload;
  } catch (error) {
    console.error("Error queuing upload:", error);
    throw error;
  }
};

export const getQueuedUploads = async () => {
  try {
    const queued = await AsyncStorage.getItem(QUEUED_UPLOADS_KEY);
    return queued ? JSON.parse(queued) : [];
  } catch (error) {
    console.error("Error getting queued uploads:", error);
    return [];
  }
};

export const removeQueuedUpload = async (uploadId) => {
  try {
    const queued = await AsyncStorage.getItem(QUEUED_UPLOADS_KEY);
    if (queued) {
      const uploads = JSON.parse(queued);
      const filtered = uploads.filter(upload => upload.id !== uploadId);
      await AsyncStorage.setItem(QUEUED_UPLOADS_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("Error removing queued upload:", error);
  }
};

export const updateQueuedUploadStatus = async (uploadId, status, error = null) => {
  try {
    const queued = await AsyncStorage.getItem(QUEUED_UPLOADS_KEY);
    if (queued) {
      const uploads = JSON.parse(queued);
      const index = uploads.findIndex(upload => upload.id === uploadId);
      if (index !== -1) {
        uploads[index].status = status;
        uploads[index].lastAttempt = new Date().toISOString();
        if (error) {
          uploads[index].error = error;
          uploads[index].retryCount = (uploads[index].retryCount || 0) + 1;
        }
        await AsyncStorage.setItem(QUEUED_UPLOADS_KEY, JSON.stringify(uploads));
      }
    }
  } catch (error) {
    console.error("Error updating queued upload status:", error);
  }
};

export const addToUploadHistory = async (uploadData) => {
  try {
    const history = await AsyncStorage.getItem(UPLOAD_HISTORY_KEY);
    const uploads = history ? JSON.parse(history) : [];
    uploads.unshift({
      ...uploadData,
      completedAt: new Date().toISOString(),
    });
    // Keep only last 50 uploads
    const recentUploads = uploads.slice(0, 50);
    await AsyncStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(recentUploads));
  } catch (error) {
    console.error("Error adding to upload history:", error);
  }
};

export const getUploadHistory = async (limit = 20) => {
  try {
    const history = await AsyncStorage.getItem(UPLOAD_HISTORY_KEY);
    const uploads = history ? JSON.parse(history) : [];
    return uploads.slice(0, limit);
  } catch (error) {
    console.error("Error getting upload history:", error);
    return [];
  }
};

export const retryFailedUploads = async (uploadFunction) => {
  try {
    const queued = await getQueuedUploads();
    const failedUploads = queued.filter(upload =>
      upload.status === "failed" && (upload.retryCount || 0) < 3
    );

    for (const upload of failedUploads) {
      try {
        await updateQueuedUploadStatus(upload.id, "uploading");
        const result = await uploadFunction(upload);
        if (result.success) {
          await addToUploadHistory({
            ...upload,
            uploadId: result.uploadId,
            status: "completed",
          });
          await removeQueuedUpload(upload.id);
        } else {
          await updateQueuedUploadStatus(upload.id, "failed", result.error);
        }
      } catch (error) {
        await updateQueuedUploadStatus(upload.id, "failed", error.message);
      }
    }

    return failedUploads.length;
  } catch (error) {
    console.error("Error retrying failed uploads:", error);
    return 0;
  }
};

export const clearOldQueuedUploads = async (daysOld = 7) => {
  try {
    const queued = await getQueuedUploads();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filtered = queued.filter(upload => {
      const uploadDate = new Date(upload.timestamp);
      return uploadDate > cutoffDate;
    });

    await AsyncStorage.setItem(QUEUED_UPLOADS_KEY, JSON.stringify(filtered));
    return queued.length - filtered.length;
  } catch (error) {
    console.error("Error clearing old queued uploads:", error);
    return 0;
  }
};
