import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { IUser } from "@/types/User";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useDeleteUser } from "@/hooks/useUsers";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

interface WarehouseUsersProps {
  users: IUser[];
}

export const WarehouseUsers = ({ users }: WarehouseUsersProps) => {
  const { token } = useAuth();
  const deleteUserMutation = useDeleteUser(token || "");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const handleDeleteClick = (user: IUser) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
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
                    onClick={() => handleDeleteClick(user)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Potwierdź Usunięcie Użytkownika"
        message={`Czy na pewno chcesz usunąć użytkownika "${userToDelete?.login}"? Tej operacji nie można cofnąć.`}
        isLoading={deleteUserMutation.isPending}
      />
    </>
  );
};