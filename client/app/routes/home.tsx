
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to My App
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This is your home page built with React Router and Shadcn UI.
        </p>
        <Button onClick={() => alert("Hello!")}>Click Me</Button>
      </div>
    </div>
  );
}