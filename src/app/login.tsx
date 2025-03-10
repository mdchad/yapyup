import * as AppleAuthentication from 'expo-apple-authentication';
import { Redirect } from 'expo-router';
import React from 'react';

import type {
  FormType as LoginFormType,
  LoginFormProps,
} from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import type {
  FormType as OTPFormType,
  OTPFormProps,
} from '@/components/otp-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';

export default function Login() {
  // Select only the needed state and actions using individual selectors
  const status = useAuth((state) => state.status);
  const email = useAuth((state) => state.email);
  const signIn = useAuth((state) => state.signIn);
  const verify = useAuth((state) => state.verifyOTP);
  const signInApple = useAuth((state) => state.signInApple);

  // Use boolean for error state to match LoginFormProps
  const [hasError, setHasError] = React.useState(false);

  // Handle login form submission
  const onSubmit: LoginFormProps['onSubmit'] = React.useCallback(
    async (data: LoginFormType) => {
      try {
        const { error: signInError } = await signIn(data.email);
        setHasError(Boolean(signInError));
      } catch (e) {
        setHasError(true);
      }
    },
    [signIn]
  );

  // Handle OTP verification
  const onSubmitOTP: OTPFormProps['onSubmit'] = React.useCallback(
    async (data: OTPFormType) => {
      try {
        const { error: verifyError } = await verify(email, data.otp);
        setHasError(Boolean(verifyError));
      } catch (e) {
        setHasError(true);
      }
    },
    [email, verify]
  );

  // Handle Apple sign in
  const onSignInApple = React.useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await signInApple(credential.identityToken);
      } else {
        throw new Error('No identity token provided');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      setHasError(true);
    }
  }, [signInApple]);

  // Immediate redirect when status changes to 'signIn'
  if (status === 'signIn') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onSubmit={onSubmit}
        onSignInApple={onSignInApple}
        onSubmitOTP={onSubmitOTP}
        error={hasError}
      />
    </>
  );
}
