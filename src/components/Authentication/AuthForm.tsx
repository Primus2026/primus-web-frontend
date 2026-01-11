
import { Card } from "@/components/ui/card"
import SignupView from "./SignUpView"
import { useState, type FC } from "react"
import LoginView from "./LoginView"


const AuthForm: FC = () => {
  const [isLoginView, setIsLoginView] = useState(true)

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        {isLoginView ? (
          <LoginView onToggle={() => setIsLoginView(false)} />
        ) : (
          <SignupView onToggle={() => setIsLoginView(true)} />
        )}
      </Card>
    </div>
  )
}

export default AuthForm