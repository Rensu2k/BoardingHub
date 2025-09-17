import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function PaymentMethods() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "GCash",
      name: "Juan Dela Cruz",
      number: "+63 912 345 6789",
      isDefault: true,
      lastUsed: "2024-10-15",
    },
    {
      id: 2,
      type: "PayMaya",
      name: "Juan Dela Cruz",
      number: "+63 917 987 6543",
      isDefault: false,
      lastUsed: "2024-09-20",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: "GCash",
    name: "",
    number: "",
  });

  const paymentTypes = [
    {
      id: "GCash",
      label: "GCash",
      icon: "phone-portrait-outline",
      color: "#0066CC",
    },
    { id: "PayMaya", label: "PayMaya", icon: "card-outline", color: "#00C853" },
    { id: "GrabPay", label: "GrabPay", icon: "car-outline", color: "#00B14F" },
    {
      id: "Bank Transfer",
      label: "Bank Transfer",
      icon: "business-outline",
      color: "#1976D2",
    },
  ];

  const getPaymentIcon = (type) => {
    const paymentType = paymentTypes.find((pt) => pt.id === type);
    return paymentType ? paymentType.icon : "card-outline";
  };

  const getPaymentColor = (type) => {
    const paymentType = paymentTypes.find((pt) => pt.id === type);
    return paymentType ? paymentType.color : "#007AFF";
  };

  const formatPhoneNumber = (number) => {
    if (number.length <= 4) return number;
    return `${number.slice(0, -4).replace(/./g, "*")}${number.slice(-4)}`;
  };

  const handleAddMethod = () => {
    setFormData({
      type: "GCash",
      name: "",
      number: "",
    });
    setSelectedMethod(null);
    setShowAddModal(true);
  };

  const handleEditMethod = (method) => {
    setFormData({
      type: method.type,
      name: method.name,
      number: method.number,
    });
    setSelectedMethod(method);
    setShowAddModal(true);
  };

  const handleSaveMethod = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter account holder name.");
      return;
    }
    if (!formData.number.trim()) {
      Alert.alert("Error", "Please enter phone/account number.");
      return;
    }

    if (selectedMethod) {
      // Edit existing method
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === selectedMethod.id
            ? {
                ...method,
                ...formData,
                lastUsed: new Date().toISOString().split("T")[0],
              }
            : method
        )
      );
      Alert.alert("Success", "Payment method updated successfully!");
    } else {
      // Add new method
      const newMethod = {
        id: Date.now(),
        ...formData,
        isDefault: paymentMethods.length === 0,
        lastUsed: new Date().toISOString().split("T")[0],
      };
      setPaymentMethods((prev) => [...prev, newMethod]);
      Alert.alert("Success", "Payment method added successfully!");
    }

    setShowAddModal(false);
  };

  const handleSetDefault = (methodId) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
    Alert.alert("Success", "Default payment method updated!");
  };

  const handleDeleteMethod = (methodId) => {
    const methodToDelete = paymentMethods.find((m) => m.id === methodId);

    Alert.alert(
      "Delete Payment Method",
      `Are you sure you want to delete ${
        methodToDelete.type
      } ending in ${methodToDelete.number.slice(-4)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPaymentMethods((prev) => {
              const filtered = prev.filter((method) => method.id !== methodId);
              // If deleted method was default and there are other methods, make the first one default
              if (methodToDelete.isDefault && filtered.length > 0) {
                filtered[0].isDefault = true;
              }
              return filtered;
            });
            Alert.alert("Success", "Payment method deleted successfully!");
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <ThemedText style={styles.headerTitle}>Payment Methods</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={colors.tint}
          />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Secure Payment</ThemedText>
            <ThemedText style={styles.infoText}>
              Your payment information is encrypted and securely stored. Only
              you and your landlord can see this information for billing
              purposes.
            </ThemedText>
          </View>
        </View>

        {/* Payment Methods List */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Saved Payment Methods
          </ThemedText>

          {paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <View
                  key={method.id}
                  style={[
                    styles.methodCard,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <View
                        style={[
                          styles.methodIcon,
                          {
                            backgroundColor:
                              getPaymentColor(method.type) + "20",
                          },
                        ]}
                      >
                        <Ionicons
                          name={getPaymentIcon(method.type)}
                          size={24}
                          color={getPaymentColor(method.type)}
                        />
                      </View>

                      <View style={styles.methodDetails}>
                        <View style={styles.methodTitleRow}>
                          <ThemedText style={styles.methodType}>
                            {method.type}
                          </ThemedText>
                          {method.isDefault && (
                            <View
                              style={[
                                styles.defaultBadge,
                                { backgroundColor: colors.tint + "20" },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.defaultText,
                                  { color: colors.tint },
                                ]}
                              >
                                Default
                              </ThemedText>
                            </View>
                          )}
                        </View>

                        <ThemedText style={styles.methodName}>
                          {method.name}
                        </ThemedText>
                        <ThemedText style={styles.methodNumber}>
                          {formatPhoneNumber(method.number)}
                        </ThemedText>
                        <ThemedText style={styles.lastUsed}>
                          Last used: {formatDate(method.lastUsed)}
                        </ThemedText>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => {
                        Alert.alert(
                          "Payment Method Options",
                          `Choose an action for ${method.type}`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Edit",
                              onPress: () => handleEditMethod(method),
                            },
                            !method.isDefault && {
                              text: "Set as Default",
                              onPress: () => handleSetDefault(method.id),
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => handleDeleteMethod(method.id),
                            },
                          ].filter(Boolean)
                        );
                      }}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="card-outline"
                size={64}
                color={colors.text}
                style={{ opacity: 0.3 }}
              />
              <ThemedText style={styles.emptyTitle}>
                No Payment Methods
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Add a payment method to make bill payments easier
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.addMethodButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={handleAddMethod}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText style={styles.addMethodText}>
                  Add Payment Method
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.card }]}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.tint}
          />
          <ThemedText style={styles.securityText}>
            Payment methods are used for rent and utility payments. Your
            landlord will receive this information for billing purposes only.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Add/Edit Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <ThemedText style={[styles.modalAction, { color: colors.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {selectedMethod ? "Edit Payment Method" : "Add Payment Method"}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveMethod}>
              <ThemedText style={[styles.modalAction, { color: colors.tint }]}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Payment Type Selection */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Payment Type</ThemedText>
              <View style={styles.paymentTypeGrid}>
                {paymentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.paymentTypeCard,
                      {
                        backgroundColor:
                          formData.type === type.id
                            ? type.color + "20"
                            : colors.card,
                        borderColor:
                          formData.type === type.id
                            ? type.color
                            : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: type.id }))
                    }
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={
                        formData.type === type.id ? type.color : colors.text
                      }
                    />
                    <ThemedText
                      style={[
                        styles.paymentTypeLabel,
                        {
                          color:
                            formData.type === type.id
                              ? type.color
                              : colors.text,
                        },
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Account Holder Name */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>
                Account Holder Name
              </ThemedText>
              <TextInput
                style={[
                  styles.formInput,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                value={formData.name}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, name: value }))
                }
                placeholder="Enter account holder name"
                placeholderTextColor={colors.text + "60"}
              />
            </View>

            {/* Phone/Account Number */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>
                {formData.type === "Bank Transfer"
                  ? "Account Number"
                  : "Phone Number"}
              </ThemedText>
              <TextInput
                style={[
                  styles.formInput,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                value={formData.number}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, number: value }))
                }
                placeholder={
                  formData.type === "Bank Transfer"
                    ? "Enter account number"
                    : "Enter phone number"
                }
                placeholderTextColor={colors.text + "60"}
                keyboardType={
                  formData.type === "Bank Transfer" ? "default" : "phone-pad"
                }
              />
            </View>

            {/* Security Notice */}
            <View style={styles.modalSecurityNotice}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.tint}
              />
              <ThemedText style={styles.modalSecurityText}>
                This information will be encrypted and shared with your landlord
                for payment processing only.
              </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  methodInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  methodDetails: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  methodType: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "600",
  },
  methodName: {
    fontSize: 14,
    marginBottom: 2,
  },
  methodNumber: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  lastUsed: {
    fontSize: 12,
    opacity: 0.6,
  },
  menuButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 24,
  },
  addMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addMethodText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalAction: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  paymentTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  paymentTypeCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  paymentTypeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalSecurityNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    gap: 12,
    marginTop: 16,
  },
  modalSecurityText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
});
