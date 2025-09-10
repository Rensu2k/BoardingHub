import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "tenant_favorites";

export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

export const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("Error saving favorites:", error);
    return false;
  }
};

export const addToFavorites = async (listingId) => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(listingId)) {
      favorites.push(listingId);
      await saveFavorites(favorites);
    }
    return favorites;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return [];
  }
};

export const removeFromFavorites = async (listingId) => {
  try {
    const favorites = await getFavorites();
    const updated = favorites.filter((id) => id !== listingId);
    await saveFavorites(updated);
    return updated;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return [];
  }
};

export const isFavorite = async (listingId) => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(listingId);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
