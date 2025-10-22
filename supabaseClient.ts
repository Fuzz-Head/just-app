import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = 'https://wyiidqizmrivaskojjub.supabase.co'
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aWlkcWl6bXJpdmFza29qanViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDEwNDcsImV4cCI6MjA3NjUxNzA0N30.WLO-82JUICTLD_pt2-M6eyplkJq1ThWRfJAcyGTa6T4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
