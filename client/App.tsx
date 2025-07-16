import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold text-primary mb-4">Deliveroo Test</h1>
      <p className="text-lg text-muted-foreground">
        If you can see this, the basic app is working!
      </p>
      <div className="mt-8 p-4 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-2">Test Features:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Tailwind CSS styling ✓</li>
          <li>CSS custom properties ✓</li>
          <li>React rendering ✓</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
