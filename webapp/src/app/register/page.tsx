import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Regisztráció - HelyiKamra',
  description: 'Hozz létre vásárlói vagy kistermelői fiókot.',
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <RegisterForm />
    </div>
  )
}
