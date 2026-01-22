'use client';

import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-1 items-center gap-4">
            {/* Search Global */}
            <div className="flex-1 max-w-xl relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Buscar pacientes, consultas ou documentos..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <div className="h-8 w-px bg-gray-200 mx-2" />

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="pl-0 hover:bg-transparent flex items-center gap-2">
                            <Avatar className="h-9 w-9 border border-gray-200">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                    {user?.displayName?.substring(0, 2).toUpperCase() || 'DR'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-none">{user?.displayName || 'Dr. Usuario'}</p>
                                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Configurações</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
