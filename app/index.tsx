import React, { useEffect, useState } from 'react'
import { View, Text, Button } from 'react-native'
import { supabase } from '../supabaseClient'
import AuthScreen from './auth/AuthScreen'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'
import * as  SplashScreen from 'expo-splash-screen'
import SignIn from './auth/signin'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {

    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
        await SplashScreen.hideAsync()
      }
    }
    prepare()

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => setSession(session)
    )
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!appIsReady) return null

  if (!session) return <SignIn />
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logged in as {session.user.email}</Text>
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  )
}
