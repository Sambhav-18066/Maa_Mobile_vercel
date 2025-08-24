"use client";
export default function OrderTimeline({order}){
  const timeline = order?.status_timestamps || {};
  const steps = [
    {key:"PLACED", label:"Order Placed"},
    {key:"APPROVED", label:"Approved"},
    {key:"OUT_FOR_DELIVERY", label:"Out for Delivery"},
    {key:"DELIVERED", label:"Delivered"}
  ];
  return (
    <div style={{display:"grid", gap:8}}>
      {steps.map((s, idx)=>{
        const ts = timeline[s.key];
        const done = !!ts;
        return (
          <div key={s.key} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:18,height:18,borderRadius:999, border:"2px solid var(--blue,#3b82f6)", background: done ? "var(--blue,#3b82f6)" : "transparent"}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{s.label}</div>
              <div className="small">{done ? new Date(ts).toLocaleString() : "Pending"}</div>
            </div>
          </div>
        );
      })}
      {order?.eta && (
        <div className="small"><strong>Expected delivery:</strong> {new Date(order.eta).toLocaleString()}</div>
      )}
    </div>
  );
}
