import React from "react";
import { StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Text, View } from "../components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const navigation = useNavigation();

  // Navigate to document scanner
  const goToDocumentScanner = () => {
    // Assuming you have a screen named "DocumentScanner" in your navigation
    navigation.navigate("TabOneScreen");
  };

    const goToProfile = () => {
    // Assuming you have a screen named "DocumentScanner" in your navigation
    navigation.navigate("Portfolio");
  };

  // Mock stats for the dashboard
  const stats = {
    totalDocuments: 32,
    recentlyScanned: 5,
    pendingReview: 3,
  };

  // Dashboard action items
  const actionItems = [
    {
      id: "scan",
      title: "Scan Document",
      icon: "scan-outline",
      color: "#4CAF50",
      onPress: goToDocumentScanner,
    },
    {
      id: "upload",
      title: "Profile",
      icon: "person-outline",
      color: "#2196F3",
      onPress: goToProfile,
    },
    {
      id: "search",
      title: "Search Archive",
      icon: "search-outline",
      color: "#FF9800",
      onPress: goToDocumentScanner,
    },
    {
      id: "share",
      title: "Share Documents",
      icon: "share-social-outline",
      color: "#9C27B0",
      onPress: () => console.log("Share pressed"),
    },
  ];

  // Recent document activity (mock data)
  const recentActivity = [
    {
      id: "1",
      title: "Invoice May 2025",
      date: "2 hours ago",
      icon: "document-text-outline",
    },
    {
      id: "2",
      title: "Contract Agreement",
      date: "Yesterday",
      icon: "document-text-outline",
    },
    {
      id: "3",
      title: "Meeting Notes",
      date: "May 7, 2025",
      icon: "document-text-outline",
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>TVET Manager</Text>
          <Text style={styles.subtitle}>Your gateway to TVET ecosystem in Bhutan</Text>
        </View>

        {/* Stats section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDocuments}</Text>
            <Text style={styles.statLabel}>Total Documents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.recentlyScanned}</Text>
            <Text style={styles.statLabel}>Recently Scanned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingReview}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionItem}
                onPress={item.onPress}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color="white" />
                </View>
                <Text style={styles.actionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name={item.icon} size={20} color="#555" />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.date}</Text>
                </View>
                <TouchableOpacity style={styles.activityAction}>
                  <Ionicons name="chevron-forward" size={20} color="#777" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Tip */}
        <View style={styles.tipContainer}>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Organize your documents with tags to find them faster when searching.
            </Text>
          </View>
          <Ionicons name="bulb-outline" size={24} color="#FFD700" />
        </View>

        {/* Scan Document Button (Featured/Highlighted) */}
        <TouchableOpacity style={styles.scanButton} onPress={goToDocumentScanner}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan New Document</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign:"center"
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activityList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityDate: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  activityAction: {
    padding: 4,
  },
  tipContainer: {
    backgroundColor: "#FFF9C4",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    backgroundColor:"#FFF9C4"
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#555",
    backgroundColor:"none"
  },
  scanButton: {
    backgroundColor: "#1E88E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  scanButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});