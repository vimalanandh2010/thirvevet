import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: './.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase URL or Key missing in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runTestUpload() {
  console.log('--- 🛡️ Starting Automated Product Upload Test ---')
  console.log('Project URL:', supabaseUrl)

  try {
    // 1. Read the test image
    const imagePath = path.resolve('./public/test-product.png')
    if (!fs.existsSync(imagePath)) {
        console.error('❌ Error: test-product.png not found in public folder.')
        return;
    }
    const fileBuffer = fs.readFileSync(imagePath)
    const fileName = `test-upload-${Date.now()}.png`
    const filePath = fileName

    console.log(`Step 1: Uploading ${fileName} to bucket "product-images"...`)

    // 2. Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileBuffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Supabase Upload Error:', uploadError.message, `(Status: ${uploadError.status})`)
      if (uploadError.status === 404 || uploadError.message.includes('not found')) {
          console.log('💡 TIP: Go to your Supabase dashboard and create a PUBLIC bucket named "product-images"')
      }
      return
    }

    console.log('✅ Supabase Upload Success:', data.path)

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    console.log('✅ Generated Public URL:', publicUrl)

    // 4. Send to Backend
    console.log('Step 2: Syncing with local backend (http://localhost:5001)...')
    const productData = {
      name: 'Automated Test Product',
      price: 99,
      category: 'Supplements',
      stock: 10,
      description: 'This is a dummy product created by an automated test script.',
      imageUrl: publicUrl
    }

    const response = await fetch('http://localhost:5001/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })

    if (response.ok) {
      const savedProduct = await response.json()
      console.log('✅ Backend Sync Success! Product ID:', savedProduct._id)
      console.log('\n--- 🎊 TEST REPORT: SUCCESS ---')
      console.log(`Product Name: ${productData.name}`)
      console.log(`Storage URL: ${publicUrl}`)
      console.log('-------------------------------')
    } else {
      const errorData = await response.text()
      console.error('❌ Backend Sync Failed:', errorData)
      console.log('\n--- ⚠️ TEST REPORT: PARTIAL SUCCESS ---')
      console.log('Image was stored in Supabase, but backend failed. Check if MongoDB is running.')
    }

  } catch (err) {
    console.error('❌ Unexpected Test Error:', err)
  }
}

runTestUpload()
