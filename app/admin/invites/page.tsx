import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/control-center/team?tab=invites');
}
