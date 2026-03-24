const required = [
  'JWT_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY', 
  'FIREBASE_CLIENT_EMAIL',
]

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    process.exit(1)
  }
})
