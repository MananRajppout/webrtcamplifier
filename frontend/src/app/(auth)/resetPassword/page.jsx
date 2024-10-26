'use client'
import PasswordResetUI from '@/components/authComponent/PasswordResetUI'
import Logo from '@/components/shared/Logo'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

const page = () => {
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  console.log('token', token)
  return (
    <div>
    <div className="flex justify-center items-center pt-5 lg:hidden">
      <Logo />
    </div>
    <div className="pt-5 pl-10 lg:block hidden">
      {' '}
      <Logo />
    </div>
    <PasswordResetUI />
  </div>
  )
}

export default page