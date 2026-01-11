import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useAuth } from '@/context/AuthProvider';
import { useApproveUserRequest, useRejectUserRequest } from '@/hooks/useUsers';
import type { IUser } from '@/types/User'

interface RegisterRequestProps {
    user: IUser;
}

const RegisterRequest = ({user}: RegisterRequestProps) => {
    const {token} = useAuth();
    const approveMutation = useApproveUserRequest(token || "", user.id);
    const rejectMutation = useRejectUserRequest(token || "", user.id);

    const onApprove = () => {
        approveMutation.mutate();
    }
    const onReject = () => {
        rejectMutation.mutate();
    }

  return (
    <TableRow key={user.id}>
        <TableCell>{user.login}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="text-right space-x-2">
            <Button
            variant="default" 
            size="sm" 
            className="cursor-pointer bg-green-600 hover:bg-green-700"
            onClick={onApprove}
            >
            Approve
            </Button>
            <Button 
            variant="outline" 
            size="sm" 
            className="cursor-pointer border-1 text-red-600 border-red-600 hover:text-red-700 hover:border-red-700"
            onClick={onReject}
            >
            Reject
            </Button>
        </TableCell>
    </TableRow>
  )
}

export default RegisterRequest