import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'
import { getFarmerProfile } from '@/app/actions/profile'

export async function DashboardRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const profile = await getFarmerProfile()
  return <Dashboard user={{ name: session.user.name, email: session.user.email }} profile={profile} />
}
