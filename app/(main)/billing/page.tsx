import { CreditCard } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-zinc-900">Billing & Plans</h1>
      </div>
      
      <ComingSoon 
        title="Billing Portal"
        description="Manage your subscription, view invoices, and set up usage alerts to control your monthly spend."
        icon={CreditCard}
      />
    </div>
  )
}
