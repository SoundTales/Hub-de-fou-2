import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl)
  
  // 1. Test basic query
  const { data: tales, error: talesError } = await supabase
    .from('tales')
    .select('count')
    .limit(1)

  if (talesError) {
    console.error('❌ Connection failed:', talesError)
    if (talesError.cause) console.error('Cause:', talesError.cause)
    return
  }
  console.log('✅ Connection successful! Tales table accessible.')

  // 2. Check for content_url column in chapters
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .limit(1)

  if (chaptersError) {
    console.error('❌ Error fetching chapters:', chaptersError.message)
  } else if (chapters.length > 0) {
    const columns = Object.keys(chapters[0])
    if (columns.includes('content_url')) {
      console.log('✅ Column "content_url" exists in "chapters" table.')
    } else {
      console.log('⚠️ Column "content_url" is MISSING in "chapters" table.')
    }
  } else {
    console.log('ℹ️ Chapters table is empty, cannot verify columns automatically.')
  }
}

testConnection()
