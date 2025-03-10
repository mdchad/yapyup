import React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';

import type { LoginFormProps } from './login-form';
import { LoginForm } from './login-form';

afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();

describe('LoginForm Form ', () => {
  it('renders correctly', async () => {
    setup(<LoginForm onSubmit={onSubmitMock} />);
    expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
  });

  it('should proceed to email input when continue with email is clicked', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    await user.press(button);

    expect(await screen.findByTestId('email-input')).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    // First go to email step
    const continueButton = screen.getByTestId('login-button');
    await user.press(continueButton);

    const emailInput = await screen.findByTestId('email-input');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByText('Submit');
    await user.press(submitButton);

    expect(await screen.findByText(/Invalid email format/i)).toBeOnTheScreen();
  });

  it('Should call onSubmit with correct values when email is valid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    // First go to email step
    const continueButton = screen.getByTestId('login-button');
    await user.press(continueButton);

    const emailInput = await screen.findByTestId('email-input');
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByText('Submit');
    await user.press(submitButton);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitMock).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
      },
      expect.objectContaining({})
    );
  });
});
