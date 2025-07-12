import React, { useRef, useState } from "react";
import { FlatList, View, StyleSheet, Dimensions } from "react-native";
import WelcomeScreen1 from "./welcome/WelcomeScreen1";
import WelcomeScreen2 from "./welcome/WelcomeScreen2";
import WelcomeScreen3 from "./welcome/WelcomeScreen3";
import WelcomeScreen4 from "./welcome/WelcomeScreen4";
import LandingPage from "./welcome/LandingPage";

const { width } = Dimensions.get("window");

const WelcomeCarousel = ({ onWelcomeComplete, onNavigateToAuth }) => {
  const flatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLogin = () => {
    onWelcomeComplete();
    onNavigateToAuth("Login");
  };

  const handleRegister = () => {
    onWelcomeComplete();
    onNavigateToAuth("Register");
  };

  const pages = [
    <WelcomeScreen1 onNext={() => goToPage(1)} />,
    <WelcomeScreen2 onNext={() => goToPage(2)} />,
    <WelcomeScreen3 onNext={() => goToPage(3)} />,
    <WelcomeScreen4 onNext={() => goToPage(4)} />,
    <LandingPage onLogin={handleLogin} onRegister={handleRegister} />,
  ];

  const goToPage = (index) => {
    flatListRef.current.scrollToIndex({ index });
    setCurrentIndex(index);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={pages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => <View style={styles.page}>{item}</View>}
    />
  );
};

const styles = StyleSheet.create({
  page: {
    width,
    flex: 1,
  },
});

export default WelcomeCarousel;
