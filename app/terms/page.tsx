import { LegalPageShell } from '@/components/legal-page-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Project HERMES',
  description:
    'Terms governing your use of Project HERMES, the DRRM communication control center.',
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="April 3, 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of Project HERMES (&quot;HERMES,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;), including our websites,
          applications, and related services (collectively, the
          &quot;Service&quot;). By using the Service, you agree to these Terms.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. The Service</h2>
        <p>
          HERMES is a centralized disaster risk reduction and management (DRRM)
          communication tool for incident reporting and information sharing.
          Features may change over time. We do not guarantee uninterrupted or
          error-free operation.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          You may need an account to use certain features. You agree to provide
          accurate information, keep your credentials confidential, and notify
          us promptly of unauthorized use. You are responsible for activity
          under your account.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the Service in violation of law or in a way that harms others.
          </li>
          <li>
            Attempt to gain unauthorized access to the Service, other accounts,
            or underlying systems.
          </li>
          <li>
            Upload malware, overload infrastructure, or interfere with other
            users.
          </li>
          <li>
            Misrepresent your identity, affiliation, or the origin of
            information you submit.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Emergency and safety</h2>
        <p>
          HERMES is not a substitute for official emergency services (e.g.
          police, fire, medical). For life-threatening emergencies, contact the
          appropriate local authorities. Information in the Service may be
          delayed or incomplete. You use the Service at your own risk in crisis
          situations.
        </p>
      </section>

      <section>
        <h2>6. Your content</h2>
        <p>
          You retain ownership of content you submit. You grant us a limited
          license to host, process, and display that content as needed to
          operate and improve the Service, consistent with our Privacy Policy
          and your settings.
        </p>
      </section>

      <section>
        <h2>7. Intellectual property</h2>
        <p>
          The Service, including its design, branding, and software, is owned by
          us or our licensors. Except as expressly allowed, you may not copy,
          modify, distribute, or create derivative works from the Service.
        </p>
      </section>

      <section>
        <h2>8. Disclaimer</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
      </section>

      <section>
        <h2>9. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
          SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE IS
          LIMITED TO THE GREATER OF THE AMOUNT YOU PAID US FOR THE SERVICE IN
          THE TWELVE MONTHS BEFORE THE CLAIM OR FIFTY DOLLARS (US$50), IF EITHER
          APPLIES.
        </p>
      </section>

      <section>
        <h2>10. Indemnity</h2>
        <p>
          You will defend and indemnify us against claims, damages, and expenses
          (including reasonable attorneys&apos; fees) arising from your content,
          your use of the Service, or your violation of these Terms.
        </p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate access to the Service if you breach these
          Terms or if we need to protect the Service or others. You may stop
          using the Service at any time. Provisions that by their nature should
          survive will survive termination.
        </p>
      </section>

      <section>
        <h2>12. Changes</h2>
        <p>
          We may update these Terms by posting a new version and updating the
          &quot;Last updated&quot; date. Continued use after changes constitutes
          acceptance. If you do not agree, discontinue use of the Service.
        </p>
      </section>

      <section>
        <h2>13. Governing law</h2>
        <p>
          These Terms are governed by the laws applicable to your organization
          or deployment, excluding conflict-of-law rules. Courts in the
          appropriate venue have exclusive jurisdiction, unless mandatory
          consumer protections require otherwise.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          For questions about these Terms, contact the team responsible for your
          HERMES deployment, or reach us through the contact method published on
          the Service.
        </p>
      </section>
    </LegalPageShell>
  );
}
