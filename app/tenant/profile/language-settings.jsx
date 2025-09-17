import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function LanguageSettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedRegion, setSelectedRegion] = useState("PH");
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
      regions: [
        { code: "US", name: "United States", flag: "🇺🇸" },
        { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
        { code: "AU", name: "Australia", flag: "🇦🇺" },
        { code: "CA", name: "Canada", flag: "🇨🇦" },
        { code: "PH", name: "Philippines", flag: "🇵🇭" },
      ],
    },
    {
      code: "fil",
      name: "Filipino",
      nativeName: "Filipino",
      flag: "🇵🇭",
      regions: [{ code: "PH", name: "Philippines", flag: "🇵🇭" }],
    },
    {
      code: "tl",
      name: "Tagalog",
      nativeName: "Tagalog",
      flag: "🇵🇭",
      regions: [{ code: "PH", name: "Philippines", flag: "🇵🇭" }],
    },
    {
      code: "ceb",
      name: "Cebuano",
      nativeName: "Cebuano",
      flag: "🇵🇭",
      regions: [{ code: "PH", name: "Philippines", flag: "🇵🇭" }],
    },
    {
      code: "zh",
      name: "Chinese",
      nativeName: "中文",
      flag: "🇨🇳",
      regions: [
        { code: "CN", name: "China", flag: "🇨🇳" },
        { code: "TW", name: "Taiwan", flag: "🇹🇼" },
        { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
        { code: "SG", name: "Singapore", flag: "🇸🇬" },
      ],
    },
    {
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      flag: "🇪🇸",
      regions: [
        { code: "ES", name: "Spain", flag: "🇪🇸" },
        { code: "MX", name: "Mexico", flag: "🇲🇽" },
        { code: "AR", name: "Argentina", flag: "🇦🇷" },
        { code: "CO", name: "Colombia", flag: "🇨🇴" },
      ],
    },
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      flag: "🇯🇵",
      regions: [{ code: "JP", name: "Japan", flag: "🇯🇵" }],
    },
    {
      code: "ko",
      name: "Korean",
      nativeName: "한국어",
      flag: "🇰🇷",
      regions: [{ code: "KR", name: "South Korea", flag: "🇰🇷" }],
    },
  ];

  const currentLanguage = languages.find(
    (lang) => lang.code === selectedLanguage
  );
  const currentRegion = currentLanguage?.regions.find(
    (region) => region.code === selectedRegion
  );

  const handleLanguageChange = async (languageCode, regionCode = null) => {
    setIsLoading(true);
    try {
      // Simulate language change process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSelectedLanguage(languageCode);

      // Set default region for the language if not specified
      const language = languages.find((lang) => lang.code === languageCode);
      const defaultRegion = regionCode || language?.regions[0]?.code;
      setSelectedRegion(defaultRegion);

      // In a real app, this would:
      // 1. Update the app's locale
      // 2. Reload/retranslate the interface
      // 3. Save preference to backend
      // 4. Update async storage

      console.log(
        "Language changed to:",
        languageCode,
        "Region:",
        defaultRegion
      );

      Alert.alert(
        "Language Changed",
        `Language has been changed to ${language?.name}. The app will restart to apply changes.`,
        [
          {
            text: "OK",
            onPress: () => {
              // In a real app, you might restart the app or reload the interface
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to change language. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = async (regionCode) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSelectedRegion(regionCode);

      console.log("Region changed to:", regionCode);

      Alert.alert(
        "Region Changed",
        "Region settings have been updated successfully.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to change region. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanguageItem = (language) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageItem,
        {
          backgroundColor:
            selectedLanguage === language.code
              ? colors.tint + "20"
              : colors.background,
          borderColor:
            selectedLanguage === language.code ? colors.tint : "transparent",
        },
      ]}
      onPress={() => handleLanguageChange(language.code)}
      disabled={isLoading}
    >
      <View style={styles.languageInfo}>
        <ThemedText style={styles.languageFlag}>{language.flag}</ThemedText>
        <View style={styles.languageText}>
          <ThemedText style={styles.languageName}>{language.name}</ThemedText>
          <ThemedText style={styles.languageNative}>
            {language.nativeName}
          </ThemedText>
        </View>
      </View>
      {selectedLanguage === language.code && (
        <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
      )}
    </TouchableOpacity>
  );

  const renderRegionItem = (region) => (
    <TouchableOpacity
      key={region.code}
      style={[
        styles.regionItem,
        {
          backgroundColor:
            selectedRegion === region.code
              ? colors.tint + "20"
              : colors.background,
          borderColor:
            selectedRegion === region.code ? colors.tint : "transparent",
        },
      ]}
      onPress={() => handleRegionChange(region.code)}
      disabled={isLoading}
    >
      <View style={styles.regionInfo}>
        <ThemedText style={styles.regionFlag}>{region.flag}</ThemedText>
        <ThemedText style={styles.regionName}>{region.name}</ThemedText>
      </View>
      {selectedRegion === region.code && (
        <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Language & Region</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Selection */}
        <ThemedView
          style={[styles.currentCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.currentHeader}>
            <View style={styles.currentIcon}>
              <Ionicons name="language-outline" size={24} color={colors.tint} />
            </View>
            <View style={styles.currentInfo}>
              <ThemedText style={styles.currentTitle}>
                Current Language
              </ThemedText>
              <ThemedText style={styles.currentValue}>
                {currentLanguage?.name} ({currentRegion?.name})
              </ThemedText>
            </View>
          </View>

          <View style={styles.currentDetails}>
            <View style={styles.currentDetailItem}>
              <ThemedText style={styles.currentDetailLabel}>
                Language
              </ThemedText>
              <View style={styles.currentDetailValue}>
                <ThemedText style={styles.currentDetailFlag}>
                  {currentLanguage?.flag}
                </ThemedText>
                <ThemedText style={styles.currentDetailText}>
                  {currentLanguage?.nativeName}
                </ThemedText>
              </View>
            </View>
            <View style={styles.currentDetailItem}>
              <ThemedText style={styles.currentDetailLabel}>Region</ThemedText>
              <View style={styles.currentDetailValue}>
                <ThemedText style={styles.currentDetailFlag}>
                  {currentRegion?.flag}
                </ThemedText>
                <ThemedText style={styles.currentDetailText}>
                  {currentRegion?.name}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Language Selection */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Choose Language</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Select your preferred language for the app interface
            </ThemedText>
          </View>

          <View style={styles.languageList}>
            {languages.map(renderLanguageItem)}
          </View>
        </ThemedView>

        {/* Region Selection */}
        {currentLanguage && currentLanguage.regions.length > 1 && (
          <ThemedView
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Choose Region</ThemedText>
              <ThemedText style={styles.sectionDescription}>
                Select your region for {currentLanguage.name}
              </ThemedText>
            </View>

            <View style={styles.regionList}>
              {currentLanguage.regions.map(renderRegionItem)}
            </View>
          </ThemedView>
        )}

        {/* Language Features */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Language Features
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Features affected by language settings
            </ThemedText>
          </View>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="text-outline" size={20} color={colors.tint} />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>
                  App Interface
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  All menus, buttons, and labels
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.tint}
                />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>
                  Date & Time Format
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Regional date and time display
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="card-outline" size={20} color={colors.tint} />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>
                  Currency & Numbers
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Regional currency and number formatting
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="mail-outline" size={20} color={colors.tint} />
              </View>
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureTitle}>
                  Notifications
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Push notifications and emails
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Translation Quality Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.card }]}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.tint}
            />
            <ThemedText style={styles.noticeTitle}>
              Translation Quality
            </ThemedText>
          </View>
          <ThemedText style={styles.noticeText}>
            Some languages are still being improved. If you notice any
            translation issues, please report them through the feedback option
            in settings.
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.feedbackButton,
              { backgroundColor: colors.tint + "20", borderColor: colors.tint },
            ]}
            onPress={() =>
              Alert.alert("Feedback", "Feedback form will be opened")
            }
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.tint} />
            <ThemedText
              style={[styles.feedbackButtonText, { color: colors.tint }]}
            >
              Report Translation Issue
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Reset to Default */}
        <View style={styles.resetSection}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.text + "30",
              },
            ]}
            onPress={() => {
              Alert.alert(
                "Reset Language",
                "This will reset language to English (Philippines). Continue?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    onPress: () => handleLanguageChange("en", "PH"),
                  },
                ]
              );
            }}
            disabled={isLoading}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
            <ThemedText style={styles.resetButtonText}>
              Reset to Default
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
            <Ionicons name="language-outline" size={32} color={colors.tint} />
            <ThemedText style={styles.loadingText}>
              Applying language changes...
            </ThemedText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerButton: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  currentCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  currentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  currentInfo: {
    flex: 1,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentDetails: {
    gap: 12,
  },
  currentDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentDetailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentDetailValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentDetailFlag: {
    fontSize: 16,
  },
  currentDetailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  languageList: {
    gap: 1,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    opacity: 0.7,
  },
  regionList: {
    gap: 1,
  },
  regionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  regionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  regionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  regionName: {
    fontSize: 14,
    fontWeight: "500",
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  noticeCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  noticeText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resetSection: {
    padding: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
