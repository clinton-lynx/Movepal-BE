import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../config/firebase'
import { User } from '../types/auth'

export const authService = {
  async register(name: string, email: string, password: string) {
    // Check if user exists
    const existing = await db.collection('users')
      .where('email', '==', email)
      .get()
    
    if (!existing.empty) {
      throw new Error('Email already registered')
    }

    const hashed = await bcrypt.hash(password, 10)
    const userRef = db.collection('users').doc()
    
    const user: User = {
      id: userRef.id,
      name,
      email,
      createdAt: new Date().toISOString(),
    }

    await userRef.set({ ...user, password: hashed })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    )

    return { token, user }
  },

  async login(email: string, password: string) {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .get()

    if (snapshot.empty) {
      throw new Error('Invalid credentials')
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    const valid = await bcrypt.compare(password, data.password)
    if (!valid) {
      throw new Error('Invalid credentials')
    }

    const user: User = {
      id: doc.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    )

    return { token, user }
  }
}
