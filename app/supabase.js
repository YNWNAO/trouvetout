import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuhpdqioggxznceqvpvx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51aHBkcWlvZ2d4em5jZXF2cHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDU1MDMsImV4cCI6MjA5NTQ4MTUwM30.JArvB0pbdZbXPwYoIj45GRwCOyjEx6ZRD9qC77qjzIc'

export const supabase = createClient(supabaseUrl, supabaseKey)