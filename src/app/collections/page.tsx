import { redirect } from 'next/navigation';

// The collections page is hidden for now — the product preview lives in the
// sticky scroll section on the landing page, so anyone hitting /collections
// gets sent there. The original grid page is preserved in git history
// (see this file before the redesign-one merge) if you want it back later.
export default function CollectionsPage() {
  redirect('/#collection');
}
