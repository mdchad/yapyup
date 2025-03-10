import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { OTPForm } from '@/components/otp-form';
// import Paywall from "@/components/paywall";
import { SignInApple } from '@/components/sign-in-apple';
import { Button, ControlledInput, Text, View } from '@/components/ui';

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit: SubmitHandler<FormType>;
  onSignInApple?: SubmitHandler<FormType>;
  onSubmitOTP?: any;
  error?: boolean;
};

export const LoginForm = ({
  onSubmit = () => {},
  onSignInApple = () => {},
  onSubmitOTP = () => {},
  error,
}: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const [step, setStep] = useState(1); // Track current step
  const [isExiting, setIsExiting] = useState(false); // Controls exit state

  const goToNextStep = () => {
    setIsExiting(true); // Allow the next step to render
  };

  const onExitComplete = () => {
    setIsExiting(false); // Allow the next step to render
    setStep((prev) => prev + 1); // Move to the next step
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <MotiView
            key="step-1"
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: 20 }}
          >
            <View className="mb-16 items-center justify-center">
              <Text
                testID="form-title"
                className="pb-6 text-center text-4xl font-bold"
              >
                BrainBard
              </Text>

              <Text className="mb-6 max-w-xs text-center text-2xl text-red-500">
                The #1 Learning app to learn a new language
              </Text>
            </View>

            <SignInApple onSignInApple={onSignInApple} />
            <Button
              variant="outline"
              className="h-10"
              testID="login-button"
              label="Continue With Email"
              onPress={goToNextStep}
            />
          </MotiView>
        );
      // case 2:
      //   return <Paywall />;
      case 2:
        return (
          <MotiView
            key="step-2"
            from={{ opacity: 0, translateX: -20 }}
            animate={{
              opacity: 1, // Wait for exit to complete
              translateX: 0,
            }}
            exit={{ opacity: 0, translateX: 20 }}
          >
            <ControlledInput
              testID="email-input"
              control={control}
              name="email"
              label="Email"
            />
            {error && <Text className="text-red-500">Error</Text>}
            <Button
              label="Submit"
              onPress={handleSubmit((data) => {
                // Call parent's onSubmit first
                onSubmit(data);
                // Proceed to next step after onSubmit logic completes
                goToNextStep();
              })}
            />
          </MotiView>
        );
      case 3:
        return (
          <MotiView
            key="step-3"
            from={{ opacity: 0, translateX: -20 }}
            animate={{
              opacity: 1, // Wait for exit to complete
              translateX: 0,
            }}
            exit={{ opacity: 0, translateY: -20 }}
          >
            <OTPForm onSubmit={onSubmitOTP} />
          </MotiView>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="my-20 flex-1 justify-center p-4">
        <AnimatePresence onExitComplete={onExitComplete}>
          {!isExiting && renderStep()}
        </AnimatePresence>
      </View>
    </KeyboardAvoidingView>
  );
};
