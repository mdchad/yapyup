import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button, ControlledInput, Text } from '@/components/ui';

const schema = z.object({
  otp: z.string({
    required_error: 'Email is required',
  }),
});

export type FormType = z.infer<typeof schema>;

export type OTPFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  error?: boolean;
};

export const OTPForm = ({ onSubmit = () => {}, error }: OTPFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  return (
    <>
      <ControlledInput
        testID="otp-input"
        control={control}
        name="otp"
        label="OTP"
      />
      {error && <Text className="text-red-500">Error</Text>}
      <Button
        testID="otp-button"
        label="Submit"
        onPress={handleSubmit(onSubmit)}
      />
    </>
  );
};
