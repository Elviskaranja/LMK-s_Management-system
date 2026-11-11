import { getInitials } from "./getInitials.js";

export default function Avatar({ fullName, email, className = "" }) {
  return (
    <div className={`avatar ${className}`.trim()} aria-hidden="true">
      {getInitials(fullName, email)}
    </div>
  );
}
