import { SquareDashedMousePointer } from "lucide-react-native";
import { TouchableOpacity, View,Text } from "react-native";
import { Avatar } from "./avater";
import { useAuth } from "@/core/hooks/use-auth";

export const Header = () => {
    const { user } = useAuth();

    return ( 
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Avatar name={user?.username.toUpperCase()}/>
                <Text>{user?.email}</Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity className="w-10 h-10 rounded-lg items-center justify-center">
                  <SquareDashedMousePointer size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
     );
}
