import { currentAdmin } from "../../lib/auth";
import Login from "./login";
import AdminResponses from "./responses";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const username = await currentAdmin();
  return username ? <AdminResponses username={username} /> : <Login />;
}
