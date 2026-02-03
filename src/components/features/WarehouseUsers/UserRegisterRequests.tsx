import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IUser } from "@/types/User";
import RegisterRequest from "./RegisterRequest";

interface RegisterRequestsProps {
  requests: IUser[];
}

export const UserRegisterRequests = ({ requests }: RegisterRequestsProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Login</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                Brak wniosków o rejestrację
              </TableCell>
            </TableRow>
          ) : (
            requests.map((user) => (
              <RegisterRequest user={user}/>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};