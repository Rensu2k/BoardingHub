import AsyncStorage from "@react-native-async-storage/async-storage";

// Profile data sync utility for tenant settings and preferences

const STORAGE_KEYS = {
  USER_PROFILE: "user_profile",
  NOTIFICATION_SETTINGS: "notification_settings",
  PRIVACY_SETTINGS: "privacy_settings",
  OFFLINE_SETTINGS: "offline_settings",
  LANGUAGE_SETTINGS: "language_settings",
  LAST_SYNC: "last_sync",
  PENDING_CHANGES: "pending_changes",
};

// Profile Data Management
export const saveUserProfile = async (profileData) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profileData)
    );

    // Queue for sync with landlord
    await queueForSync("profile", profileData);

    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Notification Settings
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error("Error saving notification settings:", error);
    return false;
  }
};

export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS
    );
    return settings ? JSON.parse(settings) : getDefaultNotificationSettings();
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return getDefaultNotificationSettings();
  }
};

// Privacy Settings
export const savePrivacySettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PRIVACY_SETTINGS,
      JSON.stringify(settings)
    );

    // Some privacy settings need to be synced with landlord
    const syncableSettings = {
      profileVisible: settings.profileVisible,
      contactInfoVisible: settings.contactInfoVisible,
      roomInfoVisible: settings.roomInfoVisible,
      allowMessages: settings.allowMessages,
      allowCalls: settings.allowCalls,
    };

    await queueForSync("privacy", syncableSettings);

    return true;
  } catch (error) {
    console.error("Error saving privacy settings:", error);
    return false;
  }
};

export const getPrivacySettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultPrivacySettings();
  } catch (error) {
    console.error("Error getting privacy settings:", error);
    return getDefaultPrivacySettings();
  }
};

// Offline Settings
export const saveOfflineSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_SETTINGS,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error("Error saving offline settings:", error);
    return false;
  }
};

export const getOfflineSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultOfflineSettings();
  } catch (error) {
    console.error("Error getting offline settings:", error);
    return getDefaultOfflineSettings();
  }
};

// Language Settings
export const saveLanguageSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LANGUAGE_SETTINGS,
      JSON.stringify(settings)
    );

    // Language preference can be shared with landlord for better communication
    await queueForSync("language", {
      language: settings.language,
      region: settings.region,
    });

    return true;
  } catch (error) {
    console.error("Error saving language settings:", error);
    return false;
  }
};

export const getLanguageSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE_SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultLanguageSettings();
  } catch (error) {
    console.error("Error getting language settings:", error);
    return getDefaultLanguageSettings();
  }
};

// Sync Management
export const queueForSync = async (dataType, data) => {
  try {
    const pendingChanges = await getPendingChanges();
    pendingChanges[dataType] = {
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_CHANGES,
      JSON.stringify(pendingChanges)
    );

    // Attempt immediate sync if online
    if (await isOnline()) {
      await syncWithLandlord();
    }

    return true;
  } catch (error) {
    console.error("Error queuing for sync:", error);
    return false;
  }
};

export const getPendingChanges = async () => {
  try {
    const changes = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHANGES);
    return changes ? JSON.parse(changes) : {};
  } catch (error) {
    console.error("Error getting pending changes:", error);
    return {};
  }
};

export const syncWithLandlord = async () => {
  try {
    const pendingChanges = await getPendingChanges();
    const changeKeys = Object.keys(pendingChanges);

    if (changeKeys.length === 0) {
      return { success: true, message: "No changes to sync" };
    }

    // Simulate API call to sync with landlord
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real app, this would:
    // 1. Send changes to backend API
    // 2. Update landlord's view of tenant data
    // 3. Handle sync conflicts
    // 4. Retry failed syncs

    console.log("Syncing changes with landlord:", pendingChanges);

    // Mark changes as synced
    const updatedChanges = {};
    for (const key of changeKeys) {
      updatedChanges[key] = {
        ...pendingChanges[key],
        synced: true,
        syncedAt: new Date().toISOString(),
      };
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_CHANGES,
      JSON.stringify(updatedChanges)
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      new Date().toISOString()
    );

    return {
      success: true,
      message: `Synced ${changeKeys.length} changes successfully`,
      syncedCount: changeKeys.length,
    };
  } catch (error) {
    console.error("Error syncing with landlord:", error);
    return {
      success: false,
      message: "Failed to sync changes",
      error: error.message,
    };
  }
};

export const getLastSyncTime = async () => {
  try {
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return lastSync ? new Date(lastSync) : null;
  } catch (error) {
    console.error("Error getting last sync time:", error);
    return null;
  }
};

export const clearSyncedChanges = async () => {
  try {
    const pendingChanges = await getPendingChanges();
    const unsynced = {};

    // Keep only unsynced changes
    for (const [key, change] of Object.entries(pendingChanges)) {
      if (!change.synced) {
        unsynced[key] = change;
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_CHANGES,
      JSON.stringify(unsynced)
    );

    return true;
  } catch (error) {
    console.error("Error clearing synced changes:", error);
    return false;
  }
};

// Utility Functions
export const isOnline = async () => {
  // In a real app, you'd check network connectivity
  // For now, return true to simulate online state
  return true;
};

export const exportAllData = async () => {
  try {
    const profile = await getUserProfile();
    const notifications = await getNotificationSettings();
    const privacy = await getPrivacySettings();
    const offline = await getOfflineSettings();
    const language = await getLanguageSettings();
    const pendingChanges = await getPendingChanges();
    const lastSync = await getLastSyncTime();

    return {
      profile,
      settings: {
        notifications,
        privacy,
        offline,
        language,
      },
      sync: {
        pendingChanges,
        lastSync,
      },
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    return null;
  }
};

export const importAllData = async (data) => {
  try {
    if (data.profile) {
      await saveUserProfile(data.profile);
    }

    if (data.settings) {
      if (data.settings.notifications) {
        await saveNotificationSettings(data.settings.notifications);
      }
      if (data.settings.privacy) {
        await savePrivacySettings(data.settings.privacy);
      }
      if (data.settings.offline) {
        await saveOfflineSettings(data.settings.offline);
      }
      if (data.settings.language) {
        await saveLanguageSettings(data.settings.language);
      }
    }

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};

// Default Settings
const getDefaultNotificationSettings = () => ({
  pushNotifications: true,
  emailNotifications: true,
  billReminders: true,
  paymentDue: true,
  paymentConfirmation: true,
  lateFees: true,
  maintenanceUpdates: true,
  propertyAnnouncements: true,
  emergencyAlerts: true,
  landlordMessages: true,
  systemUpdates: false,
  marketingEmails: false,
});

const getDefaultPrivacySettings = () => ({
  analyticsData: false,
  usageData: true,
  crashReporting: true,
  profileVisible: true,
  contactInfoVisible: false,
  roomInfoVisible: true,
  allowMessages: true,
  allowCalls: true,
  showOnlineStatus: false,
  shareWithLandlord: true,
  shareWithMaintenanceTeam: true,
  shareWithPropertyManager: true,
  locationTracking: false,
  deviceTracking: false,
});

const getDefaultOfflineSettings = () => ({
  autoDownloadBills: true,
  autoDownloadReceipts: true,
  autoDownloadDocuments: false,
  autoDownloadMessages: true,
  autoSyncOnWifi: true,
  autoSyncOnCellular: false,
  backgroundSync: true,
  cacheImages: true,
  cacheBills: true,
  cacheMessages: true,
  compressImages: true,
  lowDataMode: false,
});

const getDefaultLanguageSettings = () => ({
  language: "en",
  region: "PH",
});
