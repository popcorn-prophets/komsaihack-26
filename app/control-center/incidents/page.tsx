import ChatBox from '@/components/control-center/incidents/chatbox';
import { IncidentList } from '@/components/control-center/incidents/incident-list';

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6 h-screen">
      <IncidentList />
      <ChatBox />
    </div>
  );
}
