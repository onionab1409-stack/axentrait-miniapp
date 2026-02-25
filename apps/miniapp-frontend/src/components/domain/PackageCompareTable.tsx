import type { Package } from '../../shared/types/content';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

type PackageCompareTableProps = {
  items: Package[];
};

export function PackageCompareTable({ items }: PackageCompareTableProps) {
  return (
    <div className="ax-col" style={{ gap: 12 }}>
      {items.map((pkg) => (
        <Card key={pkg.id}>
          <div className="ax-col" style={{ gap: 10 }}>
            <div className="ax-row" style={{ justifyContent: 'space-between' }}>
              <h3 className="h2" style={{ fontSize: 20 }}>
                {pkg.name}
              </h3>
              <Badge>{pkg.priceRange}</Badge>
            </div>
            <p className="p muted">Для кого: {pkg.idealFor}</p>
            <div className="ax-grid">
              <div className="ax-col" style={{ gap: 6 }}>
                <strong>Включено</strong>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {pkg.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="ax-col" style={{ gap: 6 }}>
                <strong>Не входит</strong>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {pkg.excludes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
