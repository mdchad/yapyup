import * as AppleAuthentication from 'expo-apple-authentication';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';

import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { type OTPFormProps } from '@/components/otp-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';

export default function Login() {
  const signIn = useAuth.use.signIn();
  const signInApple = useAuth.use.signInApple();
  const verify = useAuth.use.verifyOTP();
  const status = useAuth.use.status();
  const email = useAuth.use.email();

  const [error, setError] = useState<boolean>(false);

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    console.log(data);
    const { error } = await signIn(data.email);
    if (error) {
      setError(true);
    }
  };

  const onSubmitOTP: OTPFormProps['onSubmit'] = async (data) => {
    console.log(data);
    const { error } = await verify(email, data.otp);

    console.log(status);

    if (error) {
      setError(true);
    }
  };

  const onSignInApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Sign in via Supabase Auth.
      if (credential.identityToken) {
        await signInApple(credential.identityToken);
      } else {
        throw new Error('No identityToken.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  };
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
        error={error}
      />
    </>
  );
}
