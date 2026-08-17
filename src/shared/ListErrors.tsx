import type { Errors } from '../core/models';

export function ListErrors({ errors }: { errors: Errors | null }) {
  const errorList = errors ? Object.keys(errors.errors || {}).map(key => `${key} ${errors.errors[key]}`) : [];

  if (!errorList.length) {
    return null;
  }

  return (
    <ul className="error-messages">
      {errorList.map(error => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
