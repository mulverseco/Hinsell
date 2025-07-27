import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/hooks/use-auth";
import { Text, View } from "react-native";

export const Profile  = () => {
    const { user,logout } = useAuth();
    return ( 
         <View className='flex-1 bg-white items-center justify-center'>
        <View className=" ">
            <Text className="text-black">{user?.username}</Text>
            <Button title={"Logout"} onPress={logout} />
        </View>
        </View>
    );
}
 