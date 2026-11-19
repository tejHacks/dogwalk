import { Redirect } from 'expo-router';

import { useOnboarded, useSession } from '@/data/store';

/** Sends people to the right place: onboarding → welcome → verify → setup → their home. */
export default function Gate() {
  const [onboarded, , onboardedReady] = useOnboarded();
  const [user, , sessionReady] = useSession();
  if (!onboardedReady || !sessionReady) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/welcome" />;
  if (!user.emailVerified) return <Redirect href={{ pathname: '/verify', params: { email: user.email, purpose: 'signup' } }} />;
  if (!user.profileComplete) return <Redirect href={user.role === 'walker' ? '/setup/walker' : '/setup/customer'} />;
  return <Redirect href={user.role === 'walker' ? '/(walker)' : '/(customer)'} />;
}
