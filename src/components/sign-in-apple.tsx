import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export function SignInApple({ onSignInApple }: any) {
  if (Platform.OS === 'ios') {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: '100%', height: 38 }}
        onPress={onSignInApple}
      />
    );
  }
  return <>{/* Implement Android Auth options. */}</>;
}
