"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, History, LayoutDashboard, PlusCircle, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

import { useGenerationStore } from "@/store/useGenerationStore";

export function NavBar() {
    const pathname = usePathname();
    const isFullscreen = useGenerationStore((state) => state.isFullscreen);
    const { user, isLoading } = useAuthStore();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    const navItems = [
        { name: "Create", href: "/create", icon: PlusCircle },
        { name: "History", href: "/history", icon: History },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ];

    if (isFullscreen) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    VisionPrompt
                </span>
            </Link>

            {pathname !== "/" && (
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <button
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                        isActive
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </button>
                            </Link>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center gap-4">
                {isLoading ? (
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                ) : user ? (
                    <div className="flex items-center gap-4 bg-white/5 pl-4 pr-1 py-1 rounded-full border border-white/10">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-medium text-white/90">
                                {user.displayName || user.email?.split('@')[0]}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="h-8 w-8 rounded-full hover:bg-white/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <Link href="/auth/login">
                            <Button variant="ghost" className="hover:bg-white/5 rounded-full">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="rounded-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25 border-0 transition-transform hover:scale-105">
                                Sign up
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
