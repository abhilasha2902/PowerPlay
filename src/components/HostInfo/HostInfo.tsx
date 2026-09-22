import type { HostInfo as HostInfoType } from '../../types/listing'
import './HostInfo.css'

interface HostInfoProps {
  host: HostInfoType
}

export default function HostInfo({ host }: HostInfoProps) {
  return (
    <div className="host-info">
      <img className="host-info-avatar" src={host.avatarUrl} alt={`${host.name} profile photo`} />
      <div>
        <p className="host-info-name">{host.name}</p>
        <p className="host-info-meta">{host.meta}</p>
      </div>
    </div>
  )
}
