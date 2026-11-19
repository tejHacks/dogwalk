import { AccountScreen } from '@/components/account';
import { Avatar, ListItem, SectionTitle } from '@/components/ui';
import { useDogs, useSession } from '@/data/store';
import { sizeLabel } from '@/data/walkers';

export default function CustomerAccount() {
  const [user] = useSession();
  const [dogs] = useDogs();
  const mine = dogs.filter((d) => d.ownerId === user?.id);
  return (
    <AccountScreen>
      <SectionTitle>Your dogs</SectionTitle>
      {mine.map((d) => (
        <ListItem key={d.id} title={d.name} subtitle={[d.breed, sizeLabel[d.size], d.ageYears ? `${d.ageYears} yrs` : ''].filter(Boolean).join(' · ')} leading={<Avatar name={d.name} size={42} />} />
      ))}
    </AccountScreen>
  );
}
