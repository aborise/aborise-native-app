import { useApp } from '@realm/react';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import Realm from 'realm';
import { Button, Input, SizableText, YStack } from 'tamagui';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import { XStack } from 'tamagui';
import { Spinner } from 'tamagui';
import { isLoading } from 'expo-font';

const LoginForm = (props: {
  onSubmit: (email: string, password: string) => Promise<void>;
  onChangeAction: () => void;
  invalidCredentials: boolean;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // state values for toggable visibility of features in the UI
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [isInSignUpMode, setIsInSignUpMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const focusPasswordInput = useCallback(() => {
    passwordInputRef.current!.focus();
  }, [passwordInputRef]);

  return (
    <YStack alignItems="center" flex={1} justifyContent="center" space="$4" backgroundColor={'$blue8'}>
      <Image source={require('../assets/icon.png')} style={{ width: 200, height: 200 }} />

      <YStack space="$4" width="100%" padding="$4">
        <Input
          onChangeText={setEmail}
          autoCapitalize="none"
          autoFocus
          fontSize="$6"
          borderWidth={0}
          backgroundColor={'transparent'}
          color={'black'}
          borderBottomColor={'$blue10'}
          borderBottomWidth={2}
          borderRadius={0}
          onSubmitEditing={focusPasswordInput}
          placeholderTextColor="#333"
          placeholder="Email"
        />
        <Input
          autoCapitalize="none"
          fontSize="$6"
          borderWidth={0}
          backgroundColor={'transparent'}
          color={'black'}
          borderBottomColor={'$blue10'}
          borderBottomWidth={2}
          borderRadius={0}
          onSubmitEditing={() => {
            setLoading(true);
            props.onSubmit(email, password).then(() => setLoading(false));
          }}
          placeholder="Password"
          onChangeText={setPassword}
          secureTextEntry={passwordHidden}
          ref={passwordInputRef}
          placeholderTextColor="#333"
        />

        {props.invalidCredentials && (
          <SizableText size="$4" color={'$red12'}>
            Invalid credentials
          </SizableText>
        )}

        <XStack justifyContent="center" paddingHorizontal="$4">
          <Button
            onPress={() => {
              setLoading(true);
              props.onSubmit(email, password).then(() => setLoading(false));
            }}
            flex={1}
            fontSize="$5"
            backgroundColor="$blue12"
            color="white"
            iconAfter={loading ? <Spinner size="small" color="$green2" /> : undefined}
            disabled={loading}
          >
            Log In
          </Button>
        </XStack>
        <SizableText marginHorizontal="auto">
          Don't have an account?{' '}
          <SizableText textDecorationLine="underline" onPress={props.onChangeAction}>
            Create Account
          </SizableText>
        </SizableText>
      </YStack>
    </YStack>
  );
};

const Step1 = (props: { onNext: (action: 'login' | 'signup') => void }) => {
  return (
    <YStack alignItems="center" flex={1} justifyContent="center" space="$2" backgroundColor={'$blue8'}>
      <Image source={require('../assets/icon.png')} style={{ width: 200, height: 200 }} />

      <YStack space="$2" position="absolute" bottom="$6">
        <Button
          width={350}
          onPress={() => props.onNext('login')}
          backgroundColor="$blue12"
          color="white"
          height="$5"
          fontSize="$5"
          pressStyle={{ backgroundColor: '$blue12', opacity: 0.8 }}
        >
          Login
        </Button>
        <Button
          width={350}
          onPress={() => props.onNext('signup')}
          backgroundColor="white"
          color="$blue12"
          height="$5"
          fontSize="$5"
          pressStyle={{ opacity: 0.8 }}
        >
          Sign up
        </Button>
        <SizableText color="$gray1" size="$4" textAlign="center">
          By registering you agree to {''}
          <Link href="/terms" style={{ textDecorationLine: 'underline' }}>
            Terms
          </Link>{' '}
          and {''}
          <Link href="/privacy" style={{ textDecorationLine: 'underline' }}>
            Privacy
          </Link>
        </SizableText>
      </YStack>
    </YStack>
  );
};

const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Step2 = (props: { onNext: (email: string) => void; onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [invalidMail, setInvalidMail] = useState(false);

  const checkMail = useCallback(() => {
    if (!mailRegex.test(email)) {
      setInvalidMail(true);
      return;
    }

    setInvalidMail(false);

    props.onNext(email);
  }, [props.onNext, email]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <YStack flex={1} backgroundColor={'$blue8'} space="$2" alignItems="center" justifyContent="center">
          <Button
            position="absolute"
            top="$4"
            left="$0"
            onPress={props.onBack}
            backgroundColor={'transparent'}
            icon={<Icon name="arrow-left" size={24} color="#000000" />}
            pressStyle={{ backgroundColor: 'transparent', opacity: 0.6, borderWidth: 0 }}
          />

          <YStack space="$8" padding="$6" width="100%">
            <SizableText size="$12" color={'$gray12'}>
              Enter your email address
            </SizableText>
            <YStack>
              <Input
                onChangeText={setEmail}
                autoCapitalize="none"
                autoFocus
                fontSize="$8"
                borderWidth={0}
                backgroundColor={'transparent'}
                color={'black'}
                borderBottomColor={'$blue12'}
                borderBottomWidth={2}
                borderRadius={0}
                onSubmitEditing={checkMail}
              />
              {invalidMail && (
                <SizableText size="$4" color={'$red12'}>
                  Invalid email address
                </SizableText>
              )}
            </YStack>
          </YStack>
          <Button
            position="absolute"
            bottom="$6"
            width={350}
            onPress={checkMail}
            backgroundColor="$blue12"
            color="white"
            height="$5"
            fontSize="$5"
            pressStyle={{ backgroundColor: '$blue12', opacity: 0.8 }}
          >
            Continue with email
          </Button>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Step3 = (props: {
  onNext: (password: string) => Promise<void>;
  onBack: () => void;
  emailAddressInUse: boolean;
  onChangeAction: () => void;
}) => {
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <YStack flex={1} backgroundColor={'$blue8'} space="$2" alignItems="center" justifyContent="center">
          <Button
            position="absolute"
            top="$4"
            left="$0"
            onPress={props.onBack}
            backgroundColor={'transparent'}
            icon={<Icon name="arrow-left" size={24} color="#000000" />}
            pressStyle={{ backgroundColor: 'transparent', opacity: 0.6, borderWidth: 0 }}
          />

          <YStack space="$8" padding="$6" width="100%">
            <SizableText size="$12" color={'$gray12'}>
              Enter your password
            </SizableText>
            <YStack space="$2">
              <Input
                onChangeText={setPassword}
                secureTextEntry={passwordHidden}
                autoCapitalize="none"
                autoFocus
                fontSize="$8"
                borderWidth={0}
                backgroundColor={'transparent'}
                color={'black'}
                borderBottomColor={'$blue12'}
                borderBottomWidth={2}
                borderRadius={0}
                onSubmitEditing={() => {
                  setLoading(true);
                  props.onNext(password).then(() => setLoading(false));
                }}
              />
              {props.emailAddressInUse && (
                <SizableText size="$4" color={'$red12'}>
                  Email address already in use. Do you want to{' '}
                  <SizableText onPress={props.onChangeAction} textDecorationLine="underline">
                    Log In
                  </SizableText>{' '}
                  instead?
                </SizableText>
              )}
            </YStack>
          </YStack>
          <Button
            position="absolute"
            bottom="$6"
            width={350}
            onPress={() => {
              setLoading(true);
              props.onNext(password).then(() => setLoading(false));
            }}
            disabled={loading}
            backgroundColor="$blue12"
            color="white"
            height="$5"
            iconAfter={loading ? <Spinner size="small" color="$green2" /> : undefined}
            fontSize="$5"
            pressStyle={{ backgroundColor: '$blue12', opacity: 0.8 }}
          >
            Register
          </Button>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // state values for toggable visibility of features in the UI
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [isInSignUpMode, setIsInSignUpMode] = useState(true);
  const [step, setStep] = useState(0);
  const [action, setAction] = useState<'login' | 'signup'>('login');
  const [emailAddressInUse, setEmailAddressInUse] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const app = useApp();

  // signIn() uses the emailPassword authentication provider to log in
  const signIn = useCallback(
    async (email: string, password: string) => {
      const creds = Realm.Credentials.emailPassword(email, password);
      await app.logIn(creds).catch((err) => {
        if (err.message === 'invalid username/password') {
          setInvalidCredentials(true);
        } else {
          Alert.alert('Login failed');
        }
      });
    },
    [app],
  );

  // onPressSignUp() registers the user and then calls signIn to log the user in
  const onPressSignUp = useCallback(
    async (email: string, password: string) => {
      await app.emailPasswordAuth
        .registerUser({ email, password })
        .then(() => {
          return signIn(email, password);
        })
        .catch((err) => {
          if (err.message === 'name already in use') {
            setEmailAddressInUse(true);
          } else {
            Alert.alert('Signing up failed');
          }
        });
    },
    [signIn, app],
  );

  if (step === 0) {
    return (
      <Step1
        onNext={(action) => {
          setAction(action);
          setStep(step + 1);
        }}
      />
    );
  }

  if (action === 'login') {
    return (
      <LoginForm onSubmit={signIn} onChangeAction={() => setAction('signup')} invalidCredentials={invalidCredentials} />
    );
  }

  if (action === 'signup') {
    if (step === 1) {
      return (
        <Step2
          onNext={(email) => {
            setEmail(email);
            setStep(step + 1);
          }}
          onBack={() => setStep(step - 1)}
        />
      );
    }

    if (step === 2) {
      return (
        <Step3
          onNext={(password) => onPressSignUp(email, password)}
          onBack={() => setStep(step - 1)}
          emailAddressInUse={emailAddressInUse}
          onChangeAction={() => {
            setStep(1);
            setAction('login');
          }}
        />
      );
    }
  }

  return null;
};

export default Login;
