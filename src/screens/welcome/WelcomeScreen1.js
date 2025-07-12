import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";

const WelcomeScreen1 = ({ onNext }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#E0E7FF", // kamu bisa ubah jadi linear gradient kalau pakai expo-linear-gradient
    }}
  >
    <Image
      source={require("../../../assets/logo.png")} // sesuaikan dengan struktur folder kamu
      style={{ width: 80, height: 80, marginBottom: 24 }}
    />
    <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 12,
      }}
    >
      TugasKu
    </Text>
    <Text
      style={{
        color: "#1E40AF",
        textAlign: "center",
        marginBottom: 24,
        maxWidth: 300,
      }}
    >
      Membantu kamu menyelesaikan tugas dengan mudah dan teratur!
    </Text>

    <View style={{ flexDirection: "row", gap: 8 }}>
      <View
        style={{
          width: 32,
          height: 8,
          backgroundColor: "#2563EB",
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#BFDBFE",
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#BFDBFE",
          borderRadius: 4,
        }}
      />
    </View>
  </View>
);

export default WelcomeScreen1;
