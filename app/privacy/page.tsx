import { LegalPageShell } from '@/components/legal-page-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Project HERMES',
  description:
    'How Project HERMES collects, uses, and protects personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="April 3, 2026">
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy describes how Project HERMES handles personal
          information when you use our websites, applications, and related
          services. If you use HERMES on behalf of an organization, that
          organization may have additional policies that also apply.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <p>Depending on how you use the Service, we may collect:</p>
        <ul>
          <li>
            <strong>Account data:</strong> such as email address, name, and
            credentials when you register or sign in (often processed by our
            authentication provider).
          </li>
          <li>
            <strong>Operational data:</strong> such as incident reports,
            messages, attachments, or other content you submit through the
            Service.
          </li>
          <li>
            <strong>Technical data:</strong> such as IP address, device and
            browser type, approximate location derived from IP, and timestamps.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, secure, and improve the Service.</li>
          <li>Authenticate users and enforce access controls.</li>
          <li>
            Facilitate incident reporting and communication among authorized
            stakeholders.
          </li>
          <li>Respond to requests and communicate about the Service.</li>
          <li>Comply with law and protect rights, safety, and security.</li>
        </ul>
      </section>

      <section>
        <h2>4. Sharing</h2>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> who host data, provide
            authentication, analytics, or other infrastructure, under
            contractual safeguards.
          </li>
          <li>
            <strong>Your organization</strong> when the Service is deployed for
            their use.
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect
            safety.
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>5. Retention</h2>
        <p>
          We retain information for as long as needed to provide the Service,
          comply with law, resolve disputes, and enforce agreements. Retention
          periods may depend on your organization&apos;s settings and applicable
          regulations.
        </p>
      </section>

      <section>
        <h2>6. Security</h2>
        <p>
          We implement technical and organizational measures designed to protect
          personal information. No method of transmission or storage is
          completely secure; we encourage strong passwords and safe handling of
          credentials.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          delete, or export your personal information, or to object to or
          restrict certain processing. You may also have the right to lodge a
          complaint with a supervisory authority. To exercise these rights,
          contact us or your organization&apos;s administrator as appropriate.
        </p>
      </section>

      <section>
        <h2>8. Age</h2>
        <p>
          The Service is not directed at children under 13 (or the age required
          by local law). We do not knowingly collect personal information from
          children. If you believe we have, contact us and we will take steps to
          delete it.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the
          revised policy and update the &quot;Last updated&quot; date. Material
          changes may be communicated through the Service or by email where
          appropriate.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          For privacy questions or requests, contact the team responsible for
          your HERMES deployment, or use the contact method published on the
          Service.
        </p>
      </section>
    </LegalPageShell>
  );
}
