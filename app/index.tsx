import React, { useEffect, useState } from 'react'
import { View, Text, Button } from 'react-native'
import { supabase } from '../supabaseClient'
import AuthScreen from './auth/AuthScreen'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => setSession(session)
    )
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!session) return <AuthScreen />
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logged in as {session.user.email}</Text>
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  )
}
