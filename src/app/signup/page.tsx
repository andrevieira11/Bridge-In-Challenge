'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.error?.email) {
          setError('email', { message: json.error.email[0] })
        } else {
          toast.error(json.error || 'Something went wrong. Please try again.')
        }
        return
      }

      // Auto-sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        router.push('/login')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl">BridgeIn</span>
        </Link>

        <div>
          <blockquote className="text-white/80 text-lg leading-relaxed mb-6">
            &quot;Setting this up took ten minutes. Our compliance officer was relieved to finally have a proper process instead of a shared inbox nobody checked.&quot;
          </blockquote>
          <p className="text-white/40 text-sm">— HR Manager, Manufacturing company, 340 employees</p>
        </div>

        <p className="text-white/30 text-xs">
          EU Directive 2019/1937 — Whistleblower Protection
        </p>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 bg-cream flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-teal" />
              </div>
              <span className="text-navy font-bold text-lg">BridgeIn</span>
            </Link>
            <h1 className="text-2xl font-bold text-navy mb-1">Create your workspace</h1>
            <p className="text-sm text-gray-500">
              Get set up in minutes. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your full name</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corp"
                autoComplete="organization"
                {...register('companyName')}
              />
              <p className="text-xs text-gray-400">
                This will be shown to your employees on the submission form.
              </p>
              {errors.companyName && (
                <p className="text-xs text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Creating workspace…' : 'Create workspace'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-teal font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
