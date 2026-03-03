import Link from 'next/link'
import { Shield, XCircle } from 'lucide-react'

export default function ReportNotFound() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl">BridgeIn</span>
        </Link>
      </div>

      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-7 h-7 text-white/40" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Link not found</h1>
      <p className="text-white/50 max-w-sm text-sm leading-relaxed">
        This submission link is invalid or has been deactivated by your company administrator.
        Please ask your HR department or manager for an updated link.
      </p>
    </div>
  )
}
