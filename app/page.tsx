'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { USERS } from '@/lib/data'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const user = USERS.find(u => u.email === email && u.password === password)
    if (!user) { setError('Email o contraseña incorrectos'); return }
    localStorage.setItem('user', JSON.stringify(user))
    router.push(user.role === 'admin' ? '/admin' : '/profesional')
  }

  function quickLogin(role: 'admin' | 'profesional') {
    const user = USERS.find(u => u.role === role)!
    localStorage.setItem('user', JSON.stringify(user))
    router.push(role === 'admin' ? '/admin' : '/profesional')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Policonsultorio</h1>
          <p className="text-teal-200 text-sm mt-1">Ciudad Jardín</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-gray-800 font-semibold text-lg mb-6">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Ingresar
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Acceso rápido (demo)</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="flex-1 text-xs py-2 rounded-lg bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors"
              >
                👩‍💼 Admin
              </button>
              <button
                onClick={() => quickLogin('profesional')}
                className="flex-1 text-xs py-2 rounded-lg bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition-colors"
              >
                🩺 Profesional
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-400 space-y-0.5">
              <p><span className="font-medium">Admin:</span> admin@ciudadjardín.com / admin123</p>
              <p><span className="font-medium">Prof:</span> sebastian@ciudadjardín.com / prof123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
