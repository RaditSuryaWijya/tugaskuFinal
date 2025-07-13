import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { useTranslation } from 'react-i18next';

const WelcomeScreen1 = ({ onNext }) => {
  const { t } = useTranslation();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#E0E7FF",
      }}
    >
      <Image
        source={require("../../../assets/logo.png")}
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
        {t('welcome.app_name')}
      </Text>
      <Text
        style={{
          color: "#1E40AF",
          textAlign: "center",
          marginBottom: 24,
          maxWidth: 300,
        }}
      >
        {t('welcome.screen1.description')}
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
};

export default WelcomeScreen1;
