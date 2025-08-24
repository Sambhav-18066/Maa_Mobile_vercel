export default function Checkout() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p>Scan this QR to pay online:</p>
      <img src="/qr.png" alt="QR Payment" className="w-48"/>
      <a 
        href={`https://wa.me/91XXXXXXXXXX?text=I%20placed%20an%20order%20on%20MaaMobile`}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4 inline-block"
      >
        Send Order via WhatsApp
      </a>
    </div>
  );
}