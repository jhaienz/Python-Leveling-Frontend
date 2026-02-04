import { AnnouncementForm } from '@/components/admin/announcement-form';

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Announcement</h1>
        <p className="text-muted-foreground">Create a new announcement</p>
      </div>
      <AnnouncementForm />
    </div>
  );
}
