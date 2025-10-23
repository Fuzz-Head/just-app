import React, { useState } from 'react'
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Switch } from 'react-native'
import { supabase } from '../../supabaseClient'
import { FontAwesome, AntDesign, Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

const providers = ['google', 'apple'] as const
type ProviderType = typeof providers[number]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthScreen() {
  const router = useRouter()
  // test remove later 
  const [goHome, setGoHome] = useState(false)

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleToggle() {
    setGoHome(!goHome)
    if (!goHome) {
      router.push('/home')
    }
  }

  function validate() {
    let valid = true
    setEmailError(null)
    setPasswordError(null)

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      valid = false
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      valid = false
    }

    return valid
  }

  async function handleSignUp() {
    //if (!validate()) return

    setLoading(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (!signUpError && data) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: data.user?.id, email: data.user?.email }])

      if (insertError) {
        setError(insertError.message)
      }
    }
    if (signUpError) {
      setError(signUpError.message)
    } else {
      router.replace('/auth/signin')
    }
    setLoading(false)
  }

  async function handleOAuth(provider: ProviderType) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.title}>Welcome</Text>

        <View style={styles.switchRow}>
          <Switch
            value={goHome}
            onValueChange={handleToggle}
            thumbColor={goHome ? '#fff' : '#ccc'}
            trackColor={{ false: '#555', true: '#2563EB' }}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, email ? styles.labelFocused : {}]}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : email ? styles.inputFocused : {}]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            //placeholder="your@example.com"
            placeholderTextColor="#bbb"
          />
        </View>
        {emailError ? <Text style={styles.validationErrorText}>{emailError}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, password ? styles.labelFocused : {}]}>Password</Text>
          <View>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : password ? styles.inputFocused : {}]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              //placeholder="••••••••"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#bbb" />
            </TouchableOpacity>
          </View>
        </View>
        {passwordError ? <Text style={styles.validationErrorText}>{passwordError}</Text> : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : undefined]}
          disabled={loading}
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/signin')} style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? <Text style={styles.signupLink}>Sign In</Text></Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <View style={styles.oauthContainer}>
          <TouchableOpacity
            style={[styles.oauthButton, { backgroundColor: '#DB4437' }]}
            onPress={() => handleOAuth('google')}
            disabled={loading}
            activeOpacity={0.7}
          >
            <FontAwesome name="google" size={24} color="white" />
            <Text style={styles.oauthText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, { backgroundColor: '#000' }]}
            onPress={() => handleOAuth('apple')}
            disabled={loading}
            activeOpacity={0.7}
          >
            <FontAwesome name="apple" size={24} color="white" />
            <Text style={styles.oauthText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient >
  )
}

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    color: 'white',
    fontWeight: '700',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 20, // starting position inside the input
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    zIndex: 10,
    fontWeight: '600',
  },
  labelFocused: {
    top: -14, // raised higher to float above input text
    fontSize: 12,
    color: '#a1a1a1',
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 16, // align text with label
    paddingTop: 18, // prevent overlap with label
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  inputFocused: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  inputError: {
    backgroundColor: 'rgba(255,0,0,0.15)',
  },
  validationErrorText: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: Platform.select({ ios: 16, android: 14 }),
    zIndex: 11,
  },
  button: {
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 52,
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  orText: {
    marginVertical: 24,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 1.2,
  },
  oauthContainer: {
    gap: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
  },
  oauthText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  signupContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  signupLink: {
    color: '#d1d5db',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '85%',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 40,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 16,
    width: '80%',
    marginBottom: 40,
  },
})
