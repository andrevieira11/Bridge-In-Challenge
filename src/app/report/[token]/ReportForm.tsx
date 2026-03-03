'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REPORT_CATEGORIES } from '@/lib/utils'

const baseSchema = z.object({
  title: z.string().min(5, 'Please give your report a title of at least 5 characters').max(200),
  category: z.string().min(1, 'Please select a category'),
  description: z
    .string()
    .min(20, 'Please describe the situation in more detail — at least 20 characters')
    .max(10000),
  isAnonymous: z.boolean(),
  contactEmail: z.string().optional(),
})

const schema = baseSchema.refine(
  (data) => {
    if (!data.isAnonymous) {
      return data.contactEmail && z.string().email().safeParse(data.contactEmail).success
    }
    return true
  },
  { message: 'A valid email is required when not submitting anonymously', path: ['contactEmail'] }
)

type FormData = z.infer<typeof schema>

interface ReportFormProps {
  token: string
  companyName: string
}

export function ReportForm({ token, companyName }: ReportFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isAnonymous: true,
    },
  })

  const isAnonymous = watch('isAnonymous')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          token,
          contactEmail: data.isAnonymous ? '' : data.contactEmail,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        const firstError = Object.values(json.error || {}).flat()[0] as string
        toast.error(firstError || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      toast.error('Could not submit your report. Please check your connection and try again.')
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Report received</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          {isAnonymous
            ? 'Your anonymous report has been submitted securely to the designated administrator at '
            : 'Your report has been submitted to the designated administrator at '}
          <strong>{companyName}</strong>.
          {!isAnonymous &&
            ' If appropriate, they may reach out using the contact details you provided.'}
        </p>
        <p className="text-xs text-gray-400 mt-6">
          You may close this tab.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
    >
      {/* Anonymous toggle — prominent, at the top */}
      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {isAnonymous ? (
              <EyeOff className="w-4 h-4 text-teal" />
            ) : (
              <Eye className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm font-semibold text-navy">
              {isAnonymous ? 'Anonymous submission' : 'Identified submission'}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {isAnonymous
              ? 'Your identity will not be disclosed. No contact information will be stored.'
              : 'You will provide an email address for the administrator to follow up.'}
          </p>
        </div>
        <Controller
          control={control}
          name="isAnonymous"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="ml-4 mt-0.5"
            />
          )}
        />
      </div>

      {/* Contact email — only shown when not anonymous */}
      {!isAnonymous && (
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Your email address</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            {...register('contactEmail')}
          />
          <p className="text-xs text-gray-400">
            Only the designated administrator will have access to this.
          </p>
          {errors.contactEmail && (
            <p className="text-xs text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Report title</Label>
        <Input
          id="title"
          placeholder="Brief summary of the issue"
          maxLength={200}
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <span className="text-xs text-gray-400">{charCount}/10000</span>
        </div>
        <Textarea
          id="description"
          placeholder="Describe what happened, when, where, and who was involved. The more detail you provide, the easier it is to investigate."
          className="min-h-[160px] resize-y"
          maxLength={10000}
          {...register('description', {
            onChange: (e) => setCharCount(e.target.value.length),
          })}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        <Lock className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Submitting securely…' : 'Submit report securely'}
      </Button>
    </form>
  )
}
