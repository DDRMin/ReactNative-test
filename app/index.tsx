import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center bg-light-100">
        <Text className=" text-dark-100 font-bold text-5xl">
          Welcome!
        </Text>
        <Link href="/onboarding" className="mt-4 px-4 py-2 bg-primary-500 rounded">
          Onboarding
        </Link>
      </View>
    </SafeAreaView>
  );
}
