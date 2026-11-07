interface StatCardProps {
  label: string
  value: string | number
  accent?: boolean
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="bg-[#171917] border border-[#2b332e] rounded-lg p-6 card-hover-glow">
      <p className="text-[#8a9bb5] text-sm font-medium mb-2">{label}</p>
      <p className={`font-display text-3xl font-bold ${accent ? 'text-[#00c896]' : 'text-[#f0f4ff]'}`}>
        {value}
      </p>
    </div>
  )
}
