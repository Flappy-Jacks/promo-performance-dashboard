interface SectionHeaderProps {
  label: string;
  takeaway: string;
  takeawayDetail?: string;
  id: string;
}

export function SectionHeader({ label, takeaway, takeawayDetail, id }: SectionHeaderProps) {
  return (
    <div className="section-heading">
      <div className="section-title-wrap">
        <p className="section-kicker">[{label}]</p>
        <h2 id={id}>{takeaway}</h2>
        {takeawayDetail && <p className="section-takeaway-detail">{takeawayDetail}</p>}
      </div>
    </div>
  );
}