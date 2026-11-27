export function getBasePath(): string {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export function stripBasePath(pathname: string): string {
  const base = getBasePath();
  let stripped = pathname;
  if (base !== '/') {
    const baseNoTrailing = base.slice(0, -1);
    if (stripped.toLowerCase().startsWith(base.toLowerCase())) {
      stripped = stripped.slice(base.length);
    } else if (stripped.toLowerCase().startsWith(baseNoTrailing.toLowerCase())) {
      stripped = stripped.slice(baseNoTrailing.length);
    }
  }
  return stripped.replace(/^\/+|\/+$/g, '');
}

export function withBasePath(subpath: string): string {
  const base = getBasePath();
  const clean = subpath.replace(/^\/+/, '');
  return clean ? `${base}${clean}` : base;
}
