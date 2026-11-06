// scripts/seed-students.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
        process.env[key] = val
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

if (!globalThis.WebSocket) {
  globalThis.WebSocket = class DummyWebSocket {}
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Raw student list from images
const rawStudents = [
  "PRIYA DARSHINI",
  "SRIMATHI",
  "ANANTHAN",
  "HIRADHINI",
  "SARVESH",
  "GOPALA KRISHNAN",
  "SRINIVASAN",
  "SOMESH",
  "KABILESH",
  "MAGESH",
  "SADHANA",
  "KAVINASH",
  "HANSEL",
  "JAI GOUTHAM",
  "ASHWIN",
  "SHANMUGAN",
  "GURU PRANAV",
  "SHARMILI",
  "SHANMUGA PRIYAN",
  "DINESH KARTHICK",
  "KRISH",
  "DEEPAK KUMAR",
  "SUDHIR",
  "HARITH",
  "KANURAGHAVENDRA",
  "KEERTHIVASAN",
  "HAARISH",
  "SAKTHI SARAN",
  "ABINAYA",
  "VARSHA VARDHINI",
  "PUGAZHENDHI",
  "THANUJ KRISHNARAJ",
  "RONI",
  "SRI VARSHAN",
  "PRIYA DHARSHAN",
  "VIJAYA LAKSHMI",
  "KARAN",
  "PRADEEP",
  "DHARANI DHARAN",
  "NITHIN",
  "SIDDHARTH",
  "PAVAN PUTHRAN",
  "NAVEEN",
  "PRIYA DARSHINI", // duplicate 2
  "HAASHINI",
  "DIWAKAR",
  "RITHISH",
  "KRISHWIN SURIYA",
  "SHAHANA BANU",
  "SHEM JEBERSHAN",
  "KRISHNAN",
  "KEVIN MATHEW",
  "NAKSHATHRA",
  "MOHAMMED EJAS",
  "HARSHAN",
  "PRANAV",
  "KAVIN SANDROM",
  "NITHISH KUMAR",
  "YOKESH",
  "HARIHARAN",
  "NIVETHA",
  "RITHIK",
  "HIREN",
  "ARJUN",
  "NIVEDITA",
  "KOKILA",
  "SIDDHANTH",
  "CELINA",
  "PRIYA",
  "MALARKODI",
  "SADHU",
  "KEERTHIVASAN(DATA ANALYST)",
  "NAWID KHAN",
  "PRASANTH",
  "DARSHAN.R (PYTHON)",
  "MARSHAL",
  "DHANSUKH",
  "ADELINE",
  "NEKASH",
  "YUGANDHAR",
  "DHARSHAN S (C PROGRAM)"
]

// Map raw student names to clean name, unique email, and password (name + 123)
const seenEmails = new Map()

const processedStudents = rawStudents.map((rawName, index) => {
  // Extract core name for password (alphanumeric only, lowercase)
  // e.g. "PRIYA DARSHINI" -> "priyadarshini"
  // "DARSHAN.R (PYTHON)" -> "darshanr"
  let cleanName = rawName
  let dept = 'Computer Science'
  
  if (rawName.includes('DATA ANALYST')) {
    cleanName = 'KEERTHIVASAN'
    dept = 'Data Analytics'
  } else if (rawName.includes('PYTHON')) {
    cleanName = 'DARSHAN R'
    dept = 'Python Programming'
  } else if (rawName.includes('C PROGRAM')) {
    cleanName = 'DHARSHAN S'
    dept = 'C Programming'
  }

  // Base slug for email and password
  const baseSlug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  
  // Base password: name followed by 123
  const password = `${baseSlug}123`

  // Ensure unique email
  let emailSlug = baseSlug
  const count = seenEmails.get(baseSlug) || 0
  if (count > 0) {
    emailSlug = `${baseSlug}${count + 1}`
  }
  seenEmails.set(baseSlug, count + 1)

  const email = `${emailSlug}@emonk.edu`
  const registerNumber = `EM2026${String(index + 101).padStart(3, '0')}`

  return {
    fullName: cleanName,
    rawName,
    email,
    password,
    department: dept,
    registerNumber,
    year: 1
  }
})

async function seedStudents() {
  console.log(`Starting seeding for ${processedStudents.length} students...`)
  let successCount = 0
  let updatedCount = 0
  let errorCount = 0

  for (const student of processedStudents) {
    try {
      // Check if user already exists in auth
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existingUser = listData?.users?.find(u => u.email === student.email)

      let userId = null

      if (existingUser) {
        userId = existingUser.id
        // Update password to name followed by 123
        await supabase.auth.admin.updateUserById(userId, {
          password: student.password,
          user_metadata: {
            full_name: student.fullName,
            role: 'student',
            must_change_password: true
          }
        })
        updatedCount++
      } else {
        // Create new user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: {
            full_name: student.fullName,
            role: 'student',
            must_change_password: true
          }
        })

        if (authError || !authData.user) {
          console.error(`Error creating auth user ${student.email}:`, authError?.message)
          errorCount++
          continue
        }
        userId = authData.user.id
        successCount++
      }

      // Upsert into profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: student.email,
          full_name: student.fullName,
          register_number: student.registerNumber,
          department: student.department,
          year: student.year,
          role: 'student',
          status: 'active'
        }, { onConflict: 'id' })

      if (profileError) {
        console.error(`Error upserting profile for ${student.email}:`, profileError.message)
      } else {
        console.log(`[OK] ${student.fullName} | Email: ${student.email} | Pass: ${student.password}`)
      }
    } catch (err) {
      console.error(`Failed to process ${student.email}:`, err)
      errorCount++
    }
  }

  console.log(`\n==========================================`)
  console.log(`Seeding Complete!`)
  console.log(`Created: ${successCount}`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Errors:  ${errorCount}`)
  console.log(`Total:   ${processedStudents.length}`)
  console.log(`==========================================\n`)
}

seedStudents()
