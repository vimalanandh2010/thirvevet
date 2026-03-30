import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkBuckets() {
  console.log('Checking Supabase Buckets for:', supabaseUrl)
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('Error listing buckets:', error.message)
    return
  }
  
  if (data && data.length > 0) {
    console.log('Found Buckets:')
    data.forEach(bucket => {
      console.log(`- ${bucket.name} (Public: ${bucket.public})`)
    })
  } else {
    console.log('No buckets found in this project.')
  }
}

checkBuckets()
