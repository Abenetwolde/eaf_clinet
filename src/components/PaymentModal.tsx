import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  ExternalLink,
  QrCode,
  Zap,
  Lock,
  Building,
  Award,
  Calendar,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  useInitiateEventPaymentMutation,
  useInitiateLicensePaymentMutation,
  useInitiateClubMembershipPaymentMutation,
  useInitiateClubRegistrationPaymentMutation,
  useLazyVerifyPaymentStatusQuery,
} from '../store/api/paymentApi';

export interface PaymentModalProps {
  paymentData: {
    type?: 'EVENT_REGISTRATION' | 'ATHLETE_LICENSE' | 'COACH_LICENSE' | 'CLUB_MEMBERSHIP_FEE' | 'CLUB_REGISTRATION_FEE';
    eventId?: string;
    athleteId?: string;
    coachId?: string;
    clubId?: string;
    athleteName?: string;
    clubName?: string;
    description?: string;
    amount?: number;
    disciplines?: string[];
    [key: string]: any;
  };
  onClose: () => void;
  onPaymentComplete: (receipt: any) => void;
}

export default function PaymentModal({ paymentData, onClose, onPaymentComplete }: PaymentModalProps) {
  const [step, setStep] = useState<'INIT' | 'AWAITING_PAYMENT' | 'COMPLETED'>('INIT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Payment State
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [showEmbeddedH5, setShowEmbeddedH5] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Mutations
  const [initiateEventPayment] = useInitiateEventPaymentMutation();
  const [initiateLicensePayment] = useInitiateLicensePaymentMutation();
  const [initiateClubMembershipPayment] = useInitiateClubMembershipPaymentMutation();
  const [initiateClubRegistrationPayment] = useInitiateClubRegistrationPaymentMutation();
  const [triggerVerifyStatus] = useLazyVerifyPaymentStatusQuery();

  const amount = paymentData.amount || 500;
  const description = paymentData.description || 'Federation Membership & Service Fee';
  const payerName = paymentData.athleteName || paymentData.clubName || 'Federation Member';

  // Determine service type icon
  const getServiceIcon = () => {
    if (paymentData.eventId || paymentData.type === 'EVENT_REGISTRATION') {
      return <Calendar size={20} className="text-[#00A3E0]" />;
    }
    if (paymentData.clubId || paymentData.type === 'CLUB_MEMBERSHIP_FEE' || paymentData.type === 'CLUB_REGISTRATION_FEE') {
      return <Building size={20} className="text-[#00A3E0]" />;
    }
    return <Award size={20} className="text-[#00A3E0]" />;
  };

  // Open H5 Checkout in a clean, centered popup window
  const openH5Window = (url: string) => {
    const width = 480;
    const height = 740;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(url, 'TelebirrCheckout', `width=${width},height=${height},left=${left},top=${top}`);
  };

  // Initiate Payment with Telebirr Gateway
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let resultData: any = null;

      // 1. Event Registration
      if (paymentData.eventId || paymentData.type === 'EVENT_REGISTRATION') {
        const res = await initiateEventPayment({
          eventId: paymentData.eventId || 'event-default',
          athleteId: paymentData.athleteId || 'athlete-default',
          amount,
          disciplines: paymentData.disciplines || [],
        }).unwrap();
        resultData = res.data;
      }
      // 2. Club Initial Registration Fee
      else if (paymentData.type === 'CLUB_REGISTRATION_FEE') {
        const res = await initiateClubRegistrationPayment({
          clubId: paymentData.clubId || 'club-default',
          amount,
        }).unwrap();
        resultData = res.data;
      }
      // 3. Club Annual Membership / Renewal Fee
      else if (paymentData.clubId || paymentData.type === 'CLUB_MEMBERSHIP_FEE') {
        const res = await initiateClubMembershipPayment({
          clubId: paymentData.clubId || 'club-default',
          amount,
        }).unwrap();
        resultData = res.data;
      }
      // 4. Athlete / Coach Licensing Fee
      else {
        const isCoach = paymentData.type === 'COACH_LICENSE' || Boolean(paymentData.coachId);
        const res = await initiateLicensePayment({
          type: isCoach ? 'COACH' : 'ATHLETE',
          athleteId: paymentData.athleteId,
          coachId: paymentData.coachId,
          amount,
        }).unwrap();
        resultData = res.data;
      }

      if (resultData?.reference) {
        setActiveReference(resultData.reference);
        const resolvedCheckoutUrl = resultData.checkoutUrl || `http://localhost:3000/api/v1/payments/telebirr/h5-checkout?reference=${encodeURIComponent(resultData.reference)}`;
        setCheckoutUrl(resolvedCheckoutUrl);
        setStep('AWAITING_PAYMENT');
        openH5Window(resolvedCheckoutUrl);
      } else {
        throw new Error('Failed to retrieve transaction reference from Telebirr.');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      const msg = err?.data?.message || err?.message || 'Unable to connect to Telebirr B2B gateway. Please verify your connection and try again.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Polling Effect when awaiting payment
  useEffect(() => {
    if (step !== 'AWAITING_PAYMENT' || !activeReference) return;

    let pollCount = 0;
    const maxPolls = 60; // 2.5 minutes total (60 * 2.5s)

    const interval = setInterval(async () => {
      pollCount++;
      try {
        const res = await triggerVerifyStatus(activeReference).unwrap();
        if (res?.data?.status === 'PAID') {
          clearInterval(interval);
          handlePaymentSuccess(res.data);
        } else if (res?.data?.status === 'FAILED' || res?.data?.status === 'EXPIRED') {
          clearInterval(interval);
          setErrorMsg(`Payment order ${res.data.status.toLowerCase()} on Telebirr gateway. Please try again.`);
          setStep('INIT');
        }
      } catch (err: any) {
        if (err?.status === 404) {
          clearInterval(interval);
          setErrorMsg(`Payment reference ${activeReference} could not be located in gateway records.`);
          setStep('INIT');
        }
      }

      if (pollCount >= maxPolls) {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [step, activeReference]);

  // Listen for instant postMessage from Telebirr H5 Portal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TELEBIRR_PAYMENT_SUCCESS') {
        if (activeReference && event.data.reference === activeReference) {
          handlePaymentSuccess(event.data.payment || { reference: activeReference });
        }
      } else if (event.data?.type === 'TELEBIRR_PAYMENT_FAILED') {
        if (activeReference && event.data.reference === activeReference) {
          setErrorMsg(event.data.message || 'Telebirr B2B payment authorization was rejected.');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeReference]);

  const handlePaymentSuccess = (paymentObj: any) => {
    const generatedReceipt = {
      receiptNo: 'REC-EAF-2026-' + (paymentObj.reference?.slice(-6) || Math.floor(100000 + Math.random() * 900000)),
      txnRef: paymentObj.externalTransactionId || 'TLB_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      gateway: 'Ethio Telecom Telebirr H5 C2B Web Checkout',
      payerName,
      description,
      amountEtb: amount,
      timestamp: new Date().toLocaleString(),
      status: 'PAID_CERTIFIED',
    };

    setReceipt(generatedReceipt);
    setStep('COMPLETED');
    onPaymentComplete(generatedReceipt);
  };

  // Manual Gateway Status Check
  const handleManualCheckStatus = async () => {
    if (!activeReference) return;
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await triggerVerifyStatus(activeReference).unwrap();
      if (res?.data?.status === 'PAID') {
        handlePaymentSuccess(res.data);
      } else if (res?.data?.status === 'FAILED' || res?.data?.status === 'EXPIRED') {
        setErrorMsg(`Payment order status is ${res.data.status}. The transaction was not completed.`);
      } else {
        setErrorMsg('Payment is currently awaiting authorization (WAIT_PAY). Complete the form in the Telebirr window to finish.');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Unable to verify payment status at this time.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '32px 16px' }}>
      <div
        className="modal-content main-pad"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: showEmbeddedH5 ? '880px' : '640px',
          width: '95vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          margin: 'auto',
          borderRadius: '24px',
          boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)',
          background: 'var(--bg-card, #FFFFFF)',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00A3E0, #0077B6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 163, 224, 0.3)',
              }}
            >
              <Smartphone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                Telebirr C2B Payment Gateway
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                Ethio Telecom Fabric API • H5 C2B Web Checkout Integration
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '50%' }}>
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '12px', marginBottom: '16px', fontSize: '0.88rem' }}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: INITIAL CHECKOUT VIEW */}
        {step === 'INIT' && (
          <div>
            {/* Amount Banner */}
            <div
              className="wrap-on-mobile"
              style={{
                background: '#F8FAFC',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 163, 224, 0.1)', borderRadius: '12px' }}>
                  {getServiceIcon()}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>PAYMENT SERVICE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{description}</div>
                  <div style={{ fontSize: '0.78rem', color: '#00A859', fontWeight: 700, marginTop: '2px' }}>
                    Beneficiary: {payerName}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL DUE</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-mono)' }}>
                  {amount.toLocaleString()} ETB
                </div>
              </div>
            </div>

            {/* Certified Gateway Card */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Certified C2B Payment Provider
              </label>
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '2px solid #00A3E0',
                  background: 'rgba(0, 163, 224, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'white',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00A3E0',
                    }}
                  >
                    <Smartphone size={26} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>
                      Ethio Telecom Telebirr C2B
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      H5 C2B Web Checkout • Customer Phone &amp; PIN / QR Code • BuyGoods
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    background: '#00A3E0',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    letterSpacing: '0.5px',
                  }}
                >
                  C2B ACTIVE
                </span>
              </div>
            </div>

            {/* Security Assurance Box */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <ShieldCheck size={22} color="#00A3E0" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: '#0369A1', lineHeight: 1.5 }}>
                <strong>Official Federation C2B Gateway:</strong> Pre-ordered via Ethio Telecom API Fabric
                with SHA256withRSA signature. Authenticate on the C2B checkout window by entering your telebirr phone number &amp; PIN or scanning the QR code with telebirr SuperApp.
              </div>
            </div>

            <form onSubmit={handleInitiatePayment}>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00A3E0, #0077B6)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(0, 163, 224, 0.35)',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Connecting to Ethio Telecom C2B Fabric...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Proceed to Telebirr C2B Checkout ({amount.toLocaleString()} ETB)
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: AWAITING PAYMENT (C2B H5 EMBED/POPUP + SIMULATOR) */}
        {step === 'AWAITING_PAYMENT' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 163, 224, 0.1)',
                  color: '#00A3E0',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                }}
              >
                <RefreshCw className="animate-spin" size={14} />
                Awaiting Telebirr C2B Authorization...
              </div>

              {/* Toggle Embedded H5 Portal vs QR Card */}
              {showEmbeddedH5 && activeReference ? (
                <div style={{ margin: '0 auto 16px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #00A3E0' }}>
                  <iframe
                    src={`http://localhost:3000/api/v1/payments/telebirr/h5-checkout?reference=${encodeURIComponent(activeReference)}&preview=true`}
                    title="Telebirr H5 C2B Portal"
                    style={{ width: '100%', height: '520px', border: 'none', background: 'white' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto 16px',
                    background: 'white',
                    border: '2px solid #00A3E0',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0, 163, 224, 0.15)',
                  }}
                >
                  <QrCode size={110} color="#0F172A" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00A3E0', marginTop: '6px' }}>
                    TELEBIRR C2B CHECKOUT
                  </span>
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Order Reference:{' '}
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {activeReference}
                </strong>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706' }}>
                {amount.toLocaleString()} ETB
              </div>

              {/* Action Buttons: Open Portal & Toggle Embed */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {checkoutUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => openH5Window(checkoutUrl)}
                      className="btn-primary"
                      style={{
                        background: '#00A3E0',
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        color: 'white',
                        fontWeight: 800,
                      }}
                    >
                      <ExternalLink size={15} />
                      Open Telebirr C2B Portal
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmbeddedH5(!showEmbeddedH5)}
                      className="btn-secondary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                      }}
                    >
                      {showEmbeddedH5 ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                      {showEmbeddedH5 ? 'Show Card View' : 'Embed Portal in Modal'}
                    </button>

                    <button
                      type="button"
                      onClick={handleManualCheckStatus}
                      disabled={isVerifying}
                      className="btn-secondary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        color: '#0077B6',
                        fontWeight: 800,
                      }}
                    >
                      <RefreshCw className={isVerifying ? "animate-spin" : ""} size={15} />
                      {isVerifying ? 'Checking Status...' : 'Check Payment Status'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
              Cancel Transaction
            </button>
          </div>
        )}


        {/* STEP 3: CERTIFIED OFFICIAL E-RECEIPT VIEW */}
        {step === 'COMPLETED' && receipt && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(0, 168, 89, 0.12)',
                border: '2px solid #00A859',
                color: '#00A859',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
              Payment Confirmed!
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#00A859', fontWeight: 700, marginBottom: '20px' }}>
              Official Ethiopian Athletics Federation E-Receipt Generated
            </p>

            {/* Receipt Box */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                borderRadius: '18px',
                padding: '22px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                lineHeight: 1.8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '8px' }}>
                <span>Receipt Number:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {receipt.receiptNo}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Telebirr Transaction No:</span>
                <strong style={{ color: '#00A3E0', fontFamily: 'var(--font-mono)' }}>{receipt.txnRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Gateway:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.gateway}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Beneficiary:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.payerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Item:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.description}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '8px' }}>
                <span>Amount Paid:</span>
                <strong style={{ color: '#00A859', fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>
                  {receipt.amountEtb.toLocaleString()} ETB
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onClose} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                Close & Return
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={16} />
                Print / Save Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
