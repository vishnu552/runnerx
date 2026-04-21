import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { getUserOrders } from '@/lib/api';

export const metadata = {
  title: 'My Orders — RunnerX',
};

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const token = cookieStore.get('runnerx-user-token')?.value;
  const orders = await getUserOrders(token);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>My Orders</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {orders.length} transaction{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Column headings */}
      {orders.length > 0 && (
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr 0.8fr',
            padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
            borderBottom: '2px solid var(--border)',
          }}
        >
          <span>Order ID</span>
          <span>Date</span>
          <span>Type</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map((order) => (
            <details
              key={order.id}
              className="card"
              style={{
                border: '1px solid var(--border)', borderRadius: '10px',
                overflow: 'hidden', cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr 0.8fr',
                  padding: '16px 20px', alignItems: 'center',
                  listStyle: 'none', fontSize: '0.9rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                  #{String(order.id).padStart(6, '0')}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  color: order.orderType === 'REGISTRATION' ? '#00a0ff' : order.orderType === 'DONATION' ? '#7c3aed' : '#0891b2',
                }}>
                  {order.reason || order.orderType}
                </span>
                <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                  ₹{order.finalAmount?.toLocaleString('en-IN')}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                    background: order.paymentStatus === 'PAID' ? 'rgba(34,197,94,0.1)' : order.paymentStatus === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                    color: order.paymentStatus === 'PAID' ? '#22c55e' : order.paymentStatus === 'FAILED' ? '#ef4444' : '#eab308',
                    border: `1px solid ${order.paymentStatus === 'PAID' ? 'rgba(34,197,94,0.3)' : order.paymentStatus === 'FAILED' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  }}>
                    {order.paymentStatus}
                  </span>
                </span>
              </summary>

              {/* Expanded details */}
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                {/* Transaction Details */}
                <div style={{ padding: '16px 0' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Transaction Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Order ID:</span> <strong>#{String(order.id).padStart(6, '0')}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{order.contactEmail}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong>{order.contactPhone || '—'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span> <strong>{order.paymentMode || '—'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <strong>₹{order.amount?.toLocaleString('en-IN')}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Tax:</span> <strong>₹{order.taxAmount?.toLocaleString('en-IN')}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Final:</span> <strong>₹{order.finalAmount?.toLocaleString('en-IN')}</strong></div>
                    {order.invoiceNumber && (
                      <div><span style={{ color: 'var(--text-muted)' }}>Invoice:</span> <strong>{order.invoiceNumber}</strong></div>
                    )}
                  </div>
                </div>

                {/* Participant Details */}
                {order.registrations?.length > 0 && (
                  <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Participant Details</h4>
                    {order.registrations.map((reg) =>
                      reg.lineItems?.map((li, idx) => (
                        <div key={li.id} style={{
                          padding: '10px 14px', borderRadius: '8px',
                          background: 'var(--surface-alt)', border: '1px solid var(--border)',
                          marginBottom: '8px', fontSize: '0.85rem',
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Ticket {idx + 1}: {li.participantName}</div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {li.participantEmail} • {li.participantPhone} • {li.categoryNameSnapshot} ({li.distanceSnapshot}) • ₹{li.finalPriceSnapshot}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Donation Details */}
                {order.donations?.length > 0 && (
                  <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Charity Details</h4>
                    {order.donations.map((don) => (
                      <div key={don.id} style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)',
                        fontSize: '0.85rem',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{don.causeName} — {don.ngoName}</div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          ₹{don.amount} • {don.donorName} • Tax Exemption: {don.wantsTaxExemption ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            No Orders Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
            Your transaction history will appear here once you register for an event, purchase coupons, or make donations.
          </p>
        </div>
      )}
    </div>
  );
}
