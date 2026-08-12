import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Download, ShieldCheck, X, RefreshCw, Smartphone } from 'lucide-react';

export default function PaymentModal({ paymentData, onClose, onPaymentComplete }) {
  const [gateway, setGateway] = useState('TELEBIRR'); // 'TELEBIRR' or 'CHAPA'
  const [phone, setPhone] = useState('0911234567');
  const [pin, setPin] = useState('••••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedReceipt = {
        receiptNo: 'REC-EAF-2026-' + Math.floor(100000 + Math.random() * 900000),
        txnRef: (gateway === 'TELEBIRR' ? 'TLB_' : 'CHP_') + Math.random().toString(36).substring(2, 12).toUpperCase(),
        gateway: gateway === 'TELEBIRR' ? 'Telebirr SuperApp Gateway' : 'Chapa Payment Engine',
        payerName: paymentData.athleteName || paymentData.clubName || 'Athlete Registry',
        description: paymentData.description || 'Annual Federation Athlete Licensing Fee',
        amountEtb: paymentData.amount || 500,
        timestamp: new Date().toLocaleString(),
        status: 'PAID_CERTIFIED'
      };

      setReceipt(generatedReceipt);
      onPaymentComplete(generatedReceipt);
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, padding: '32px 16px' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '40px 48px', maxWidth: '720px', width: '95%', margin: '30px auto', borderRadius: '24px', boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
              e-Transactions Payment Gateway
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Proclamation No. 1205/2020 & Payment Systems Proclamation 718/2011
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 12px' }}>✕</button>
        </div>

        {!receipt ? (
          <div>
            {/* Amount Banner */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>PAYMENT ITEM</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {paymentData.description || 'Annual Federation Licensing Renewal'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#00A859', fontWeight: 700, marginTop: '2px' }}>
                  For: {paymentData.athleteName}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL DUE</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-mono)' }}>
                  {(paymentData.amount || 500).toLocaleString()} ETB
                </div>
              </div>
            </div>

            {/* Select Gateway */}
            <div className="form-group">
              <label className="form-label">Select Certified Payment Provider</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setGateway('TELEBIRR')}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    border: gateway === 'TELEBIRR' ? '2px solid #00A3E0' : '1px solid rgba(203, 213, 225, 0.8)',
                    background: gateway === 'TELEBIRR' ? 'rgba(0, 163, 224, 0.12)' : '#F8FAFC',
                    color: 'var(--text-main)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Smartphone size={24} color="#00A3E0" />
                  <span>Telebirr Mobile Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('CHAPA')}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    border: gateway === 'CHAPA' ? '2px solid #10B981' : '1px solid rgba(203, 213, 225, 0.8)',
                    background: gateway === 'CHAPA' ? 'rgba(16, 185, 129, 0.12)' : '#F8FAFC',
                    color: 'var(--text-main)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CreditCard size={24} color="#10B981" />
                  <span>Chapa / Local Cards</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleProcessPayment}>
              {gateway === 'TELEBIRR' ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Telebirr Mobile Account Number</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09... / 07..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telebirr Wallet PIN</label>
                    <input 
                      type="password"
                      className="form-input"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Cardholder Name / Chapa ID</label>
                    <input 
                      type="text"
                      className="form-input"
                      defaultValue={paymentData.athleteName || 'Demisse Tadesse'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number (Local CBE Birr / Visa / Mastercard)</label>
                    <input 
                      type="text"
                      className="form-input"
                      defaultValue="4111 •••• •••• 9012"
                      required
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={gateway === 'TELEBIRR' ? 'btn-telebirr' : 'btn-chapa'}
                style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '1rem' }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Processing Encrypted Transaction...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Confirm Payment of {(paymentData.amount || 500).toLocaleString()} ETB
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Certified E-Receipt View */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(0, 168, 89, 0.12)',
              border: '2px solid #00A859',
              color: '#00A859',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
              Transaction Successful!
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#00A859', fontWeight: 700, marginBottom: '20px' }}>
              Official Ethiopian Athletic Federation E-Receipt Generated
            </p>

            {/* Receipt Details Box */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '8px' }}>
                <span>Receipt Number:</span>
                <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{receipt.receiptNo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transaction Ref:</span>
                <strong style={{ color: '#D97706', fontFamily: 'var(--font-mono)' }}>{receipt.txnRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Gateway:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.gateway}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payer Name:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.payerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Description:</span>
                <strong style={{ color: 'var(--text-main)' }}>{receipt.description}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '8px' }}>
                <span>Amount Paid:</span>
                <strong style={{ color: '#00A859', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>{receipt.amountEtb.toLocaleString()} ETB</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Close & Return to Dashboard
              </button>
              <button 
                onClick={() => alert("Downloading PDF Receipt...")}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
