import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { IUser } from "@/types/User";
import { Badge } from "@/components/ui/badge";

interface WarehouseUsersProps {
  users: IUser[];
}

export const WarehouseUsers = ({ users }: WarehouseUsersProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Login</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.login}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  // onClick={() => onDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};