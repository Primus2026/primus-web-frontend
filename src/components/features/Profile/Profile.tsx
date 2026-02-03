import { useAuth } from '@/context/AuthProvider'
import { type FC, useState } from 'react'

import { useSetup2FA } from '@/hooks/use2FA'
import ProfileInformationCard from './ProfileInformationCard'
import ProfileSecurityCard from './ProfileSecurityCard'
import EditPasswordModal from './EditPasswordModal'
import Setup2FaModal from './Setup2FaModal'

const Profile: FC = () => {
    const { user, token } = useAuth()
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
    const [qrCodeImage, setQrCodeImage] = useState<string>("")
    const setup2FAMutation = useSetup2FA(token || "")

    const handleEnable2FA = () => {
        if (user?.is_2fa_enabled) {
            setIs2FAModalOpen(true)
            return
        }

        setup2FAMutation.mutate(undefined, {
            onSuccess: (data) => {
                console.log(data)
                setQrCodeImage(data.qr_code_image)
                setIs2FAModalOpen(true)
            },
            onError: (error) => {
                console.log(error)
            }
        })
    }

    

    if (!user) {
        return <div className="p-10 text-center">Loading profile...</div>
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                    <p className="text-muted-foreground mt-2">
                        Zarządzaj ustawieniami konta i preferencjami.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                <ProfileInformationCard user={user} />

                <ProfileSecurityCard user={user} setIsPasswordModalOpen={setIsPasswordModalOpen} handleEnable2FA={handleEnable2FA} />
            </div>

            {isPasswordModalOpen && (
               <EditPasswordModal setIsPasswordModalOpen={setIsPasswordModalOpen} />
            )}

            {is2FAModalOpen && (
                <Setup2FaModal 
                    token={token || ""} 
                    qrCodeImage={qrCodeImage} 
                    setIs2FAModalOpen={setIs2FAModalOpen} 
                    isEnabled={!!user?.is_2fa_enabled}
                />
            )}
        </div>
    )
}

export default Profile