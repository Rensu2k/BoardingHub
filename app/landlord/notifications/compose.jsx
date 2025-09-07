import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ComposeNotificationScreen() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock message templates
  const templates = [
    {
      id: "rent-due",
      title: "Rent Due Reminder",
      subject: "Rent Payment Due Soon",
      message: `Dear [Tenant Name],

This is a friendly reminder that your rent payment of ₱[Rent Amount] for [Property Name] - Room [Room Number] is due on [Due Date].

Please ensure your payment is made on time to avoid any late fees.

Best regards,
[Your Name]
Property Manager`,
    },
    {
      id: "late-notice",
      title: "Late Payment Notice",
      subject: "Late Payment Notice - Action Required",
      message: `Dear [Tenant Name],

We noticed that your rent payment of ₱[Rent Amount] for [Property Name] - Room [Room Number] was due on [Due Date] and is currently overdue.

Please make your payment as soon as possible to avoid additional late fees of ₱[Late Fee Amount] per day.

If you've already made the payment, please provide proof of payment.

Contact us immediately if you're experiencing any difficulties.

Best regards,
[Your Name]
Property Manager`,
    },
    {
      id: "maintenance-complete",
      title: "Maintenance Completed",
      subject: "Maintenance Work Completed",
      message: `Dear [Tenant Name],

We're pleased to inform you that the maintenance work for [Issue Description] in your room at [Property Name] - Room [Room Number] has been completed.

Please inspect the work and let us know if you have any concerns or if additional work is needed.

Thank you for your patience during the maintenance period.

Best regards,
[Your Name]
Property Manager`,
    },
    {
      id: "welcome",
      title: "Welcome Message",
      subject: "Welcome to [Property Name]",
      message: `Dear [Tenant Name],

Welcome to [Property Name]! We're excited to have you as our tenant in Room [Room Number].

Here are some important details for your stay:
- Rent Amount: ₱[Rent Amount]
- Due Date: [Due Date] of each month
- Property Rules: [Brief rules summary]

Please don't hesitate to contact us if you need anything.

Best regards,
[Your Name]
Property Manager`,
    },
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setMessage(template.message);
    setShowTemplates(false);
  };

  const handleNext = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please enter both subject and message.");
      return;
    }

    router.push({
      pathname: "/landlord/notifications/recipients",
      params: {
        subject,
        message,
        templateId: selectedTemplate?.id || "custom",
      },
    });
  };

  const renderTemplateItem = (template) => (
    <TouchableOpacity
      key={template.id}
      style={[styles.templateItem, { backgroundColor: colors.card }]}
      onPress={() => handleTemplateSelect(template)}
    >
      <View style={styles.templateContent}>
        <ThemedText style={styles.templateTitle}>{template.title}</ThemedText>
        <ThemedText style={styles.templatePreview} numberOfLines={2}>
          {template.message.substring(0, 100)}...
        </ThemedText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.tabIconDefault}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Compose Message</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Template Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Message Template</ThemedText>
          <TouchableOpacity
            style={[styles.templateSelector, { backgroundColor: colors.card }]}
            onPress={() => setShowTemplates(!showTemplates)}
          >
            <View style={styles.templateSelectorContent}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.text}
              />
              <ThemedText style={styles.templateSelectorText}>
                {selectedTemplate
                  ? selectedTemplate.title
                  : "Choose a template"}
              </ThemedText>
            </View>
            <Ionicons
              name={showTemplates ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.tabIconDefault}
            />
          </TouchableOpacity>

          {showTemplates && (
            <View style={styles.templatesList}>
              <TouchableOpacity
                style={[styles.templateItem, { backgroundColor: colors.card }]}
                onPress={() => {
                  setSelectedTemplate(null);
                  setSubject("");
                  setMessage("");
                  setShowTemplates(false);
                }}
              >
                <View style={styles.templateContent}>
                  <ThemedText style={styles.templateTitle}>
                    Custom Message
                  </ThemedText>
                  <ThemedText style={styles.templatePreview}>
                    Start with a blank message
                  </ThemedText>
                </View>
              </TouchableOpacity>
              {templates.map(renderTemplateItem)}
            </View>
          )}
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Subject</ThemedText>
          <TextInput
            style={[
              styles.subjectInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter subject line"
            placeholderTextColor={colors.text + "60"}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        {/* Message */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Message</ThemedText>
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter your message..."
            placeholderTextColor={colors.text + "60"}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <ThemedText style={styles.characterCount}>
            {message.length}/1000
          </ThemedText>
        </View>

        {/* Variables Helper */}
        {selectedTemplate && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Available Variables
            </ThemedText>
            <View style={styles.variablesContainer}>
              <ThemedText style={styles.variablesText}>
                [Tenant Name], [Property Name], [Room Number], [Rent Amount],
                [Due Date], [Late Fee Amount], [Issue Description], [Your Name]
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[styles.bottomActions, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor:
                subject.trim() && message.trim() ? colors.tint : "#CCCCCC",
            },
          ]}
          onPress={handleNext}
          disabled={!subject.trim() || !message.trim()}
        >
          <ThemedText
            style={[
              styles.nextButtonText,
              {
                color: subject.trim() && message.trim() ? "white" : "#999999",
              },
            ]}
          >
            Choose Recipients
          </ThemedText>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={subject.trim() && message.trim() ? "white" : "#999999"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  templateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  templateSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  templateSelectorText: {
    fontSize: 16,
    marginLeft: 12,
  },
  templatesList: {
    marginTop: 12,
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  templatePreview: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  subjectInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "right",
    marginTop: 4,
  },
  variablesContainer: {
    padding: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  variablesText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
