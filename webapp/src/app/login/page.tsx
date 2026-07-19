import LoginForm from './LoginForm'

export const metadata = {
  title: 'Bejelentkezés - HelyiKamra',
  description: 'Jelentkezz be kistermelői vagy vásárlói fiókodba.',
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <LoginForm />
    </div>
  )
}
