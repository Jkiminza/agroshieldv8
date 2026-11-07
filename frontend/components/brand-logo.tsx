import Image from 'next/image'
import Link from 'next/link'

export function BrandLogo({ href = '/', className = '', imageClassName = '' }: { href?: string; className?: string; imageClassName?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`} aria-label="AgroShield home">
      <Image src="/agroshield-logo.png" alt="AgroShield" width={34} height={48} className={`h-10 w-auto object-contain mix-blend-normal ${imageClassName}`} priority />
      <span className="font-semibold tracking-tight">AgroShield</span>
    </Link>
  )
}
