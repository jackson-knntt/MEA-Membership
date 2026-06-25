import Image from "next/image";
import "../globals.css";

export const metadata = {
  title: "Welcome to The Middle East Association",
  description: "Your Corporate Membership application has been received.",
};

export default function SuccessPage() {
  return (
    <>
      {/* ── Header ── */}
      <div className="header">
        <div className="header-inner">
          <div className="logo-wrap">
            <Image src="/mea-logo.png" alt="The Middle East Association" width={64} height={64} />
          </div>
          <div className="header-text">
            <h1>The Middle East Association</h1>
            <p>Corporate Membership</p>
          </div>
        </div>
      </div>
      <div className="header-bar" />

      <div className="form-wrap">
        <div className="form-card">

          {/* ── Confirmation header ── */}
          <div className="section-header" style={{ background: "#1e6b3c" }}>
            <div className="section-icon">✅</div>
            <div>
              <h2>Payment received — welcome to the MEA</h2>
              <p>Your Corporate Membership is now active</p>
            </div>
          </div>

          <div className="form-body">

            <p className="intro-text">
              Thank you for joining The Middle East Association. We are delighted to welcome
              you as a Corporate Member and look forward to connecting you with our network
              of leaders, policymakers, and regional experts across the UK and MENA.
            </p>

            {/* What happens next */}
            <div className="benefits-label" style={{ marginTop: 28 }}>What happens next</div>
            <div className="success-steps">

              <div className="success-step">
                <div className="success-step-number">1</div>
                <div>
                  <div className="success-step-title">MEA Newsletter</div>
                  <p className="success-step-body">
                    You will begin receiving the MEA newsletter at the start or end of each month,
                    featuring political, economic, and regional analysis from across MENA.
                    Please check your spam or junk folder if you do not receive it within the
                    first month — and mark us as a trusted sender to ensure future issues arrive safely.
                  </p>
                </div>
              </div>

              <div className="success-step">
                <div className="success-step-number">2</div>
                <div>
                  <div className="success-step-title">Event Invitations</div>
                  <p className="success-step-body">
                    As a Corporate Member you will receive invitations to MEA events throughout
                    the year, including private briefings, flagship receptions, roundtables,
                    and the Annual Gala Dinner. Keep an eye on your inbox for upcoming events.
                  </p>
                </div>
              </div>

              <div className="success-step">
                <div className="success-step-number">3</div>
                <div>
                  <div className="success-step-title">Follow us on LinkedIn</div>
                  <p className="success-step-body">
                    Stay up to date with MEA news, events, and analysis by following us on
                    LinkedIn. We will also be launching a dedicated MEA Members LinkedIn group
                    shortly — we will be in touch when it is live.
                  </p>
                </div>
              </div>

              <div className="success-step">
                <div className="success-step-number">4</div>
                <div>
                  <div className="success-step-title">Get in touch</div>
                  <p className="success-step-body">
                    If you have any questions about your membership or would like to discuss
                    engagement opportunities, please contact us at{" "}
                    <a href="mailto:membership@the-mea.com" className="success-link">
                      membership@the-mea.com
                    </a>
                    .
                  </p>
                </div>
              </div>

            </div>

            {/* LinkedIn CTA */}
            <div className="who-box" style={{ marginTop: 32 }}>
              <div className="who-label">Connect with us</div>
              <p>
                Follow The Middle East Association on LinkedIn to stay informed on events,
                member news, and developments across the MENA region.
              </p>
              <a
                href="https://www.linkedin.com/company/the-middle-east-association"
                target="_blank"
                rel="noopener noreferrer"
                className="submit-btn"
                style={{ display: "inline-block", marginTop: 16, textDecoration: "none", textAlign: "center", padding: "12px 28px", width: "auto" }}
              >
                Follow MEA on LinkedIn →
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
