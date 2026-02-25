interface SkeletonProps {
  height: number | string;
  width?: number | string;
  radius?: number | string;
}

export function Skeleton({ height, width = '100%', radius = 12 }: SkeletonProps) {
  return <div className="ax-skeleton" style={{ height, width, borderRadius: radius }} />;
}
