import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, View } from "react-native";

export default function SkeletonLoader({
  width,
  height,
  borderRadius = 8,
  style,
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.text + "20",
        },
        style,
      ]}
    />
  );
}

// Predefined skeleton components for common use cases
export function PropertyCardSkeleton() {
  return (
    <View style={styles.propertyCardSkeleton}>
      <SkeletonLoader width={60} height={60} borderRadius={8} />
      <View style={styles.propertyCardContent}>
        <SkeletonLoader width={120} height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={100} height={14} style={{ marginBottom: 12 }} />
        <View style={styles.propertyCardChips}>
          <SkeletonLoader width={80} height={20} borderRadius={12} />
          <SkeletonLoader width={60} height={20} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function TenantRowSkeleton() {
  return (
    <View style={styles.tenantRowSkeleton}>
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={styles.tenantRowContent}>
        <SkeletonLoader width={120} height={18} style={{ marginBottom: 8 }} />
        <View style={styles.tenantRowDetails}>
          <SkeletonLoader width={60} height={14} />
          <SkeletonLoader width={80} height={14} />
        </View>
      </View>
      <SkeletonLoader width={50} height={20} borderRadius={12} />
    </View>
  );
}

export function BillRowSkeleton() {
  return (
    <View style={styles.billRowSkeleton}>
      <View style={styles.billRowContent}>
        <SkeletonLoader width={100} height={18} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} style={{ marginBottom: 2 }} />
        <SkeletonLoader width={60} height={12} />
      </View>
      <View style={styles.billRowDetails}>
        <SkeletonLoader width={70} height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={50} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    // Base skeleton styling is handled in the component
  },
  propertyCardSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  propertyCardContent: {
    flex: 1,
  },
  propertyCardChips: {
    flexDirection: "row",
    gap: 8,
  },
  tenantRowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  tenantRowContent: {
    flex: 1,
  },
  tenantRowDetails: {
    flexDirection: "row",
    gap: 12,
  },
  billRowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  billRowContent: {
    flex: 1,
  },
  billRowDetails: {
    alignItems: "flex-end",
  },
});
