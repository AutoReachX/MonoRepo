export default function TestSimple() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Frontend is Working!</h1>
      <p>If you can see this page, the Next.js app is running correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
    </div>
  );
}
